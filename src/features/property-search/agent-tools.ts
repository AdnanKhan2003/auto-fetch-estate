import { tool } from "langchain";
import crypto from "crypto";

import * as z from "zod";
import { getIndividualPropertyLinks } from "./link-extractor";
import {
  getQuotaMetrics,
  logTokensUsed,
} from "../property-extraction/ai-rate-limiter";
import { db } from "@/db";
import { propertyListing } from "@/db/schema";

export const searchRealEstateTool = tool(
  async ({ query }) => {
    console.log(`\n[Tool] Calling Serper API for: "${query}"...`);

    if (!process.env.SERPER_API_KEY) {
      return "Error: SERPER_API_KEY environment variable is missing.";
    }

    try {
      const targetSites =
        "site:99acres.com OR site:magicbricks.com OR site:nobroker.in OR site:squareyards.com";

      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: `${query} ${targetSites}`, num: 20 }),
      });

      const data = await response.json();

      const uniqueResults = [];
      const seenDomains = new Set();

      for (const r of data.organic || []) {
        try {
          const domain = new URL(r.link).hostname.replace("www.", "");

          if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            uniqueResults.push(r);
          }
        } catch (error) {
          console.log(error);
        }
      }

      const topResults = uniqueResults.slice(0, 4);

      console.log(
        `\n[Log] Picked ${topResults.length} listing URLs from Serper API.`,
      );

      const snippets = topResults.map(
        (r: any) => `- ${r.title}: ${r.snippet}\n  Link: ${r.link}`,
      );
      return snippets.length > 0 ? snippets.join("\n") : "No results found.";
    } catch (error: any) {
      return `Error calling Serper API: ${error.message}`;
    }
  },
  {
    name: "search_real_estate",
    description:
      "Search the web for real estate properties for sale. Returns search snippets and URLs.",
    schema: z.object({
      query: z
        .string()
        .describe("The full search query, e.g., '2 BHK sale in Vashi'"),
    }),
  },
);

export const discoverLinksTool = tool(
  async ({ listingUrl }) => {
    console.log(
      `\n[Log] Finding detailed pages for listing page: ${listingUrl}`,
    );
    const links = await getIndividualPropertyLinks(listingUrl);

    if (links.length === 0) {
      return "No individual property links found on this page.";
    }

    return `Found ${links.length} property detail links:\n${links.map((l) => `- ${l}`).join("\n")}`;
  },
  {
    name: "discover_property_links",
    description:
      "Extract individual property detail URLs from an aggregator search results listing page URL.",
    schema: z.object({
      listingUrl: z
        .string()
        .url()
        .describe("The URL of the search results page to scan."),
    }),
  },
);

export const scrapePropertyTool = tool(
  async ({ detailUrls }, config) => {
    const userId = config?.configurable?.userId;
    const writer = config?.configurable?.streamWriter;
    const encoder = new TextEncoder();
    const batchId = crypto.randomUUID();

    if (!userId) {
      console.error(
        "[Tool Error] User ID not supplied in configurable context.",
      );
      return "Error: User ID session lost.";
    }
    console.log(
      `\n[Tool] Direct scraper started for ${detailUrls.length} properties...`,
    );
    const CONCURRENCY_LIMIT = 2;

    for (let i = 0; i < detailUrls.length; i += CONCURRENCY_LIMIT) {
      const chunk = detailUrls.slice(i, i + CONCURRENCY_LIMIT);

      // Fire scrapes in parallel; return each result the moment it resolves
      await Promise.allSettled(
        chunk.map(async (url: string) => {
          try {
            console.log(`[Batch] Scraping: ${url}`);
            const { processUrl } =
              await import("../property-extraction/scraper");
            const result = await processUrl(url.trim(), batchId);

            if (result.status === "error") {
              throw new Error(result.error || "Scraping Failed");
            }
            console.log(`[Batch] Done: ${url}`);

            const newId = crypto.randomUUID();

            if (result.status === "success") {
              await logTokensUsed(result.tokensUsed);
            }

            await db.insert(propertyListing).values({
              id: newId,
              userId,
              url: url.trim(),
              title: result.data?.propertyTitle || null,
              propertyType: result.data?.propertyType || null,
              city: result.data?.city || null,
              location: result.data?.location || null,
              price: result.data?.price || null,
              carpetArea: result.data?.carpetArea || null,
              screenshotUrl: result.screenshotUrl || null,
              extractedData: result.data,
              status: "success",
              tokensUsed: result.tokensUsed,
            });

            const metrics = await getQuotaMetrics();

            const enrichedResult = {
              ...result,
              id: newId,
              rpdRemaining: metrics.rpdRemaining,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };

            // NDJSON: one JSON object per line, pushed immediately

            if (writer) {
              await writer.write(
                encoder.encode(
                  JSON.stringify({
                    type: "property_scraped",
                    data: enrichedResult,
                  }) + "\n",
                ),
              );
            }
          } catch (e: any) {
            console.log(`[Batch] Error on ${url}: ${e.message}`);
            const errorId = crypto.randomUUID();
            await db.insert(propertyListing).values({
              id: errorId,
              userId: userId,
              url: url.trim(),
              status: "error",
              errorMessage: e.message,
              tokensUsed: 0,
            });

            const metrics = await getQuotaMetrics();
            const errorResult = {
              url: url.trim(),
              id: errorId,
              status: "error",
              error: e.message,
              rpdRemaining: metrics.rpdRemaining,
              tokensUsed: 0,
            };

            if (writer) {
              await writer.write(
                encoder.encode(
                  JSON.stringify({
                    type: "property_scraped",
                    data: errorResult,
                  }) + "\n",
                ),
              );
            }
          }
        }),
      );

      if (i + CONCURRENCY_LIMIT < detailUrls.length) {
        console.log(
          `[Batch] Cooldown: Waiting 11 seconds before next chunk...`,
        );
        // allow target server & API limits to reset
        await new Promise((resolve) => setTimeout(resolve, 13000));
      }
    }
    return `COLLECTED_URLS: ${detailUrls.join(",")}`;
  },
  {
    name: "scrape_property_details",
    description:
      "Call this tool ONCE you have collected the individual property detail URLs. Pass an array of the detail URLs you discovered.",
    schema: z.object({
      detailUrls: z
        .array(z.string().url())
        .describe("The specific property detail URLs you discovered."),
    }),
  },
);
