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

    const activeUrls = urls.filter(url => url.trim());
    
    console.log("\n\n" + "=".repeat(60));
    console.log(`🚀 BATCH ATTEMPT #${batchCounter}`);
    console.log(`🧪 RUN ID: ${runId}`);
    console.log(`🔗 PROCESSING ${activeUrls.length} URLs`);
    console.log("=".repeat(60) + "\n");

    const results = [];
    for (const url of activeUrls) {
      console.log(`[Batch] Scraping: ${url}`);
      const result = await processUrl(url.trim());
      results.push(result);
    }

    // LOG 4 (Batch): All Deterministic Data
    console.log("\n--- LOG 4: BATCH DETERMINISTIC DATA (Selectors + JSON-LD) ---");
    activeUrls.forEach((url, i) => {
      console.log(`URL ${i + 1}: ${url}`);
      console.log(JSON.stringify(results[i].data, null, 2));
      console.log("-".repeat(30));
    });

    // LOG 5 (Batch): Final Combined Results
    console.log("\n--- LOG 5: FINAL BATCH RESULTS ---");
    console.log(`RUN_ID: ${runId}`);
    console.log(JSON.stringify(results.map(r => ({ url: r.url, data: r.data })), null, 2));
    console.log("=".repeat(60) + "\n");

    return NextResponse.json({ runId, results });
  } catch (error: any) {
    console.error("[Batch Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
