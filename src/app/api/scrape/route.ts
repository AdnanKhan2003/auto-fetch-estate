import { NextResponse } from "next/server";
import { processUrl } from "@/features/property-extraction/scraper";
import { getQuotaMetrics } from "@/lib/ai-rate-limiter";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { propertyListing, session } from "@/db/schema";
import { db } from "@/db";

let batchCounter = 0;

export async function POST(request: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionData.user.id;

    batchCounter++;
    const runId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "Provide an array of URLs" },
        { status: 400 },
      );
    }

    const activeUrls = urls.filter((url: string) => url.trim());

    console.log("\n\n" + "=".repeat(60));
    console.log(`🚀 BATCH ATTEMPT #${batchCounter}`);
    console.log(`🧪 RUN ID: ${runId}`);
    console.log(`🔗 PROCESSING ${activeUrls.length} URLs IN PARALLEL`);
    console.log("=".repeat(60) + "\n");

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const CONCURRENCY_LIMIT = 2; // Reduced from 5 to prevent Gemini 503 quotas

        for (let i = 0; i < activeUrls.length; i += CONCURRENCY_LIMIT) {
          const chunk = activeUrls.slice(i, i + CONCURRENCY_LIMIT);
          // Fire all scrapes in parallel; flush each result the moment it resolves
          await Promise.allSettled(
            chunk.map(async (url: string) => {
              try {
                console.log(`[Batch] Scraping: ${url}`);
                const result = await processUrl(url.trim());
                console.log(`[Batch] Done: ${url}`);

                await db.insert(propertyListing).values({
                  id: crypto.randomUUID(),
                  userId,
                  url: url.trim(),
                  title: result.data?.propertyTitle || null,
                  propertyType: result.data?.propertyType || null,
                  city: result.data?.city || null,
                  location: result.data?.location || null,
                  price: result.data?.price || null,
                  carpetArea: result.data?.carpetArea || null,
                  screenshotUrl: result.screenshotUrl || null,
                  extractedData: result.data as any,
                  status: "success",
                  tokensUsed: result.tokensUsed,
                });

                const metrics = await getQuotaMetrics();

                const enrichedResult = {
                  ...result,
                  rpdRemaining: metrics.rpdRemaining,
                };

                // NDJSON — one JSON object per line, pushed immediately
                controller.enqueue(
                  encoder.encode(JSON.stringify(enrichedResult) + "\n"),
                );
              } catch (e: any) {
                console.log(`[Batch] Error on ${url}: ${e.message}`);

                await db.insert(propertyListing).values({
                  id: crypto.randomUUID(),
                  userId: userId,
                  url: url.trim(),
                  status: "error",
                  errorMessage: e.message,
                  tokensUsed: 0,
                });

                const metrics = await getQuotaMetrics();
                const errorResult = {
                  url: url.trim(),
                  status: "error",
                  error: e.message,
                  rpdRemaining: metrics.rpdRemaining,
                  tokensUsed: 0,
                };

                controller.enqueue(
                  encoder.encode(JSON.stringify(errorResult) + "\n"),
                );
              }
            }),
          );

          if (i + CONCURRENCY_LIMIT < activeUrls.length) {
            console.log(
              `[Batch] Cooldown: Waiting 11 seconds before next chunk...`,
            );
            await new Promise((resolve) => setTimeout(resolve, 13000));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
        "X-Run-Id": runId,
      },
    });
  } catch (error: any) {
    console.error("[Batch Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
