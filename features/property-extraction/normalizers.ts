/**
 * Constants for unit conversion factors to Square Feet.
 */
const SQM_TO_SQFT = 10.7639;
const SQYD_TO_SQFT = 9;
const ACRE_TO_SQFT = 43560;

const DEFAULT_UNIT = "sqft";

/**
 * Reusable Regular Expressions for cleaning and extraction.
 */
const NUMERIC_REGEX = /(\d+(?:\.\d+)?)/;
const WHITESPACE_REGEX = /\s+/g;

/**
 * Reusable Regular Expressions for unit detection.
 */
const SQM_REGEX = /sq\.?m|square\s*meter/i;
const SQYD_REGEX = /sq\.?yd|square\s*yard/i;
const ACRE_REGEX = /acre/i;

/**
 * Reusable Regular Expressions for area type detection.
 */
const CARPET_REGEX = /carpet/i;
const SUPER_BUILT_REGEX = /super\s*built[\s-]*up/i;
const BUILT_UP_REGEX = /built[\s-]*up/i;
const SUPER_REGEX = /super/i;

const AREA_TYPE_MAP = [
  { regex: CARPET_REGEX, label: "Carpet Area" },
  { regex: SUPER_BUILT_REGEX, label: "Super Built-up Area" },
  { regex: BUILT_UP_REGEX, label: "Built-up Area" },
  { regex: SUPER_REGEX, label: "Super Area" },
];

/**
 * Helper: Extracts the first numeric value from a string (ignores commas).
 */
function extractNumericValue(raw: string): number | null {
  const match = raw.replace(/,/g, "").match(NUMERIC_REGEX);
  if (!match) return null;
  const num = Number(match[1]);
  return !num || Number.isNaN(num) ? null : num;
}

/**
 * Helper: Converts a numeric value to SqFt based on unit detected in the raw string.
 * Note: Area is multiplied by the factor, while Price-per-unit is divided by it.
 */
function convertToSqFt(value: number, raw: string, mode: "area" | "price"): number {
  let factor = 1;
  if (SQM_REGEX.test(raw)) factor = SQM_TO_SQFT;
  else if (SQYD_REGEX.test(raw)) factor = SQYD_TO_SQFT;
  else if (ACRE_REGEX.test(raw)) factor = ACRE_TO_SQFT;

  return mode === "area" ? value * factor : value / factor;
}

/**
 * Collapses all whitespace/newlines in a raw price string.
 * Handles SquareYards-style: "₹ 85 L\n            \n                + Charges" → "₹ 85 L + Charges"
 */
export function normalizePrice(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.replace(WHITESPACE_REGEX, " ").trim() || null;
}

/**
 * Normalises any pricePerSqft string to a consistent "₹X,XXX/sqft" format.
 * Handles: "₹24,286/sqft", "₹3,132 per sqft", "₹ 84,307 per sqft", "24286"
 */
export function normalizePricePerSqft(raw?: string | null): string | null {
  if (!raw) return null;
  
  const num = extractNumericValue(raw);
  if (num === null) return null;

  const normalizedValue = Math.round(convertToSqFt(num, raw, "price"));
  return `\u20b9${normalizedValue.toLocaleString("en-IN")}/${DEFAULT_UNIT}`;
}

/**
 * Normalises any area string to "350 sqft Carpet Area" format.
 * Detects area type from the raw string if present.
 */
export function normalizeArea(raw?: string | null): string | null {
  if (!raw) return null;

  const num = extractNumericValue(raw);
  if (num === null) return null;

  const normalizedValue = Math.round(convertToSqFt(num, raw, "area"));

  // Detect Area Type using the map
  const detected = AREA_TYPE_MAP.find((item) => item.regex.test(raw));
  const areaTypeLabel = detected ? ` ${detected.label}` : "";

  return `${normalizedValue} ${DEFAULT_UNIT}${areaTypeLabel}`;
}
