import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  createIsolatedContext,
  navigatePage,
} from "../property-extraction/scraper";
import { isBlocked } from "../property-extraction/page-utils";
import logger from "@/lib/logger";

export async function getIndividualPropertyLinks(
  listingUrl: string,
  signal?: { aborted: boolean },
): Promise<{ propertyUrls: string[]; tokens: number }> {
  const MAX_RETRIES = 3;
  const BLOCK_PHRASES = ["Access Denied", "Just a moment", "Attention Required", "Precondition Failed", "403", "412", "Forbidden"];
  let extractedLinks: { href: string; text: string }[] = [];

  // Phase 1: Navigate and extract links (with retries for proxy blocks)
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let context;
    try {
      context = await createIsolatedContext();
      if (signal?.aborted) {
        await context.close();
        return { propertyUrls: [], tokens: 0 };
      }
      const page = await context.newPage();
      await navigatePage(page, listingUrl);

      // Block detection BEFORE extracting links (saves AI tokens)
      const pageTitle = await page.title();
      const pageHtml = await page.content();
      const blocked =
        BLOCK_PHRASES.some((p) => pageTitle.includes(p)) ||
        isBlocked(pageTitle, pageHtml);

      if (blocked) {
        await context.close();
        context = null;
        if (attempt < MAX_RETRIES) {
          logger.warn(
            `[Link Discovery] Attempt ${attempt}/${MAX_RETRIES}: Blocked ("${pageTitle}"). Retrying with fresh IP...`,
          );
          continue;
        }
        logger.warn(
          `[Link Discovery] All ${MAX_RETRIES} attempts blocked for ${listingUrl}. Giving up.`,
        );
        return { propertyUrls: [], tokens: 0 };
      }

    extractedLinks = await page.evaluate(() => {
      const results: { href: string; text: string }[] = [];
      const seen = new Set<string>();

      const addLink = (href: string, text: string) => {
        if (!href || !href.startsWith("http") || seen.has(href)) return;
        seen.add(href);
        results.push({ href, text });
      };

      document
        .querySelectorAll("[data-url], [data-propertyLink]")
        .forEach((el) => {
          let url =
            el.getAttribute("data-url") || el.getAttribute("data-propertyLink");

          if (url) {
            if (!url.startsWith("http")) {
              const prefix = url.startsWith("/") ? "" : "/";
              url = `https://www.squareyards.com${prefix}${url}`;
            }
            const text =
              (el as HTMLElement).innerText?.trim().replace(/\n/g, "") || "";
            addLink(url, text);
          }
        });

      document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
        addLink(a.href, a.innerText?.trim().replace(/\n/g, " ") || "");
      });
      return results.filter((link) => {
        const href = link.href.toLowerCase();

        // Pre-filter obvious noise/menu items to keep link lists clean
        if (href.includes("javascript:") || href.includes("mailto:"))
          return false;
        if (
          href.includes("/homeloan") ||
          href.includes("calculator") ||
          href.includes("/advice")
        )
          return false;
        if (
          href.includes("/contactus") ||
          href.includes("/terms") ||
          href.includes("/privacy")
        )
          return false;
        if (href.includes("/news/")) return false;
        if (href.includes("emi-") || href.includes("eligibility-"))
          return false;

        // Allow links with short/empty text IF the URL path looks like
        // a property detail slug (3+ path segments — typical of detail pages)
        const pathSegments = new URL(href).pathname.split("/").filter(Boolean);
        if (href.includes("squareyards.com/resale-")) return true;
        if (link.text.length > 5) return true;
        if (pathSegments.length >= 3) return true;

        return false;
      });
    });

      // Debug: log page title and link count to confirm page loaded
      logger.info(
        `🟡 [STEP 2/3] Extracting links from search page: "${pageTitle}" | Raw links: ${extractedLinks.length}`,
      );
      logger.info(
        `[DEBUG] All URLs found by Playwright: \n${extractedLinks.map((l: any) => l.href).join("\n")}`,
      );

      await context.close();
      context = null;
      break; // Navigation successful, exit retry loop
    } catch (error: any) {
      if (context) await context.close().catch(() => {});
      context = null;

      const isRetryable = ["ECONNRESET", "Timeout", "net::ERR_"].some(
        (p) => error.message?.includes(p) || error.name?.includes(p),
      );

      if (isRetryable && attempt < MAX_RETRIES) {
        logger.warn(
          `[Link Discovery] Attempt ${attempt}/${MAX_RETRIES}: ${error.message}. Retrying...`,
        );
        continue;
      }

      logger.error(`[Link Discovery] FAILED for ${listingUrl}: ${error.message}`);
      return { propertyUrls: [], tokens: 0 };
    } finally {
      if (context) await context.close().catch(() => {});
    }
  }

  // Phase 2: Skip AI call if no links were extracted
  if (extractedLinks.length === 0) {
    logger.info(`   └─ 🎟️ [STEP 2.1] No links to filter. Skipping AI call.`);
    return { propertyUrls: [], tokens: 0 };
  } // prevent double-close in finally

  // Phase 3: AI filtering of extracted links
  try {
    const apiKey =
      process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      logger.error("[Link Discovery] GOOGLE_API_KEY missing.");
      return { propertyUrls: [], tokens: 0 };
    }

    // Using gemini-2.5-flash as 3.5 isn't available yet in the standard API
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      maxRetries: 1,
    });

    const schema = z.object({
      propertyIndexes: z
        .array(z.number().int().nonnegative())
        .describe("Array of up to 3 index numbers from the link list that point to individual property detail pages"),
    });

    const structuredLlm = llm.withStructuredOutput(schema, {
      name: "extract_property_urls",
      includeRaw: true,
    });

    const linksText = extractedLinks
      .map(
        (l: { text: string; href: string }, i: number) =>
          `[${i}] ${l.text || "(no text)"} -> ${l.href}`,
      )
      .join("\n");

    const prompt = `
      You are an expert real estate data parser.
      I am giving you a numbered list of links scraped from a real estate search results page.
     
      TASK:
      Find EXACTLY up to 3 links that point to INDIVIDUAL property detail pages.
      Return ONLY the INDEX NUMBERS (e.g. 0, 33, 35) — do NOT return URLs.
     
     RULES:
      1. IGNORE search pages, pagination links, "contact us", "about", or privacy policy links.
      2. CRITICAL: DO NOT pick links for entire new development projects, builder pages, or entire building complexes (e.g. URLs ending in "/project"). You MUST ONLY pick links for single, individual property listings (like a specific resale flat).
      3. A property detail page usually has a specific property description in the text (e.g. "3 BHK Flat in X locality") and a long URL path often containing an ID or detailed slug.
      4. Some links may have "(no text)" — judge them purely by their URL pattern.
      5. Return ONLY the index numbers.
     
      NUMBERED LINKS:
      ${linksText.slice(0, 60000)}
    `;

    if (signal?.aborted) return { propertyUrls: [], tokens: 0 };
    const response = await structuredLlm.invoke(prompt);

    const rawMessage = response.raw as any;
    const usage =
      rawMessage.usage_metadata || rawMessage.response_metadata?.tokenUsage;
    // if (usage) {
    //   logger.info(
    //     `[Token Usage] Gemini consumed -> Input: ${usage.input_tokens || usage.promptTokens}, Output: ${usage.output_tokens || usage.completionTokens}, Total: ${usage.total_tokens || usage.totalTokens} tokens`,
    //   );
    // }
    const tokens = usage ? usage.total_tokens || usage.totalTokens : 0;

    const indexes = response.parsed?.propertyIndexes || [];
    const propertyUrls = indexes
      .filter((idx: number) => idx >= 0 && idx < extractedLinks.length)
      .slice(0, 3)
      .map((idx: number) => extractedLinks[idx].href);
    logger.info(
      `   └─ 🎟️ [STEP 2.1] Links Discovered: ${propertyUrls.length} | Tokens Used: ${tokens}`,
    );
    return { propertyUrls, tokens };
  } catch (error: any) {
    logger.error(`[Link Discovery] AI filtering FAILED for ${listingUrl}`);
    logger.error(`[Link Discovery] Error: ${error.message}`);
    return { propertyUrls: [], tokens: 0 };
  }
}
