import { db } from "./index";
import { propertyListing } from "./schema";
import crypto from "crypto";

async function main() {
  try {
    // 1. Fetch all current listings (presently assigned to the test user)
    const listings = await db.select().from(propertyListing);
    console.log(`Found ${listings.length} listings to restore.`);

    if (listings.length > 0) {
      // Clear all listings first so we can restore cleanly
      await db.delete(propertyListing);

      const targetUsers = [
        "Y5Y3K5RHfFL3ruxYZhJw0y2VhVn6rcxz", // Adnan Khan
        "OtO5NnjueMFZaNCN19TNTgoLv0CojH87", // VS Jadon Admin
      ];

      for (const userId of targetUsers) {
        for (const l of listings) {
          await db.insert(propertyListing).values({
            id: crypto.randomUUID(), // New unique ID for each copy
            userId: userId,
            url: l.url,
            title: l.title,
            propertyType: l.propertyType,
            city: l.city,
            location: l.location,
            price: l.price,
            carpetArea: l.carpetArea,
            screenshotUrl: l.screenshotUrl,
            extractedData: l.extractedData,
            status: l.status,
            errorMessage: l.errorMessage,
            tokensUsed: l.tokensUsed,
            createdAt: l.createdAt,
            updatedAt: l.updatedAt,
          });
        }
      }
      console.log("Successfully restored listings for both users!");
    }
    process.exit(0);
  } catch (err: any) {
    console.error("Restoration failed:", err.message || err);
    process.exit(1);
  }
}

main();
