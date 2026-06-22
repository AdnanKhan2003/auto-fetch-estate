import { auth } from "@/auth/auth";
import { db } from "@/db";
import { propertyListing } from "@/db/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST(request: Request) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { properties, referenceNumber } = await request.json();

    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return NextResponse.json(
        { error: "No properties provided" },
        { status: 400 },
      );
    }

    const valuesToInsert = properties.map((p: any) => ({
      id: p.id,
      userId: sessionData.user.id,
      url: p.url,
      referenceNumber: referenceNumber || null,
      title: p.data?.propertyTitle || null,
      propertyType: p.data?.propertyType || null,
      city: p.data?.city || null,
      location: p.data?.location || null,
      price: p.data?.price || null,
      carpetArea: p.data?.carpetArea || null,
      screenshotUrl: p.screenshotUrl || null,
      extractedData: p.data,
      status: p.status,
      tokensUsed: p.tokensUsed || 0,
    }));

    await db.insert(propertyListing).values(valuesToInsert);

    return NextResponse.json({ success: true, count: valuesToInsert.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
