/**
 * Phrases that indicate a 404 or removed-listing page.
 * Checked against cleanText (case-insensitive) + length guard to avoid false positives.
 */
export const ERROR_PAGE_PHRASES = [
  "something is missing",
  "page not found",
  "404 not found",
  "oops, nothing here",
  "the page you requested was not found",
  "this listing has been removed",
  "listing not available",
  "property not found",
  // Housing.com / Akamai block page markers
  "request blocked",
  "suspicious activity",
  "your request was temporarily blocked",
] as const;

/**
 * Returns true if the page title or HTML body signals a bot-protection block.
 */
export function isBlocked(pageTitle: string, html: string): boolean {
  const lowTitle = pageTitle.toLowerCase();
  const lowHtml = html.toLowerCase();

  // Check the page title first — most reliable indicator of a real block
  if (
    lowTitle.includes("access denied") ||
    lowTitle.includes("robot check") ||
    lowTitle.includes("captcha")
  ) {
    return true;
  }

  // Only flag "blocked" if the body is tiny — avoids false positives on normal pages
  if (html.length < 500 && lowHtml.includes("blocked")) {
    return true;
  }

  // Housing.com / Akamai Bot Manager block page:
  // The page title is just "Housing.com" so title checks miss it.
  // Instead, detect their specific block-page body fingerprint.
  if (
    lowHtml.includes("request blocked") &&
    lowHtml.includes("suspicious activity")
  ) {
    return true;
  }

  // Generic WAF block patterns used by Akamai / Cloudflare
  if (
    lowHtml.includes("block reference id") ||
    lowHtml.includes("real client ip")
  ) {
    return true;
  }

  return false;
}

/**
 * Strips nav, footer, ads, and scripts from the page then returns the
 * remaining visible body text — ready to feed to the AI extractor.
 */
export async function extractCleanContent(page: any): Promise<string> {
  return page.evaluate(() => {
    const junkSelectors = [
      "script", "style", "iframe", "noscript",
      "footer", "nav", "header",
      ".footer", ".header", ".sidebar",
      ".seo-section", ".faq-section", ".about-portal",
      "[class*='disclaimer']", "[class*='advertisement']", "[class*='ad-unit']",
    ];

    junkSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });

    const main =
      document.querySelector(
        "main, article, #main, .main, [class*='detail-container']"
      ) || document.body;

    const text = (main as HTMLElement).innerText || "";
    const clean = text.replace(/\n{3,}/g, "\n\n").replace(/\s\s+/g, " ").trim();

    // If the entire remaining content is a security wall, return empty
    if (
      clean.toLowerCase().includes("request blocked") ||
      clean.toLowerCase().includes("suspicious activity")
    ) {
      return "";
    }

    return clean;
  });
}

/**
 * Extracts property fields using CSS selectors.
 *
 * Currently targets MagicBricks class names (.mb-ldp__*).
 * To add support for another site, add a URL-based routing block:
 *
 *   if (hostname.includes("99acres"))  return extract99AcresSelectors(page);
 *   if (hostname.includes("nobroker")) return extractNoBrokerSelectors(page);
 *
 * and implement the site-specific helper below this function.
 */
export async function extractBySelectors(page: any): Promise<Record<string, any>> {
  // Generic text helper — tries each selector in order, returns first match < 200 chars
  const get = async (...selectors: string[]) => {
    for (const sel of selectors) {
      try {
        const text = await page
          .locator(sel)
          .first()
          .textContent({ timeout: 1500 });
        const clean = text?.trim();
        if (clean && clean.length > 0 && clean.length < 200) return clean;
      } catch {}
    }
    return null;
  };

  // Label-based extraction — works on MagicBricks / 99acres detail lists
  const getByLabel = async (label: string) => {
    try {
      const parent = page
        .locator(`.mb-ldp__dtls__body__list--item`)
        .filter({ hasText: label })
        .first();
      const value = await parent
        .locator(".mb-ldp__dtls__body__list--value")
        .textContent({ timeout: 1500 });

      // Grab the first number + unit only — avoids pulling in the unit-conversion list
      const cleaned = value
        ?.trim()
        .match(/^\d+\s*(sq-ft|sqft|sq\s*ft|sq\s*m|sq\s*yd|acre|bigha|katha)/i)?.[0];
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
      '[class*="price"]'
    ),
    carpetArea: await getByLabel("Carpet Area"),

    area:
      (await getByLabel("Carpet Area")) ||
      (await getByLabel("Super Area")) ||
      (await getByLabel("Built-up Area")) ||
      (await get(".mb-ldp__dtls__body__list--value")),

    pricePerSqft:
      (
        await page
          .locator(".mb-ldp__dtls__body__list--value")
          .allInnerTexts()
          .then((texts: string[]) => {
            for (const val of texts) {
              if (!val) continue;
              const lines = val.split("\n");
              const priceLine = lines.find((line) => {
                const lower = line.toLowerCase();
                return (
                  (lower.includes("₹") || lower.includes("rs")) &&
                  (lower.includes("sqft") ||
                    lower.includes("sq.ft") ||
                    lower.includes("sq ft") ||
                    lower.includes("sqm") ||
                    lower.includes("sq.m") ||
                    lower.includes("sq m") ||
                    lower.includes("sqyd") ||
                    lower.includes("sq.yd") ||
                    lower.includes("sq yd") ||
                    lower.includes("acre") ||
                    lower.includes("bigha"))
                );
              });
              if (priceLine) return priceLine.trim();
            }
            return null;
          })
          .catch(() => null)
      ) || null,

    location: await get(
      ".mb-ldp__dtls__title--link",
      '[class*="localityName"]',
      '[class*="location"]'
    ),

    floorNo: await getByLabel("Floor"),
    verticalPositioning: await getByLabel("Floor"),
    facing: await getByLabel("Facing"),
    cardinalFacing: await getByLabel("Facing"),
    furnishingStatus: await getByLabel("Furnishing"),
    overlooking: await getByLabel("Overlooking"),
    ageOfBuilding: await getByLabel("Age of Construction"),
    constructionStatus:
      (await getByLabel("Status")) || (await getByLabel("Possession")),
    legalStatus:
      (await getByLabel("RERA ID")) || (await getByLabel("Status")),
    ownerName: await get(
      ".mb-ldp__dtls__contact-name",
      ".mb-ldp__dtls__seller-name"
    ),
    internalFloorArea: await getByLabel("Carpet Area"),
  };
}
