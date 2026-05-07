/**
 * Collapses all whitespace/newlines in a raw price string.
 * Handles SquareYards-style: "₹ 85 L\n            \n                + Charges" → "₹ 85 L + Charges"
 */
export function normalizePrice(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.replace(/\s+/g, " ").trim() || null;
}

/**
 * Normalises any pricePerSqft string to a consistent "₹X,XXX/sqft" format.
 * Handles: "₹24,286/sqft", "₹3,132 per sqft", "₹ 84,307 per sqft", "24286"
 */
export function normalizePricePerSqft(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  
  let num = Number(match[1]);
  if (!num || Number.isNaN(num)) return null;

  const lowerRaw = raw.toLowerCase();
  if (lowerRaw.includes("sqm") || lowerRaw.includes("sq.m") || lowerRaw.includes("sq m") || lowerRaw.includes("square meter")) {
    num = num / 10.7639;
  } else if (lowerRaw.includes("sqyd") || lowerRaw.includes("sq.yd") || lowerRaw.includes("sq yd") || lowerRaw.includes("sq yard") || lowerRaw.includes("square yard")) {
    num = num / 9;
  } else if (lowerRaw.includes("acre")) {
    num = num / 43560;
  }

  num = Math.round(num);
  return `\u20b9${num.toLocaleString("en-IN")}/sqft`;
}

/**
 * Normalises any area string to "350 sqft Carpet Area" format.
 * Detects area type from the raw string if present.
 */
export function normalizeArea(raw?: string | null): string | null {
  if (!raw) return null;
  const numMatch = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return null;
  
  let num = Number(numMatch[1]);
  if (!num || Number.isNaN(num)) return null;

  const lowerRaw = raw.toLowerCase();
  if (lowerRaw.includes("sqm") || lowerRaw.includes("sq.m") || lowerRaw.includes("sq m") || lowerRaw.includes("square meter")) {
    num = num * 10.7639;
  } else if (lowerRaw.includes("sqyd") || lowerRaw.includes("sq.yd") || lowerRaw.includes("sq yd") || lowerRaw.includes("sq yard") || lowerRaw.includes("square yard")) {
    num = num * 9;
  } else if (lowerRaw.includes("acre")) {
    num = num * 43560;
  }

  num = Math.round(num);

  let areaType = "";
  if (/carpet/i.test(raw)) areaType = "Carpet Area";
  else if (/super\s*built[\s-]*up/i.test(raw)) areaType = "Super Built-up Area";
  else if (/built[\s-]*up/i.test(raw)) areaType = "Built-up Area";
  else if (/super/i.test(raw)) areaType = "Super Area";

  return areaType ? `${num} sqft ${areaType}` : `${num} sqft`;
}
