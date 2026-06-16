import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  createIsolatedContext,
  navigatePage,
} from "../property-extraction/scraper";
import logger from "@/lib/logger";

export async function getIndividualPropertyLinks(
  listingUrl: string,
  signal?: { aborted: boolean },
): Promise<{ propertyUrls: string[]; tokens: number }> {
  // Reuse the existing shared browser to save memory
  let context;

  try {
    context = await createIsolatedContext();
    if (signal?.aborted) {
      await context.close();
      return { propertyUrls: [], tokens: 0 };
    }
    const page = await context.newPage();

    // Reuse the same smart navigation logic the scraper uses
    // (waits for body, key selectors, then a 3-5s human-like pause)
    await navigatePage(page, listingUrl);

    const extractedLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a"));
      return anchors
        .map((a) => ({
          href: a.href,
          text: a.innerText?.trim().replace(/\n/g, " ") || "",
        }))
        .filter((link) => link.href && link.href.startsWith("http"))
        .filter((link) => {
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
          const pathSegments = new URL(href).pathname
            .split("/")
            .filter(Boolean);
          if (link.text.length > 5) return true;
          if (pathSegments.length >= 3) return true;

          return false;
        });
    });

    // Debug: log page title and link count to confirm page loaded
    const pageTitle = await page.title();
    logger.info(
      `🟡 [STEP 2/3] Extracting links from search page: "${pageTitle}" | Raw links: ${extractedLinks.length}`,
    );
    logger.info(
      `[DEBUG] All URLs found by Playwright: \n${extractedLinks.join("\n")}`,
    );

    await context.close();
    context = null; // prevent double-close in finally

    // logger.info(
    //   `[Link Discovery] Found ${extractedLinks.length} raw links. Passing to LangChain for filtering...`,
    // );

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
      propertyUrls: z
        .array(z.string().url())
        .describe("Array of up to 3 individual property detail URLs"),
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
      I am giving you a raw list of links scraped from a real estate search results page.
     
      TASK:
      Find EXACTLY up to 3 URLs that point to INDIVIDUAL property detail pages.
     
     RULES:
      1. IGNORE search pages, pagination links, "contact us", "about", or privacy policy links.
      2. CRITICAL: DO NOT extract links for entire new development projects, builder pages, or entire building complexes (e.g. URLs ending in "/project"). You MUST ONLY extract links for single, individual property listings (like a specific resale flat).
      3. A property detail page usually has a specific property description in the text (e.g. "3 BHK Flat in X locality") and a long URL path often containing an ID or detailed slug.
      4. Some links may have "(no text)" — judge them purely by their URL pattern.
      5. Return ONLY the URLs.
     
      RAW LINKS:
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

    let propertyUrls = response.parsed?.propertyUrls || [];
    propertyUrls = propertyUrls.slice(0, 3); // Hardcode to exactly 3 detail pages max
    logger.info(
      `   └─ 🎟️ [STEP 2.1] Links Discovered: ${propertyUrls.length} | Tokens Used: ${tokens}`,
    );
    // logger.info(
    //   `[Link Discovery] LangChain successfully filtered to ${propertyUrls.length} detail pages.`,
    // );
    return { propertyUrls, tokens };
  } catch (error: any) {
    logger.error(`[Link Discovery] FAILED for ${listingUrl}`);
    logger.error(`[Link Discovery] Error name: ${error.name}`);
    logger.error(`[Link Discovery] Error message: ${error.message}`);
    logger.error(`[Link Discovery] Full stack: ${error.stack}`);

    return { propertyUrls: [], tokens: 0 };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}
