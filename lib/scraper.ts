import path from "path";
import fs from "fs";
import { chromium } from "playwright-core"; // system Chrome (swap to 'playwright' for Docker/CI)
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// ─── helpers ────────────────────────────────────────────────
const DEFAULT_GOOGLE_MODEL = "gemini-2.5-flash";

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
  videoTourAvailable: z.boolean().nullable().optional(),
  marketPrice: z.string().nullable().optional(),
  ownerName: z.string().nullable().optional(),
  internalFloorArea: z.string().nullable().optional(),
  verticalPositioning: z.string().nullable().optional(),
  cardinalFacing: z.string().nullable().optional(),
  legalStatus: z.string().nullable().optional(),
});

export type Property = z.infer<typeof propertySchema>;

// Collapses all whitespace/newlines in a raw price string.
// Handles SquareYards-style: "₹ 85 L\n            \n                + Charges" → "₹ 85 L + Charges"
function normalizePrice(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.replace(/\s+/g, " ").trim() || null;
}

// Normalises any pricePerSqft string to a consistent "₹X,XXX/sqft" format.
// Handles: "₹24,286/sqft", "₹3,132 per sqft", "₹ 84,307 per sqft", "24286"
function normalizePricePerSqft(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/); // grab first number
  if (!match) return null;
  const num = Math.round(Number(match[1]));
  if (!num || Number.isNaN(num)) return null;
  return `\u20b9${num.toLocaleString("en-IN")}/sqft`;
}

// Normalises any area string to "350 sqft Carpet Area" format.
// Detects area type from the raw string if present.
function normalizeArea(raw?: string | null): string | null {
  if (!raw) return null;
  const numMatch = raw.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return null;
  const num = Math.round(Number(numMatch[1]));
  if (!num || Number.isNaN(num)) return null;

  let areaType = "";
  if (/carpet/i.test(raw)) areaType = "Carpet Area";
  else if (/super\s*built[\s-]*up/i.test(raw)) areaType = "Super Built-up Area";
  else if (/built[\s-]*up/i.test(raw)) areaType = "Built-up Area";
  else if (/super/i.test(raw)) areaType = "Super Area";

  return areaType ? `${num} sqft ${areaType}` : `${num} sqft`;
}

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

async function extractStructuredData(
  page: any,
  cleanText: string,
  knownData: Partial<Property> = {},
  scrapeUrl?: string,
): Promise<Partial<Property>> {
  const jsonLdData = await page.evaluate(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return scripts.map((s) => s.textContent).join("\n\n");
  });

  const urlLabel = scrapeUrl ?? "(unknown URL)";
  console.log("\n" + "=".repeat(60));
  console.log(`JSON-LD DATA — ${urlLabel}`);
  console.log("=".repeat(60));
  console.log(`script blocks joined length (chars): ${jsonLdData?.length ?? 0}`);
  console.log(jsonLdData?.trim() ? jsonLdData : "(empty — no application/ld+json or blank)");
  console.log("=".repeat(60) + "\n");

  // If there's no data at all, return empty
  if ((!jsonLdData || jsonLdData.length < 50) && !cleanText) return {};

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const modelName = process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL;
  if (!apiKey) {
    console.error("❌ [AI Error] GOOGLE_GENERATIVE_AI_API_KEY is missing from .env!");
    return {};
  }
  console.log(`[AI] Using API Key: ${apiKey.slice(0, 5)}...`);
  console.log(`[AI] Using Model: ${modelName}`);

  // Do not force .../v1 — generateObject sends responseSchema/responseMimeType on generation_config,
  // which the v1 REST surface rejects ("Unknown name responseMimeType/responseSchema").
  const googleProvider = createGoogleGenerativeAI({ apiKey });

  try {
    const prompt = `
         You are a Real Estate Data Specialist. 
         I will provide you with raw JSON-LD blocks and the full text content from a property listing.
         
         TASK:
         1. Scrutinize EVERY JSON-LD block and the provided page text.
         2. Extract all available property details into the provided schema.
         3. **PRIORITY FIELDS**: Ensure you extract the following if present:
            - Property Name (propertyTitle)
            - Price & Market Price
            - Carpet Area / Internal Floor Area
            - Total Area
            - Rate per Sqft (pricePerSqft)
            - Building Age (ageOfBuilding)
            - Locality (location)
            - Vertical Position (floorNo)
            - Cardinal Facing (facing)
            - Furnishing Status
            - Legal Status (reraApproved/reraNumber)
            - Owner Name (ownerName)
         4. Look for patterns like "Lac", "Cr", "sqft", "BHK", "Ready to move", "X years old", etc.
         5. Combine data from both sources to get the most accurate picture.

         DATA TO ANALYZE (JSON-LD):
         ${jsonLdData.slice(0, 10000)}

         DATA TO ANALYZE (PAGE TEXT):
         ${cleanText.slice(0, 20000)}

         DATA ALREADY FOUND (Selectors):
         ${JSON.stringify(knownData, null, 2)}
      `;

    // LOG 2: Exact prompt given to AI
    console.log("--- LOG 2: AI PROMPT & CONTEXT ---");
    console.log(prompt);
    console.log("----------------------------------");

    const { object } = await generateObject({
      model: googleProvider(modelName),
      schema: propertySchema,
      prompt,
    });

    if (object && Object.keys(object).length > 0) {
      console.log("✅ [AI] Extraction successful!");
    }

    // LOG 3: Result from AI
    console.log("--- LOG 3: AI RESULT ---");
    console.log(JSON.stringify(object, null, 2));
    console.log("------------------------");

    return object;
  } catch (err: any) {
    console.error("\n❌ [AI Error] Extraction failed!");
    console.error(`Reason: ${err.message}`);
    if (err.stack) console.error(err.stack);
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

    // Explicitly hunt for Price per Sqft
    pricePerSqft:
      (
        await page
          .locator('.mb-ldp__dtls__body__list--value:has-text("sqft")')
          .first()
          .innerText({ timeout: 1000 })
          .then((val: string | null) => {
            if (!val) return null;
            // REGEX: Find the currency symbol and the number/sqft, ignore the list of units
            const match = val.match(/(₹|Rs\.?)\s*[\d,.]+(\/sqft| per sqft)/i);
            return match ? match[0] : val.split("\n").pop()?.trim();
          })
          .catch(() => null)
      ) || null,

    location: await get(
      ".mb-ldp__dtls__title--link",
      '[class*="localityName"]',
      '[class*="location"]',
    ),

    // Detailed Specs
    floorNo: await getByLabel("Floor"),
    verticalPositioning: await getByLabel("Floor"),
    facing: await getByLabel("Facing"),
    cardinalFacing: await getByLabel("Facing"),
    furnishingStatus: await getByLabel("Furnishing"),
    overlooking: await getByLabel("Overlooking"),
    ageOfBuilding: await getByLabel("Age of Construction"),
    constructionStatus:
      (await getByLabel("Status")) || (await getByLabel("Possession")),
    
    // Legal & Owner
    legalStatus: (await getByLabel("RERA ID")) || (await getByLabel("Status")),
    ownerName: await get(".mb-ldp__dtls__contact-name", ".mb-ldp__dtls__seller-name"),
    internalFloorArea: await getByLabel("Carpet Area"),
  };
}

// Helper to clean page content for AI analysis
async function extractCleanContent(page: any): Promise<string> {
  return page.evaluate(() => {
    // 1. Target junk elements for removal
    const junkSelectors = [
      "script", "style", "iframe", "noscript", 
      "footer", "nav", "header", 
      ".footer", ".header", ".sidebar", 
      ".seo-section", ".faq-section", ".about-portal",
      "[class*='disclaimer']", "[class*='advertisement']", "[class*='ad-unit']"
    ];
    
    junkSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 2. Extract text from the remaining content
    // We prioritize 'main' or article areas if they exist, fallback to body
    const main = document.querySelector("main, article, #main, .main, [class*='detail-container']") || document.body;
    const text = (main as HTMLElement).innerText || "";
    
    // 3. Clean up whitespace and collapse gaps
    const clean = text.replace(/\n{3,}/g, "\n\n").replace(/\s\s+/g, " ").trim();
    
    // 4. Block check: If the text is just a security alert, return empty
    if (clean.toLowerCase().includes("request blocked") || clean.toLowerCase().includes("suspicious activity")) {
      return "";
    }
    return clean;
  });
}

export async function processUrl(url: string) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/12" + Math.floor(Math.random() * 9) + ".0.0.0 Safari/537.36",
    deviceScaleFactor: 1,
    hasTouch: false,
    locale: "en-IN", 
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
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    // Wait for the body to ensure content is loaded, then try to find specific markers
    await page.waitForSelector("body", { timeout: 10000 });
    // Attempt to wait for markers but don't crash if they don't appear (handles lazy loading)
    await page.waitForSelector("h1, [class*='price'], [class*='title']", {
      timeout: 5000,
    }).catch(() => console.log("[Scraper] Major markers not found, proceeding anyway..."));
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

    const cleanText = await extractCleanContent(page);

    console.log("\n" + "=".repeat(60));
    console.log(`UNSTRUCTURED BODY DATA — ${url}`);
    console.log("=".repeat(60));
    console.log(`characters: ${cleanText.length}`);
    if (cleanText.length === 0) {
      console.log(
        "(EMPTY — bot wall, hydration not finished, or extractCleanContent removed all visible text)",
      );
    } else {
      console.log(cleanText);
    }
    console.log("=".repeat(60) + "\n");

    // ── Fix 1: Detect 404 / error pages — treat as a scrape failure ──
    const ERROR_PAGE_PHRASES = [
      "something is missing",
      "page not found",
      "404 not found",
      "oops, nothing here",
      "the page you requested was not found",
      "this listing has been removed",
      "listing not available",
      "property not found",
    ];
    const lowerClean = cleanText.toLowerCase();
    const isErrorPage =
      ERROR_PAGE_PHRASES.some((phrase) => lowerClean.includes(phrase)) &&
      cleanText.length < 500;
    if (isErrorPage) {
      console.log(`[Scraper] ⚠️  Error/404 page detected for: ${url}`);
      throw new Error("Page returned a 404 or error page");
    }

    // 1. Run selectors first (deterministic)
    const selectorData = await extractBySelectors(page);
    console.log("\n" + "=".repeat(60));
    console.log(`SELECTORS DATA — ${url}`);
    console.log("=".repeat(60));
    console.log(JSON.stringify(selectorData, null, 2));
    console.log("=".repeat(60) + "\n");

    // 2. Pass known data to AI to fill the gaps
    const structuredData = await extractStructuredData(
      page,
      cleanText,
      selectorData,
      url,
    );

    // 3. Pre-initialize the object with nulls for all fields in the schema
    const defaultData = Object.keys(propertySchema.shape).reduce((acc, key) => {
      acc[key] = null;
      if (key === "nearbyLandmarks" || key === "amenities") acc[key] = [];
      return acc;
    }, {} as any);

    const deterministic: Partial<Property> = {
      ...defaultData,
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

    const allFields = Object.keys(propertySchema.shape);
    const filledFields = Object.values(deterministic).filter(
      (v) => v !== null && v !== "",
    ).length;
    const cleanDeterministic = Object.fromEntries(
      Object.entries(deterministic).filter(([_, v]) => v !== null && v !== ""),
    );

    let aiData: any = {};
    let visionUsed = false;

    // Only run Vision if we are still missing critical fields or have very few total fields
    if (missingCritical.length > 0 || filledFields < 15) {
      try {
        const visionApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const visionModelName = process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL;
        if (!visionApiKey) {
          console.log("[AI] Vision skipped: GOOGLE_GENERATIVE_AI_API_KEY not set");
        } else {
        console.log(`[AI] Attempting Vision extraction for: ${url}`);
        console.log(`[AI] Vision Model: ${visionModelName}`);
        const screenshotBuffer = fs.readFileSync(screenshotPath);

        const visionGoogle = createGoogleGenerativeAI({ apiKey: visionApiKey });

        const { object } = await generateObject({
          model: visionGoogle(visionModelName),
          schema: propertySchema,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `
                    Extract real estate data from this screenshot and text. 
                    Focus on: ${missingCritical.join(", ")}
                    Already Found: ${JSON.stringify(cleanDeterministic)}
                    Raw Text Preview: ${cleanText.slice(0, 5000)}
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
        console.log("\n--- LOG 3.5: AI VISION RESULT (From Screenshot) ---");
        console.log(JSON.stringify(aiData, null, 2));
        console.log("--------------------------------------------------\n");
        console.log(`✅ [AI] Vision extraction successful!`);
        }
      } catch (aiError: any) {
        console.error("❌ [AI Vision Error]:", aiError.message);
      }
    }

    const finalData = { ...cleanDeterministic, ...aiData };

    // Fix 2: Collapse newlines/whitespace in raw price strings (e.g. SquareYards)
    if (finalData.price) {
      finalData.price = normalizePrice(finalData.price) ?? finalData.price;
    }

    // Normalise pricePerSqft to a single consistent format regardless of source
    if (finalData.pricePerSqft) {
      finalData.pricePerSqft = normalizePricePerSqft(finalData.pricePerSqft) ?? finalData.pricePerSqft;
    }

    // Normalise area to "350 sqft Carpet Area" format
    if (finalData.area) {
      finalData.area = normalizeArea(finalData.area) ?? finalData.area;
    }
    if (finalData.carpetArea) {
      finalData.carpetArea = normalizeArea(finalData.carpetArea) ?? finalData.carpetArea;
    }

    // Fix 3: Sanity-check area — null out physically impossible values (> 50,000 sqft)
    // Catches sites like SquareYards that publish "8500000 Sq.Ft." due to data-entry errors
    const RESIDENTIAL_AREA_LIMIT_SQFT = 50_000;
    for (const areaField of ["area", "carpetArea", "internalFloorArea"] as const) {
      if (finalData[areaField]) {
        const numStr = (finalData[areaField] as string).match(/(\d+(?:[,\d]*)?)/)?.[1]?.replace(/,/g, "");
        const areaNum = numStr ? Number(numStr) : NaN;
        if (!Number.isNaN(areaNum) && areaNum > RESIDENTIAL_AREA_LIMIT_SQFT) {
          console.warn(
            `[Scraper] ⚠️  Implausible ${areaField} value "${finalData[areaField]}" for ${url} — nulled out.`,
          );
          finalData[areaField] = null;
        }
      }
    }

    const hasAiData = Object.keys(structuredData).length > 0 || visionUsed;

    return {
      url,
      screenshotUrl: `/screenshots/${screenshotName}`,
      data: finalData,
      status: "success" as const,
      aiUsed: hasAiData,
      visionUsed,
      missingFields: missingCritical,
      cleanText,
    };
  } catch (error: any) {
    console.error(`Failed to process ${url}:`, error);
    return { url, status: "error" as const, error: error.message };
  } finally {
    await browser.close();
  }
}
