import { NextResponse } from "next/server";
import { processUrl } from "@/features/property-extraction/scraper";
import {
  getQuotaMetrics,
  logTokensUsed,
} from "@/features/property-extraction/ai-rate-limiter";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { propertyListing, session } from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { success } from "zod";

export async function POST(request: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionData.user.id;

    const { urls } = await request.json();
    const batchId = crypto.randomUUID();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "Provide an array of URLs" },
        { status: 400 },
      );
    }

    const activeUrls = urls.filter((url: string) => url.trim());

    console.log("\n\n" + "=".repeat(60));
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
                const result = await processUrl(url.trim(), batchId);
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

                // NDJSON — one JSON object per line, pushed immediately
                controller.enqueue(
                  encoder.encode(JSON.stringify(enrichedResult) + "\n"),
                );
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
      },
    });
  } catch (error: any) {
    console.error("[Batch Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const properties = await db.query.propertyListing.findMany({
      where: eq(propertyListing.userId, sessionData.user.id),
      orderBy: (listings, { desc }) => [desc(listings.createdAt)],
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: "Missing id or updates" },
        { status: 400 },
      );
    }

    const existing = await db.query.propertyListing.findFirst({
      where: and(
        eq(propertyListing.id, id),
        eq(propertyListing.userId, sessionData.user.id),
      ),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Property Not Fount" },
        { status: 404 },
      );
    }

    const mergedData = {
      ...((existing.extractedData as any) || {}),
      ...updates,
    };

    const now = new Date();
    await db
      .update(propertyListing)
      .set({
        extractedData: mergedData,
        title: mergedData.title || existing.title,
        propertyType: mergedData.propertyType || existing.propertyType,
        city: mergedData.city || existing.city,
        location: mergedData.location || existing.location,
        price: mergedData.price || existing.price,
        carpetArea: mergedData.carpetArea || existing.carpetArea,
        updatedAt: now,
      })
      .where(
        and(
          eq(propertyListing.id, id),
          eq(propertyListing.userId, sessionData.user.id),
        ),
      );

    return NextResponse.json({
      success: true,
      updatedData: mergedData,
      updatedAt: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Error updating property: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await db
        .delete(propertyListing)
        .where(
          and(
            eq(propertyListing.id, id),
            eq(propertyListing.userId, sessionData.user.id),
          ),
        );
    } else {
      await db
        .delete(propertyListing)
        .where(eq(propertyListing.userId, sessionData.user.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting properties: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
