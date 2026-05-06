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
  const num = Math.round(Number(match[1]));
  if (!num || Number.isNaN(num)) return null;
  return `\u20b9${num.toLocaleString("en-IN")}/sqft`;
}

/**
 * Normalises any area string to "350 sqft Carpet Area" format.
 * Detects area type from the raw string if present.
 */
export function normalizeArea(raw?: string | null): string | null {
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
