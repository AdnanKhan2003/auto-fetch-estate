import {
  NUMERIC_REGEX,
  WHITESPACE_REGEX,
  SQM_REGEX,
  SQYD_REGEX,
  ACRE_REGEX,
  CARPET_REGEX,
  SUPER_BUILT_REGEX,
  BUILT_UP_REGEX,
  SUPER_REGEX,
  SQM_TO_SQFT,
  SQYD_TO_SQFT,
  ACRE_TO_SQFT,
  DEFAULT_UNIT,
  COMMA_REGEX,
} from "@/lib/regex";

const AREA_TYPE_MAP = [
  { regex: CARPET_REGEX, label: "Carpet Area" },
  { regex: SUPER_BUILT_REGEX, label: "Super Built-up Area" },
  { regex: BUILT_UP_REGEX, label: "Built-up Area" },
  { regex: SUPER_REGEX, label: "Super Area" },
];

// Extracts the first numeric value from a string (ignores commas).
function extractNumericValue(raw: string): number | null {
  const match = raw.replace(COMMA_REGEX, "").match(NUMERIC_REGEX);
  if (!match) return null;

  const num = Number(match[1]);
  return !num || Number.isNaN(num) ? null : num;
}

// Converts a numeric value to SqFt based on unit detected in the raw string.
function convertToSqFt(
  value: number,
  raw: string,
  mode: "area" | "price",
): number {
  let factor = 1;

  // Area is multiplied by the factor, while Price-per-unit is divided by it.
  if (SQM_REGEX.test(raw)) factor = SQM_TO_SQFT;
  else if (SQYD_REGEX.test(raw)) factor = SQYD_TO_SQFT;
  else if (ACRE_REGEX.test(raw)) factor = ACRE_TO_SQFT;

  return mode === "area" ? value * factor : value / factor;
}

// Collapses all whitespace/newlines in a raw price string.
function cleanPriceWhitespace(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.replace(WHITESPACE_REGEX, " ").trim() || null;
}

// Normalises any pricePerSqft string to a consistent "₹X,XXX/sqft" format.
function normalizeRatePerSqft(raw?: string | null): string | null {
  if (!raw) return null;

  const num = extractNumericValue(raw);
  if (num === null) return null;

  const normalizedValue = Math.round(convertToSqFt(num, raw, "price"));
  return `\u20b9${normalizedValue.toLocaleString("en-IN")}/${DEFAULT_UNIT}`;
}

//Normalises any area string to "350 sqft Carpet Area" format.
function normalizeArea(raw?: string | null): string | null {
  if (!raw) return null;

  const num = extractNumericValue(raw);
  if (num === null) return null;

  const normalizedValue = Math.round(convertToSqFt(num, raw, "area"));

  if (normalizedValue < 100) return null;

  // Detect Area Type using the map
  const detected = AREA_TYPE_MAP.find((item) => item.regex.test(raw));
  const areaTypeLabel = detected ? ` ${detected.label}` : "";

  return `${normalizedValue} ${DEFAULT_UNIT}${areaTypeLabel}`;
}

export {
  extractNumericValue,
  cleanPriceWhitespace,
  normalizeRatePerSqft,
  normalizeArea,
};
