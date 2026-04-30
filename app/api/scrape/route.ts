import { NextResponse } from "next/server";
import { processUrl } from "@/lib/scraper";

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "Provide an array of URLs" },
        { status: 400 },
      );
    }

    const results = [];
    for (const url of urls) {
      if (url.trim()) {
        const result = await processUrl(url.trim());
        results.push(result);
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
