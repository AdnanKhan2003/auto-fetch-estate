import "is-plain-object";
import path from "path";
import fs from "fs";
import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

const userDataDirPlugin = require("puppeteer-extra-plugin-user-data-dir");
const userPreferencesPlugin = require("puppeteer-extra-plugin-user-preferences");
chromium.use(userDataDirPlugin());
chromium.use(userPreferencesPlugin());
chromium.use(stealthPlugin());

import { propertySchema, Property } from "./schema";
import {
  cleanPriceWhitespace,
  normalizeRatePerSqft,
  normalizeArea,
  extractNumericValue,
} from "./normalizers";
import {
  ERROR_PAGE_PHRASES,
  isBlocked,
  extractCleanBody,
  extractBySelectors,
} from "./page-utils";
import { extractStructuredData, runVisionExtraction } from "./ai-extractor";
import { uploadScreenshotToS3 } from "@/lib/s3-client";

// Re-export schema so existing consumers (e.g. route.ts) don't need changing
export { propertySchema };
export type { Property };

// ─── Constants ───────────────────────────────────────────────────────────────

const CRITICAL_FIELDS = ["propertyTitle", "price", "location"] as const;

let globalBrowser = (globalThis as any).browser || null;
let browserPromise: Promise<any> | null = null;

// 1 Global Browser instance shared by all parallel runs
async function getSharedBrowser() {
  if (globalBrowser && globalBrowser.isConnected()) {
    return globalBrowser;
  }

  if (!browserPromise) {
    browserPromise = (async () => {
      const isVercel =
        !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

      let launchOptions: any = {
        headless: true,
        args: [
          "--headless=new",
          "--disable-blink-features=AutomationControlled",
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--use-gl=swiftshader",
          "--lang=en-IN",
          "--single-process",
          "--disable-setuid-sandbox",
        ],
      };
      if (isVercel) {
        // On Vercel: use @sparticuz/chromium binary
        const sparticuzChromium = (await import("@sparticuz/chromium")).default;
        launchOptions.executablePath = await sparticuzChromium.executablePath();
      } else {
        // Locally: use system Chrome
        launchOptions.channel = "chrome";
      }
      const browser = await chromium.launch(launchOptions);
      globalBrowser = browser;
      (globalThis as any).browser = browser;
      return browser;
    })().catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

// Isolated Context per scraper run
async function createIsolatedContext() {
  const browser = await getSharedBrowser();

  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent,
    deviceScaleFactor: 1,
    hasTouch: false,
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
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

  return context;
}

// Navigates to target URL with site-specific loading thresholds and random user delays
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

// Capture screenshot of page
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

// Pre-populates a schema we give to ai, with empty array and null values matching the property schema
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

// Applies price, area, and carpetArea normalisations in-place.
function applyNormalizations(data: Record<string, any>): void {
  if (data.price) data.price = cleanPriceWhitespace(data.price) ?? data.price;
  if (data.pricePerSqft)
    data.pricePerSqft =
      normalizeRatePerSqft(data.pricePerSqft) ?? data.pricePerSqft;
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

// Runs the complete pipeline: downloads page content, screenshots, parses html, and triggers AI extraction
async function processUrl(url: string, batchId: string) {
  let context;
  try {
    context = await createIsolatedContext();
    const page = await context.newPage();
    // Step 1 — Navigate
    await navigatePage(page, url);

    // Step 2 — Bot detection
    const pageTitle = await page.title();
    const pageHtml = await page.content();
    if (isBlocked(pageTitle, pageHtml))
      throw new Error("Bot protection triggered");

    // Step 3 — Screenshot
    const { screenshotName, screenshotBuffer } = await takeScreenshot(
      page,
      url,
      batchId,
    );

    // Step 4 — Clean text
    const cleanText = await extractCleanBody(page);

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

    if (missingCritical.length > 0 || !hasAnyArea || filledFields < 15) {
      ({
        aiData,
        visionUsed,
        tokens: visionTokens,
      } = await runVisionExtraction({
        url,
        screenshotBuffer,
        missingCritical: !hasAnyArea
          ? [...missingCritical, "Area"]
          : missingCritical,
        cleanDeterministic: cleanMerged,
        cleanText,
      }));
    }

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
    if (context) {
      await context.close().catch(console.error);
    }
  }
}

type PropertyExtractionResult = Awaited<ReturnType<typeof processUrl>>;

export { getSharedBrowser, createIsolatedContext, processUrl };
export type { PropertyExtractionResult };
