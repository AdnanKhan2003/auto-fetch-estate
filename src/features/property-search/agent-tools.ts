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
import { and, eq } from "drizzle-orm";
import logger from "@/lib/logger";

export const searchRealEstateTool = tool(
  async ({ query }) => {
    if (!process.env.SERPER_API_KEY) {
      return "Error: SERPER_API_KEY environment variable is missing.";
    }

    try {
      const targetSites = "99acres magicbricks nobroker squareyards";
      logger.info(
        `\n🟢 [STEP 1/3] Starting AI Agent task... Searching for: "${query} ${targetSites}"`,
      );

      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: `${query} ${targetSites}`, num: 20 }),
      });

      const data = await response.json();

      logger.info(
        `\n📋 [DEBUG] Raw Serper results (${(data.organic || []).length} total):`,
      );
      (data.organic || []).forEach((r: any, i: number) => {
        logger.info(`   ${i + 1}. [${new URL(r.link).hostname}] ${r.link}`);
      });

      const allowedDomains = [
        "99acres",
        "magicbricks",
        "nobroker",
        "squareyards",
      ];

      const uniqueResults = [];
      const seenDomains = new Set();

      for (const r of data.organic || []) {
        try {
          const domain = new URL(r.link).hostname.replace("www.", "");

          const matchesTarget = allowedDomains.find((allowed) =>
            domain.includes(allowed),
          );

          if (matchesTarget && !seenDomains.has(matchesTarget)) {
            seenDomains.add(matchesTarget);
            uniqueResults.push(r);
          }
        } catch (error) {
          logger.info(error);
        }
      }

      const missingDomains = allowedDomains.filter((d) => !seenDomains.has(d));
      logger.info(`\n[:D] Missing domains: ${missingDomains.join(", ")}`);

      if (missingDomains.length > 0) {
        logger.info(
          `\n🔄 [FALLBACK] Missing ${missingDomains.length} domains: ${missingDomains.join(", ")}. Firing site-specific searches...`,
        );
      }

      for (const missing of missingDomains) {
        try {
          const siteMap: Record<string, string> = {
            "99acres": "99acres.com",
            magicbricks: "magicbricks.com",
            nobroker: "nobroker.in",
            squareyards: "squareyards.com",
          };

          const fallbackResponse = await fetch(
            "https://google.serper.dev/search",
            {
              method: "POST",
              headers: {
                "X-API-KEY": process.env.SERPER_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                q: `${query} ${siteMap[missing]}`,
                num: 5,
              }),
            },
          );

          const fallbackData = await fallbackResponse.json();
          const firstResult = (fallbackData.organic || [])[0];

          if (firstResult) {
            logger.info(
              `   ✅ [FALLBACK] Found ${missing}: ${firstResult.link}`,
            );
            seenDomains.add(missing);
            uniqueResults.push(firstResult);
          } else {
            logger.info(
              `   ❌ [FALLBACK] No results for ${missing} even with site: search`,
            );
          }
        } catch (error: any) {
          logger.info(
            `   ❌ [FALLBACK] Error searching ${missing}: ${error.message}`,
          );
        }
      }

      const topResults = uniqueResults.slice(0, 4);

      logger.info(`\n📍 Found ${topResults.length} listing URLs:`);
      topResults.forEach((r: any) => logger.info(` - ${r.link}`));

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
  async ({ listingUrl }, config) => {
    const abortController = config?.configurable?.abortController;
    if (abortController?.aborted) {
      logger.info("🛑 Discovery aborted.");
      return "Error: Process was aborted by the user.";
    }

    logger.info(`\n📂 Extracting 3 detail pages from: ${listingUrl}`);
    const { propertyUrls, tokens } = await getIndividualPropertyLinks(
      listingUrl,
      abortController,
    );
    const links = propertyUrls.slice(0, 3);

    const tracker = config?.configurable?.tokenTracker;
    if (tracker) {
      tracker.discoveryTokens += tokens;
      tracker.aiCalls += 1;
    }

    if (links.length === 0) {
      logger.info(" ❌ No detail pages found on this page.");
      return "No individual property links found on this page.";
    }

    links.forEach((l, i) => logger.info(`   ${i + 1}. ${l}`));
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
    const tracker = config?.configurable?.tokenTracker;
    const encoder = new TextEncoder();
    const batchId = crypto.randomUUID();
    const abortController = config?.configurable?.abortController;
    const referenceNumber = config?.configurable?.referenceNumber;

    if (!userId) {
      logger.error(
        "[Tool Error] User ID not supplied in configurable context.",
      );
      return "Error: User ID session lost.";
    }

    const trimmedUrls = detailUrls.map((url) => url.trim());
    const uniqueUrls = Array.from(new Set(trimmedUrls));

    if (uniqueUrls.length < trimmedUrls.length) {
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      for (const url of trimmedUrls) {
        if (seen.has(url)) duplicates.add(url);
        seen.add(url);
      }
      logger.info(
        `\n🗑️ [DEDUPLICATION] Filtered out ${duplicates.size} duplicate URLs:`,
      );
      duplicates.forEach((url) => logger.info(`   - ${url}`));
    }

    logger.info(
      `\n🚀 Scraper executing for ${uniqueUrls.length} unique URLs (was ${detailUrls.length}):`,
    );
    uniqueUrls.forEach((url: string, index: number) => {
      logger.info(`   ${index + 1}. ${url}`);
    });

    if (writer) {
      await writer.write(
        encoder.encode(
          JSON.stringify({
            type: "urls_found",
            urls: uniqueUrls,
          }) + "\n",
        ),
      );
    }

    const CONCURRENCY_LIMIT = 2;

    for (let i = 0; i < uniqueUrls.length; i += CONCURRENCY_LIMIT) {
      if (abortController?.aborted) {
        logger.info("🛑 Scraping batch aborted.");
        return "Error: Process was aborted by the user.";
      }

      const chunk = uniqueUrls.slice(i, i + CONCURRENCY_LIMIT);

      // Fire scrapes in parallel; return each result the moment it resolves
      await Promise.allSettled(
        chunk.map(async (url: string) => {
          try {
            const existing = await db
              .select()
              .from(propertyListing)
              .where(
                and(
                  eq(propertyListing.userId, userId),
                  eq(propertyListing.url, url),
                ),
              )
              .limit(1);
            if (existing.length > 0 && existing[0].status === "success") {
              logger.info(`[Batch] Already scraped (skipping fetch): ${url}`);
              const metrics = await getQuotaMetrics();
              const enrichedResult = {
                status: "success" as const,
                url: url,
                screenshotUrl: existing[0].screenshotUrl,
                data: existing[0].extractedData,
                tokensUsed: 0,
                aiUsed: false,
                visionUsed: false,
                id: existing[0].id,
                rpdRemaining: metrics.rpdRemaining,
                updatedAt:
                  existing[0].updatedAt?.toISOString() ||
                  new Date().toISOString(),
                createdAt:
                  existing[0].createdAt?.toISOString() ||
                  new Date().toISOString(),
              };
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
              return;
            }
            logger.info(`[Batch] Scraping: ${url}`);
            const { processUrl } =
              await import("../property-extraction/scraper");
            const result = await processUrl(
              url.trim(),
              batchId,
              abortController,
            );

            if (result.status === "error") {
              throw new Error(result.error || "Scraping Failed");
            }
            logger.info(`[Batch] Done: ${url}`);

            const newId = crypto.randomUUID();

            if (result.status === "success") {
              await logTokensUsed(result.tokensUsed);
              if (tracker) {
                tracker.scrapeTokens += result.tokensUsed;
                tracker.aiCalls += 1; // 1 call for Text AI
                if (result.visionUsed) {
                  tracker.aiCalls += 1; // +1 call for Vision AI
                }
              }
            }

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
            logger.info(`[Batch] Error on ${url}: ${e.message}`);
            const errorId = crypto.randomUUID();

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
        logger.info(
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
