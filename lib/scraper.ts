import path from "path";
import fs from "fs";
import { chromium } from "playwright-core"; // system Chrome (swap to 'playwright' for Docker/CI)
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// ─── helpers ────────────────────────────────────────────────

export const propertySchema = z.object({
  // Basic Information
  propertyTitle: z
    .string()
    .nullable()
    .describe("The title of the property listing."),
  propertyType: z
    .string()
    .nullable()
    .describe("e.g., Flat, Villa, Apartment, Office."),
  bhkType: z.string().nullable().describe("e.g., 1BHK, 2BHK, 3BHK."),
  projectType: z.string().nullable().describe("e.g., Residential, Commercial."),

  // Location Details
  location: z
    .string()
    .nullable()
    .describe("The neighborhood, locality, or city."),
  address: z.string().nullable().describe("The full address of the property."),
  city: z
    .string()
    .nullable()
    .describe("The city where the property is located."),
  nearbyLandmarks: z
    .array(z.string())
    .describe(
      "List of nearby landmarks like schools, hospitals, metro stations.",
    ),

  // Pricing and Financials
  price: z
    .string()
    .nullable()
    .describe("The total price of the property, e.g., $450,000 or ₹ 1.5 Cr."),
  pricePerSqft: z
    .string()
    .nullable()
    .describe("The price per square foot, e.g., ₹84,307 per sqft."),
  priceRange: z
    .string()
    .nullable()
    .describe(
      "Price range for different configurations, e.g., ₹1.50 Cr - ₹2.23 Cr.",
    ),
  estimatedEMI: z
    .string()
    .nullable()
    .describe("Estimated monthly EMI, e.g., ₹71K EMI."),
  negotiable: z
    .boolean()
    .nullable()
    .describe("Indicates if the price is negotiable."),
  bookingAmount: z
    .string()
    .nullable()
    .describe("The booking amount for the property."),
  maintenanceCharges: z
    .string()
    .nullable()
    .describe("Monthly maintenance charges."),

  // Property Specifications
  area: z
    .string()
    .nullable()
    .describe(
      "The size/area of the property, e.g., 1200 sqft. Can be Carpet Area, Built-up Area, or Super Area.",
    ),
  floorNo: z
    .string()
    .nullable()
    .describe("The floor number, e.g., 5th floor or 50 out of 65."),
  totalFloors: z
    .number()
    .nullable()
    .describe("Total number of floors in the building."),
  furnishingStatus: z
    .string()
    .nullable()
    .describe("e.g., Unfurnished, Semi-furnished, Fully furnished."),
  numberOfBathrooms: z.number().nullable().describe("Number of bathrooms."),
  numberOfBalconies: z.number().nullable().describe("Number of balconies."),
  facing: z
    .string()
    .nullable()
    .describe("Direction the property faces, e.g., East, North-East."),
  overlooking: z
    .string()
    .nullable()
    .describe(
      "What the property overlooks, e.g., Garden/Park, Pool, Main Road.",
    ),
  carParking: z
    .string()
    .nullable()
    .describe("Car parking availability and type, e.g., 1 Covered, 1 Open."),
  flooringType: z
    .string()
    .nullable()
    .describe("Type of flooring, e.g., Vitrified, Cement."),

  // Status and Timeline
  constructionStatus: z
    .string()
    .nullable()
    .describe("e.g., Ready to Move, Under Construction."),
  possessionDate: z
    .string()
    .nullable()
    .describe("Expected possession date, e.g., Dec '27."),
  postedDate: z
    .string()
    .nullable()
    .describe("Date the property was posted, e.g., Posted Yesterday."),
  ageOfBuilding: z
    .string()
    .nullable()
    .describe("Age of the building, e.g., 3-5 years."),
  launchDate: z.string().nullable().describe("Project launch date."),

  // Project Details
  projectName: z
    .string()
    .nullable()
    .describe("Name of the project or society."),
  developerName: z
    .string()
    .nullable()
    .describe("Name of the developer or builder."),
  totalUnits: z
    .number()
    .nullable()
    .describe("Total number of units in the project."),
  projectSize: z
    .string()
    .nullable()
    .describe("Size of the project, e.g., 1 Acre."),
  popularityRank: z
    .string()
    .nullable()
    .describe(
      "Popularity rank in the locality, e.g., 2/27 in Popularity in Jogeshwari East.",
    ),

  // Verification and Legal
  reraApproved: z
    .boolean()
    .nullable()
    .describe("Indicates if the property is RERA approved."),
  reraNumber: z.string().nullable().describe("RERA registration number."),
  verifiedTag: z
    .boolean()
    .nullable()
    .describe("Indicates if the listing is verified by the platform."),
  loanVerified: z
    .boolean()
    .nullable()
    .describe("Indicates if the property loan is verified."),
  ownershipType: z
    .string()
    .nullable()
    .describe("e.g., Freehold, Leasehold, Self Owned."),
  legalCertificatesAvailable: z
    .boolean()
    .nullable()
    .describe("Indicates if legal certificates are available."),
  brochureDownload: z
    .boolean()
    .nullable()
    .describe("Indicates if a brochure is available for download."),

  // Amenities
  amenities: z
    .array(z.string())
    .describe(
      "List of amenities like Pool, Gym, Parking, Clubhouse, Meditation Area, etc.",
    ),

  // Seller Information
  sellerType: z
    .string()
    .nullable()
    .describe("Type of seller, e.g., Owner, Agent, Builder."),
  agentName: z.string().nullable().describe("Name of the agent."),
  contactDetails: z
    .string()
    .nullable()
    .describe("Contact information for the seller/agent."),
  responseRate: z.string().nullable().describe("Seller response rate."),
  buyersServed: z
    .string()
    .nullable()
    .describe("Number of buyers served by the agent/builder."),

  // Engagement and Scores
  uniqueViews: z
    .number()
    .nullable()
    .describe("Number of unique views on the listing."),
  shortlists: z
    .number()
    .nullable()
    .describe("Number of times the property was shortlisted."),
  carpetArea: z
    .string()
    .nullable()
    .describe("The specific carpet area of the property"),
  contactsMade: z
    .number()
    .nullable()
    .describe("Number of contacts made for the property."),
  livabilityScore: z
    .number()
    .nullable()
    .describe("Livability score of the locality."),
  transitScore: z
    .number()
    .nullable()
    .describe("Transit score of the locality."),
  safetyScore: z.number().nullable().describe("Safety score of the locality."),

  // Visuals
  numberOfPhotos: z
    .number()
    .nullable()
    .describe("Number of photos available for the property."),
  videoTourAvailable: z
    .boolean()
    .nullable()
    .describe("Indicates if a video tour is available."),
});

export type Property = z.infer<typeof propertySchema>;

// function isBlocked(html: string): boolean {
//   const signals = ["access denied", "captcha", "robot check", "blocked"];
//   return signals.some((s) => html.toLowerCase().includes(s));
// }

// async function extractStructuredData(page: any): Promise<Partial<Property>> {
//   return page.evaluate(() => {
//     const scripts = Array.from(
//       document.querySelectorAll('script[type="application/ld+json"]'),
//     );
//     for (const s of scripts) {
//       try {
//         const data = JSON.parse(s.textContent ?? "");

//         // --- ADD THIS CHECK ---
//         // Skip corporate info, only look for the actual property
//         const type = data["@type"]?.toLowerCase() || "";
//         if (
//           type.includes("organization") ||
//           data.name?.includes("Realty Services")
//         ) {
//           continue;
//         }

//         if (
//           type.includes("apartment") ||
//           type.includes("residence") ||
//           type.includes("house") ||
//           data.price
//         ) {
//           return {
//             propertyTitle: data.name ?? null,
//             price: data.price ?? data.offers?.price ?? null,
//             address: data.address?.streetAddress ?? null,
//             city: data.address?.addressLocality ?? null,
//           };
//         }
//       } catch {}
//     }
//     return {};
//   });
// }

function isBlocked(pageTitle: string, html: string): boolean {
  const lowTitle = pageTitle.toLowerCase();

  // 1. Check the Page Title (most reliable for real blocks)
  if (
    lowTitle.includes("access denied") ||
    lowTitle.includes("robot check") ||
    lowTitle.includes("captcha")
  ) {
    return true;
  }
  // 2. Only check for "blocked" if it's the ONLY thing in the body
  if (html.length < 500 && html.toLowerCase().includes("blocked")) {
    return true;
  }
  return false;
}

async function extractStructuredData(page: any): Promise<Partial<Property>> {
  // 1. Grab all raw JSON-LD blocks from the page
  const jsonLdData = await page.evaluate(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return scripts.map((s) => s.textContent).join("\n\n");
  });

  // If there's no JSON-LD, don't waste an AI call
  if (!jsonLdData || jsonLdData.length < 50) return {};

  try {
    console.log("[AI] Analyzing JSON-LD block...");
    const { object } = await generateObject({
      // model: google("gemini-1.5-flash"),
      model: google("gemini-1.5-flash-latest"),
      schema: propertySchema,
      prompt: `Analyze this Real Estate JSON-LD data. Extract all available property details. 
               Map them to the schema provided. Focus on: price, area, BHK, location, amenities, and RERA status.
               
               JSON-LD DATA:
               ${jsonLdData.slice(0, 20000)}`, // Safeguard to prevent token overflow
    });
    return object;
  } catch (err) {
    console.error("[AI Error] JSON-LD extraction failed:", err);
    return {};
  }
}

async function extractBySelectors(page: any): Promise<Partial<Property>> {
  // ── Stage 2: DOM selectors (deterministic, zero token cost) ──
  const get = async (...selectors: string[]) => {
    for (const sel of selectors) {
      try {
        const text = await page
          .locator(sel)
          .first()
          .textContent({ timeout: 1500 });
        const clean = text?.trim();
        // LENGTH GUARD: Kill massive UI blocks or empty strings
        if (clean && clean.length > 0 && clean.length < 200) return clean;
      } catch {}
    }
    return null;
  };

  // NEW: Label-based extraction (Works great on MagicBricks/99acres)
  const getByLabel = async (label: string) => {
    try {
      // Find the list item that contains the label, then find the value inside it
      const parent = page
        .locator(`.mb-ldp__dtls__body__list--item`)
        .filter({ hasText: label })
        .first();
      const value = await parent
        .locator(".mb-ldp__dtls__body__list--value")
        .textContent({ timeout: 1500 });

      // REGEX FIX: Grab ONLY the first number and unit (e.g. 410 sqft)
      const cleaned = value
        ?.trim()
        .match(
          /^\d+\s*(sq-ft|sqft|sq\s*ft|sq\s*m|sq\s*yd|acre|bigha|katha)/i,
        )?.[0];
      return cleaned || value?.trim().split("\n")[0] || null;
    } catch {
      return null;
    }
  };

  return {
    propertyTitle: await get(".mb-ldp__dtls__title", "h1"),
    price: await get(
      ".mb-ldp__dtls__price",
      '[class*="propAmount"]',
      '[class*="price"]',
    ),
    carpetArea: await getByLabel("Carpet Area"),

    // Improved Area Extraction
    area:
      (await getByLabel("Carpet Area")) ||
      (await getByLabel("Super Area")) ||
      (await getByLabel("Built-up Area")) ||
      (await get(".mb-ldp__dtls__body__list--value")),

    // Explicitly hunt for Price per Sqft which is often near the price or area
    pricePerSqft:
      (
        await page
          .locator('.mb-ldp__dtls__body__list--value:has-text("/sqft")')
          .first()
          .textContent({ timeout: 1000 })
          .catch(() => null)
      )?.trim() || null,

    location: await get(
      ".mb-ldp__dtls__title--link",
      '[class*="localityName"]',
      '[class*="location"]',
    ),

    // Detailed Specs
    floorNo: await getByLabel("Floor"),
    facing: await getByLabel("Facing"),
    furnishingStatus: await getByLabel("Furnishing"),
    overlooking: await getByLabel("Overlooking"),
    ageOfBuilding: await getByLabel("Age of Construction"),
    constructionStatus:
      (await getByLabel("Status")) || (await getByLabel("Possession")),
  };
}

async function extractCleanContent(page: any): Promise<string> {
  // ── Stage 3: cleaned content (moderate cost if sent to AI) ──
  return page.evaluate(() => {
    // Remove noise
    document
      .querySelectorAll(
        'script:not([type="application/ld+json"]), style, nav, footer, header, [class*="ad"]',
      )
      .forEach((el) => el.remove());

    const main =
      document.querySelector(
        'main, [class*="detail"], [class*="property-info"]',
      ) ?? document.body;

    return (main as HTMLElement).innerText.replace(/\n{3,}/g, "\n\n").trim();
  });
}

export async function processUrl(url: string) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    deviceScaleFactor: 1,
    hasTouch: false,
    locale: "en-IN", // Set to India
    timezoneId: "Asia/Kolkata",
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    (window.navigator as any).chrome = { runtime: {} } as any;
    // Mock languages and plugins
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-IN", "en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    // Overwrite Permissions API
    const originalQuery = window.navigator.permissions.query;
    (window.navigator.permissions as any).query = (parameters: any) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("h1, [class*='price'], [class*='title']", {
      timeout: 10000,
    });
    await page.waitForTimeout(Math.floor(Math.random() * 2000) + 3000);

    const pageTitle = await page.title();
    const pageHtml = await page.content();
    // if (isBlocked(pageHtml)) throw new Error("Bot protection triggered");
    if (isBlocked(pageTitle, pageHtml))
      throw new Error("Bot protection triggered");

    const screenshotName = `screenshot-${Date.now()}.png`;
    const screenshotPath = path.join(
      process.cwd(),
      "public",
      "screenshots",
      screenshotName,
    );
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath });

    const [structuredData, selectorData] = await Promise.all([
      extractStructuredData(page),
      extractBySelectors(page),
    ]);

    const deterministic: Partial<Property> = {
      ...selectorData,
      ...structuredData,
    };

    const criticalFields = [
      "propertyTitle",
      "price",
      "location",
      "area",
    ] as const;
    const missingCritical = criticalFields.filter((f) => !deterministic[f]);

    // if (missingCritical.length === 0 && deterministic.floorNo) {
    //   return {
    //     url,
    //     screenshotUrl: `/screenshots/${screenshotName}`,
    //     data: deterministic,
    //     status: "success",
    //     aiUsed: false,
    //   };
    // }

    const allFields = Object.keys(propertySchema.shape);
    const filledFields = Object.values(deterministic).filter(
      (v) => v !== null && v !== "",
    ).length;
    if (filledFields > 15) {
      // If we got more than 15 fields deterministically, we can skip AI Vision
      return {
        url,
        screenshotUrl: `/screenshots/${screenshotName}`,
        data: deterministic,
        status: "success",
        aiUsed: false, // AI was used in structured stage, but skipped in Vision stage
      };
    }

    const cleanText = await extractCleanContent(page);
    let aiData: any = {};
    let visionUsed = false;

    try {
      console.log(`[AI] Attempting Vision extraction for: ${url}`);
      const screenshotBuffer = fs.readFileSync(screenshotPath);

      const { object } = await generateObject({
        // model: google("gemini-1.5-flash"), // FIXED MODEL NAME
        model: google("gemini-1.5-pro-latest"),
        schema: propertySchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
                  Extract real estate data. 
                  Ignore corporate HQ in Noida.
                  Find Price per Sqft, Livability Score, Safety Score, Facing, Overlooking, Furnishing, Ownership.
                  
                  Missing: ${missingCritical.join(", ")}
                  Known: ${JSON.stringify(deterministic)}
                  Text: ${cleanText.slice(0, 10000)}
                `,
              },
              {
                type: "image",
                image: screenshotBuffer,
                mimeType: "image/png",
              } as any,
            ],
          },
        ],
      });

      aiData = object;
      visionUsed = true;
      console.log(`[AI] Vision extraction successful!`);
    } catch (aiError: any) {
      console.error("CRITICAL AI ERROR:", aiError.message);
    }

    const cleanDeterministic = Object.fromEntries(
      Object.entries(deterministic).filter(([_, v]) => v !== null && v !== ""),
    );

    return {
      url,
      screenshotUrl: `/screenshots/${screenshotName}`,
      data: { ...aiData, ...cleanDeterministic },
      status: "success" as const,
      aiUsed: true,
      visionUsed,
      missingFields: missingCritical,
    };
  } catch (error: any) {
    console.error(`Failed to process ${url}:`, error);
    return { url, status: "error" as const, error: error.message };
  } finally {
    await browser.close();
  }
}
