import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createIsolatedContext } from "../property-extraction/scraper";

export async function getIndividualPropertyLinks(
  listingUrl: string,
): Promise<string[]> {
  console.log(`\n[Link Discovery] Visiting listing URL: ${listingUrl}`);

  // Reuse the existing shared browser to save memory
  let context;

  try {
    context = await createIsolatedContext();
    const page = await context.newPage();

    await page.goto(listingUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1000);

    const extractedLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a"));
      return anchors
        .map((a) => ({
          href: a.href,
          text: a.innerText?.trim().replace(/\n/g, " ") || "",
        }))
        .filter((link) => link.href && link.href.startsWith("http"))
        .filter(
          (link) =>
            !link.href.toLowerCase().includes("javascript:") &&
            !link.href.toLowerCase().includes("mailto:") &&
            link.text.length > 5,
        );
    });

    // Debug: log page title and link count to confirm page loaded
    const pageTitle = await page.title();
    console.log(`[Link Discovery] Page title: "${pageTitle}"`);
    console.log(
      `[Link Discovery] Total <a> tags found: ${extractedLinks.length}`,
    );
    if (extractedLinks.length > 0) {
      console.log(
        `[Link Discovery] First 3 links: ${JSON.stringify(extractedLinks.slice(0, 3))}`,
      );
    }

    await context.close(); // Close the isolated context when done

    console.log(
      `[Link Discovery] Found ${extractedLinks.length} raw links. Passing to LangChain for filtering...`,
    );

    const apiKey =
      process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("[Link Discovery] GOOGLE_API_KEY missing.");
      return [];
    }

    // Using gemini-2.5-flash as 3.5 isn't available yet in the standard API
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
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
          `[${i}] ${l.text} -> ${l.href}`,
      )
      .join("\n");

    const prompt = `
      You are an expert real estate data parser.
      I am giving you a raw list of links scraped from a real estate search results page.
     
      TASK:
      Find EXACTLY up to 3 URLs that point to INDIVIDUAL property detail pages.
     
      RULES:
      1. IGNORE search pages, pagination links, "contact us", "about", or privacy policy links.
      2. A property detail page usually has a specific property description in the text (e.g. "3 BHK Flat in X locality") and a long URL path often containing an ID or detailed slug.
      3. Return ONLY the URLs.
     
      RAW LINKS:
      ${linksText.slice(0, 4000)}
    `;

    const response = await structuredLlm.invoke(prompt);

    const rawMessage = response.raw as any;
    const usage =
      rawMessage.usage_metadata || rawMessage.response_metadata?.tokenUsage;
    if (usage) {
      console.log(
        `[Token Usage] Gemini consumed -> Input: ${usage.input_tokens || usage.promptTokens}, Output: ${usage.output_tokens || usage.completionTokens}, Total: ${usage.total_tokens || usage.totalTokens} tokens`,
      );
    }

    let propertyUrls = response.parsed?.propertyUrls || [];
    propertyUrls = propertyUrls.slice(0, 3); // Hardcode to exactly 3 detail pages max

    console.log(
      `[Link Discovery] LangChain successfully filtered to ${propertyUrls.length} detail pages.`,
    );
    return propertyUrls;
  } catch (error: any) {
    console.error(`[Link Discovery] FAILED for ${listingUrl}`);
    console.error(`[Link Discovery] Error name: ${error.name}`);
    console.error(`[Link Discovery] Error message: ${error.message}`);
    console.error(`[Link Discovery] Full stack: ${error.stack}`);

    return [];
  } finally {
    if (context) await context.close().catch(() => {});
  }
}
