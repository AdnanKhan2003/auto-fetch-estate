import path from "path";
import fs from "fs";
import { chromium } from "playwright-core"; // system Chrome (swap to 'playwright' for Docker/CI)

import { propertySchema, Property } from "./schema";
import { normalizePrice, normalizePricePerSqft, normalizeArea } from "./normalizers";
import { ERROR_PAGE_PHRASES, isBlocked, extractCleanContent, extractBySelectors } from "./page-utils";
import { extractStructuredData, runVisionExtraction } from "./ai-extractor";

// Re-export schema so existing consumers (e.g. route.ts) don't need changing
export { propertySchema };
export type { Property };

// ─── Constants ───────────────────────────────────────────────────────────────

const RESIDENTIAL_AREA_LIMIT_SQFT = 50_000;

const CRITICAL_FIELDS = ["propertyTitle", "price", "location", "area"] as const;

const NUMERIC_EXTRACTION_REGEX = /(\d+(?:[,\d]*)?)/;

// ─── Browser helpers ─────────────────────────────────────────────────────────

async function launchBrowser() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/12" +
      Math.floor(Math.random() * 9) +
      ".0.0.0 Safari/537.36",
    deviceScaleFactor: 1,
    hasTouch: false,
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
  });

  // Anti-bot fingerprint overrides
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    (window.navigator as any).chrome = { runtime: {} };
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-IN", "en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    const originalQuery = window.navigator.permissions.query;
    (window.navigator.permissions as any).query = (parameters: any) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });

  return { browser, context };
}

async function navigatePage(page: any, url: string) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("body", { timeout: 10000 });
  await page
    .waitForSelector("h1, [class*='price'], [class*='title']", { timeout: 5000 })
    .catch(() => console.log("[Scraper] Major markers not found, proceeding anyway..."));
  // Human-like random pause (3–5s)
  await page.waitForTimeout(Math.floor(Math.random() * 2000) + 3000);
}

async function takeScreenshot(page: any): Promise<{ screenshotName: string; screenshotPath: string }> {
  const screenshotName = `screenshot-${Date.now()}.png`;
  const screenshotPath = path.join(process.cwd(), "public", "screenshots", screenshotName);
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath });
  return { screenshotName, screenshotPath };
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

/** Builds the zero-value default object (nulls + empty arrays) for the schema. */
function buildDefaultData(): Record<string, any> {
  return Object.keys(propertySchema.shape).reduce((acc, key) => {
    acc[key] = null;
    if (key === "nearbyLandmarks" || key === "amenities") acc[key] = [];
    return acc;
  }, {} as Record<string, any>);
}

/** Applies price, area, and carpetArea normalisations in-place. */
function applyNormalizations(data: Record<string, any>): void {
  if (data.price)        data.price        = normalizePrice(data.price)              ?? data.price;
  if (data.pricePerSqft) data.pricePerSqft = normalizePricePerSqft(data.pricePerSqft) ?? data.pricePerSqft;
  if (data.area)         data.area         = normalizeArea(data.area)                ?? data.area;
  if (data.carpetArea)   data.carpetArea   = normalizeArea(data.carpetArea)          ?? data.carpetArea;
}

/** Nulls out area fields with physically impossible values (> 50,000 sqft). */
function applySanityChecks(data: Record<string, any>, url: string): void {
  for (const field of ["area", "carpetArea", "internalFloorArea"] as const) {
    if (!data[field]) continue;
    const numStr = (data[field] as string).match(NUMERIC_EXTRACTION_REGEX)?.[1]?.replace(/,/g, "");
    const areaNum = numStr ? Number(numStr) : NaN;
    if (!Number.isNaN(areaNum) && areaNum > RESIDENTIAL_AREA_LIMIT_SQFT) {
      console.warn(`[Scraper] ⚠️  Implausible ${field} value "${data[field]}" for ${url} — nulled out.`);
      data[field] = null;
    }
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function processUrl(url: string) {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();

  try {
    // Step 1 — Navigate
    await navigatePage(page, url);

    // Step 2 — Bot detection
    const pageTitle = await page.title();
    const pageHtml  = await page.content();
    if (isBlocked(pageTitle, pageHtml)) throw new Error("Bot protection triggered");

    // Step 3 — Screenshot
    const { screenshotName, screenshotPath } = await takeScreenshot(page);

    // Step 4 — Clean text
    const cleanText = await extractCleanContent(page);
    console.log("\n" + "=".repeat(60));
    console.log(`UNSTRUCTURED BODY DATA — ${url}`);
    console.log("=".repeat(60));
    console.log(`characters: ${cleanText.length}`);
    console.log(cleanText.length === 0
      ? "(EMPTY — bot wall, hydration not finished, or extractCleanContent removed all visible text)"
      : cleanText);
    console.log("=".repeat(60) + "\n");

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
    console.log("\n" + "=".repeat(60));
    console.log(`SELECTORS DATA — ${url}`);
    console.log("=".repeat(60));
    console.log(JSON.stringify(selectorData, null, 2));
    console.log("=".repeat(60) + "\n");

    // Step 7 — AI text extraction (JSON-LD + page text)
    const structuredData = await extractStructuredData(page, cleanText, selectorData, url);

    // Step 8 — Merge: defaults < selectors < AI text
    const merged: Record<string, any> = {
      ...buildDefaultData(),
      ...selectorData,
      ...structuredData,
    };

    const missingCritical = CRITICAL_FIELDS.filter((f) => !merged[f]);
    const filledFields    = Object.values(merged).filter((v) => v !== null && v !== "").length;
    const cleanMerged     = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => v !== null && v !== ""),
    );

    // Step 9 — Vision fallback (only when critical fields are still missing)
    let aiData: Partial<Property> = {};
    let visionUsed = false;

    if (missingCritical.length > 0 || filledFields < 15) {
      ({ aiData, visionUsed } = await runVisionExtraction({
        url,
        screenshotPath,
        missingCritical,
        cleanDeterministic: cleanMerged,
        cleanText,
      }));
    }

    // Step 10 — Final merge, normalise, sanity-check
    const finalData: Record<string, any> = { ...cleanMerged, ...aiData };
    applyNormalizations(finalData);
    applySanityChecks(finalData, url);

    // Step 11 — Return
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
