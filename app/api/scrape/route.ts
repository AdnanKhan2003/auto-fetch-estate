import { NextResponse } from "next/server";
import { processUrl } from "@/lib/scraper";

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
        // Fire all scrapes in parallel; flush each result the moment it resolves
        await Promise.allSettled(
          activeUrls.map(async (url: string) => {
            console.log(`[Batch] Scraping: ${url}`);
            const result = await processUrl(url.trim());
            console.log(`[Batch] Done: ${url}`);
            // NDJSON — one JSON object per line, pushed immediately
            controller.enqueue(encoder.encode(JSON.stringify(result) + "\n"));
          })
        );
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
