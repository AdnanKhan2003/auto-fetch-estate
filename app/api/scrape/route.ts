import { NextResponse } from "next/server";
import { processUrl } from "@/features/property-extraction/scraper";
import { getQuotaMetrics } from "@/lib/ai-rate-limiter";

let batchCounter = 0;

export async function POST(request: Request) {
  try {
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
        const CONCURRENCY_LIMIT = 3;

        for (let i = 0; i < activeUrls.length; i += CONCURRENCY_LIMIT) {
          const chunk = activeUrls.slice(i, i + CONCURRENCY_LIMIT);
          // Fire all scrapes in parallel; flush each result the moment it resolves
          await Promise.allSettled(
            chunk.map(async (url: string) => {
              try {
                console.log(`[Batch] Scraping: ${url}`);
                const result = await processUrl(url.trim());
                console.log(`[Batch] Done: ${url}`);

                const metrics = getQuotaMetrics();

                const enrichedResult = {
                  ...result,
                  rpdRemaining: metrics.rpdRemaining,
                  rpmRemaining: metrics.rpmRemaining,
                };

                // NDJSON — one JSON object per line, pushed immediately
                controller.enqueue(
                  encoder.encode(JSON.stringify(enrichedResult) + "\n"),
                );
              } catch (e: any) {
                console.log(`[Batch] Error on ${url}: ${e.message}`);

                const metrics = getQuotaMetrics();
                const errorResult = {
                  url: url.trim(),
                  status: "error",
                  error: e.message,
                  rpdRemaining: metrics.rpdRemaining,
                  rpmRemaining: metrics.rpmRemaining,
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
              `[Batch] Cooldown: Waiting 3 seconds before next chunk...`,
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
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
