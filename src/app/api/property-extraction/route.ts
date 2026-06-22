import { NextResponse } from "next/server";
import { auth } from "@/auth/auth";
import { headers } from "next/headers";
import { propertyListing, session } from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionData.user.id;

    const { urls, referenceNumber } = await request.json();
    const batchId = crypto.randomUUID();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "Provide an array of URLs" },
        { status: 400 },
      );
    }

    const activeUrls = urls.filter((url: string) => url.trim());

    logger.info("\n\n" + "=".repeat(60));
    logger.info(`🔗 PROCESSING ${activeUrls.length} URLs IN PARALLEL`);
    logger.info("=".repeat(60) + "\n");

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const abortController = { aborted: false };
          request.signal.addEventListener(
            "abort",
            () => {
              abortController.aborted = true;
              logger.info("🛑 Manual scrape aborted by user.");
            },
            { once: true },
          );

          const { scrapePropertyTool } =
            await import("@/features/property-search/agent-tools");
          await scrapePropertyTool.invoke(
            { detailUrls: activeUrls },
            {
              configurable: {
                userId,
                streamWriter: controller,
                abortController,
                referenceNumber,
              },
            },
          );
        } catch (e: any) {
          logger.error({ error: e }, "[Direct Scrape Tool Error]");
        } finally {
          controller.close();
        }
      },
    });

    // stream keeps HTTP connections alive during slow browser scrapes
    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    logger.error({ error }, "[Batch Error]");
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
    logger.error({ error }, "Error fetching properties: ");
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
        { error: "Property Not Found" },
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
    logger.error({ error }, "Error updating property: ");
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
    logger.error({ error }, "Error deleting properties: ");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
