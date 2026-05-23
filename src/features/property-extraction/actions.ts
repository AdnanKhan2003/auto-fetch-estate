"use server";

import { auth } from "@/auth/auth";
import { db } from "@/db";
import { propertyListing, session } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

async function getPropertyListings() {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData?.user) throw new Error("Unauthorized");

  const userId = sessionData.user.id;

  const properties = await db.query.propertyListing.findMany({
    where: eq(propertyListing.userId, userId),
    orderBy: (listings, { desc }) => [desc(listings.createdAt)],
  });

  return properties;
}

async function deleteProperty(propertyId: string) {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData?.user) throw new Error("Unauthorized");

  await db
    .delete(propertyListing)
    .where(
      eq(propertyListing.id, propertyId) &&
        eq(propertyListing.userId, sessionData.user.id),
    );
}

async function deleteAllPropertyListings() {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData?.user) throw new Error("Unauthorized");

  await db
    .delete(propertyListing)
    .where(eq(propertyListing.userId, sessionData.user.id));
}

export { getPropertyListings, deleteProperty, deleteAllPropertyListings };
