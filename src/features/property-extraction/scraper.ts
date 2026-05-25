import path from "path";
import fs from "fs";
import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

// Activate the stealth plugin globally
chromium.use(stealthPlugin());

import { propertySchema, Property } from "./schema";
import {
  normalizePrice,
  normalizePricePerSqft,
  normalizeArea,
  extractNumericValue,
} from "./normalizers";
import {
  ERROR_PAGE_PHRASES,
  isBlocked,
  extractCleanContent,
  extractBySelectors,
} from "./page-utils";
import { extractStructuredData, runVisionExtraction } from "./ai-extractor";
import { uploadScreenshotToS3 } from "@/lib/s3-client";

// Re-export schema so existing consumers (e.g. route.ts) don't need changing
export { propertySchema };
export type { Property };

// ─── Constants ───────────────────────────────────────────────────────────────

const CRITICAL_FIELDS = ["propertyTitle", "price", "location"] as const;

// ─── Browser helpers ─────────────────────────────────────────────────────────

async function launchBrowser() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: [
      // Use the new headless implementation — reduces DevTools Protocol exposure
      "--headless=new",
      // Suppress automation flags that Akamai/Cloudflare fingerprint
      "--disable-blink-features=AutomationControlled",
      // Standard flags to reduce resource usage and flakiness
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      // Helps pass canvas-based fingerprint checks
      "--use-gl=swiftshader",
      // Language matching — must align with accept-language header
      "--lang=en-IN",
    ],
  });

  // Pick a realistic, non-randomised Chrome version UA
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent,
    deviceScaleFactor: 1,
    hasTouch: false,
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    // Client-Hint headers — real Chrome sends these; headless scrapers typically omit them
    extraHTTPHeaders: {
      "accept-language": "en-IN,en;q=0.9,en-US;q=0.8",
      "sec-ch-ua":
        '"Chromium";v="136", "Google Chrome";v="136", "Not-A.Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
    },
  });

  // Note: Anti-bot fingerprint overrides are now handled by puppeteer-extra-plugin-stealth

  return { browser, context };
}

async function navigatePage(page: any, url: string) {
  // Use "domcontentloaded" for sites with Akamai/Cloudflare WAF.
  // "networkidle" holds the connection open longer, which raises
  // suspicious-activity scores and can stall on JS challenges.
  const waitStrategy =
    url.includes("housing.com") || url.includes("99acres.com")
      ? "domcontentloaded"
      : "domcontentloaded"; // Actually, networkidle is too flaky for all real estate sites. Let's use domcontentloaded for all.

  await page.goto(url, { waitUntil: waitStrategy, timeout: 60000 });
  await page.waitForSelector("body", { timeout: 10000 });
  await page
    .waitForSelector("h1, [class*='price'], [class*='title']", {
      timeout: 5000,
    })
    .catch(() =>
      console.log("[Scraper] Major markers not found, proceeding anyway..."),
    );
  // Human-like random pause (3–5s)
  await page.waitForTimeout(Math.floor(Math.random() * 2000) + 3000);
}

async function takeScreenshot(
  page: any,
  url: string,
  batchId: string,
): Promise<{ screenshotName: string; screenshotBuffer: Buffer }> {
  let slug = "property";
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "").split(".")[0];
    const segments = urlObj.pathname.split("/").filter(Boolean);
    let longest = segments.reduce(
      (max, cur) => (cur.length > max.length ? cur : max),
      "",
    );
    // Clean to alphanumeric/hyphens, max 40 chars to avoid absurdly long names
    longest = longest
      .replace(/[^a-z0-9-]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 40);
    slug = `${domain}-${longest || "listing"}`;
  } catch (e) {}

  const screenshotName = `${batchId}/${slug}-${Date.now()}.png`;
  const screenshotBuffer = await page.screenshot({ timeout: 60000 });

  await uploadScreenshotToS3(screenshotBuffer, screenshotName);

  return { screenshotName, screenshotBuffer };
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

/** Builds the zero-value default object (nulls + empty arrays) for the schema. */
function buildDefaultData(): Record<string, any> {
  return Object.keys(propertySchema.shape).reduce(
    (acc, key) => {
      acc[key] = null;
      if (key === "nearbyLandmarks" || key === "amenities") acc[key] = [];
      return acc;
    },
    {} as Record<string, any>,
  );
}

/** Applies price, area, and carpetArea normalisations in-place. */
function applyNormalizations(data: Record<string, any>): void {
  if (data.price) data.price = normalizePrice(data.price) ?? data.price;
  if (data.pricePerSqft)
    data.pricePerSqft =
      normalizePricePerSqft(data.pricePerSqft) ?? data.pricePerSqft;
  if (data.carpetArea)
    data.carpetArea = normalizeArea(data.carpetArea) ?? data.carpetArea;
  if (data.builtupArea)
    data.builtupArea = normalizeArea(data.builtupArea) ?? data.builtupArea;
  if (data.superBuiltupArea)
    data.superBuiltupArea =
      normalizeArea(data.superBuiltupArea) ?? data.superBuiltupArea;

  // Sanitize AI hallucinations: Carpet Area must be strictly less than Built-up/Super Built-up
  const cArea = data.carpetArea ? extractNumericValue(data.carpetArea) : null;
  const sbArea = data.superBuiltupArea
    ? extractNumericValue(data.superBuiltupArea)
    : null;
  const bArea = data.builtupArea ? extractNumericValue(data.builtupArea) : null;

  if (cArea !== null) {
    if (sbArea !== null && cArea >= sbArea) {
      data.carpetArea = null; // Hallucinated copy of Super Built-up
    } else if (bArea !== null && cArea >= bArea) {
      data.carpetArea = null; // Hallucinated copy of Built-up
    } else if (cArea <= 100) {
      data.carpetArea = null; // Broker entered junk data (e.g. "1 Sq.Ft")
    }
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

async function processUrl(url: string, batchId: string) {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();

  try {
    // Step 1 — Navigate
    await navigatePage(page, url);

    // Step 2 — Bot detection
    const pageTitle = await page.title();
    const pageHtml = await page.content();
    if (isBlocked(pageTitle, pageHtml))
      throw new Error("Bot protection triggered");

    // Step 3 — Screenshot
    const { screenshotName } = await takeScreenshot(page, url, batchId);

    // Step 4 — Clean text
    const cleanText = await extractCleanContent(page);

    // Step 5 — 404 / removed listing detection
    const lowerClean = cleanText.toLowerCase();
    const is404 =
      ERROR_PAGE_PHRASES.some((phrase) => lowerClean.includes(phrase)) &&
      cleanText.length < 500;
    if (is404) {
      console.log(`[Scraper] ⚠️  Error/404 page detected for: ${url}`);
      throw new Error("Page returned a 404 or error page");
    }

    // Step 6 — Deterministic selector extraction
    const selectorData = await extractBySelectors(page);

    // Step 7 — AI text extraction (JSON-LD + page text)
    const { data: structuredData, tokens: textTokens } =
      await extractStructuredData(page, cleanText, selectorData, url);

    // Step 8 — Merge: defaults < selectors < AI text
    const merged: Record<string, any> = {
      ...buildDefaultData(),
      ...selectorData,
      ...structuredData,
    };

    const missingCritical = CRITICAL_FIELDS.filter((f) => !merged[f]);
    const hasAnyArea =
      merged.carpetArea || merged.builtupArea || merged.superBuiltupArea;
    const filledFields = Object.values(merged).filter(
      (v) => v !== null && v !== "",
    ).length;
    const cleanMerged = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => v !== null && v !== ""),
    );

    // Step 9 — Vision fallback (only when critical fields are still missing)
    let aiData: Partial<Property> = {};
    let visionUsed = false;
    let visionTokens = 0;

    // if (missingCritical.length > 0 || !hasAnyArea || filledFields < 15) {
    //   ({
    //     aiData,
    //     visionUsed,
    //     tokens: visionTokens,
    //   } = await runVisionExtraction({
    //     url,
    //     screenshotPath,
    //     missingCritical: !hasAnyArea
    //       ? [...missingCritical, "Area"]
    //       : missingCritical,
    //     cleanDeterministic: cleanMerged,
    //     cleanText,
    //   }));
    // }

    // Step 10 — Final merge, normalise, sanity-check
    const finalData: Record<string, any> = { ...cleanMerged, ...aiData };
    applyNormalizations(finalData);

    const parsedData = propertySchema.safeParse(finalData);
    if (!parsedData.success) {
      console.error(`[Zod Error] Schema validation failed for ${url}`);
      throw new Error(`Data validation Failed:
        ${parsedData.error.issues[0].path} -
        ${parsedData.error.issues[0].message}
        `);
    }

    // Step 11 — Return
    const hasAiData = Object.keys(structuredData).length > 0 || visionUsed;

    return {
      url,
      screenshotUrl: screenshotName,
      data: parsedData.data,
      status: "success" as const,
      aiUsed: hasAiData,
      visionUsed,
      missingFields: missingCritical,
      cleanText,
      tokensUsed: textTokens + visionTokens,
    };
  } catch (error: any) {
    console.error(`Failed to process ${url}:`, error);
    return { url, status: "error" as const, error: error.message };
  } finally {
    await context.close();
    await browser.close();
  }
}

type PropertyExtractionResult = Awaited<ReturnType<typeof processUrl>>;

export { processUrl };
export type { PropertyExtractionResult };
