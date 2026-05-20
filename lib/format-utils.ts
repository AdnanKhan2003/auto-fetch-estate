import { COMMA_REGEX, NUMERIC_REGEX } from "./regex";

export function parseIndianNumber(val: any): number {
  if (!val) return 0;
  const str = String(val).toLowerCase().replace(COMMA_REGEX, "");

  // Extract the number part
  const match = str.match(NUMERIC_REGEX);
  if (!match) return 0;

  let num = Number(match[1]);

  // Multiply based on unit
  if (str.includes("cr") || str.includes("crore")) {
    num *= 10000000;
  } else if (
    str.includes("lac") ||
    str.includes("lakh") ||
    str.includes(" l")
  ) {
    num *= 100000;
  } else if (str.includes("k")) {
    num *= 1000;
  }

  return num;
}

export function calculateRawRatePerSqft(
  priceStr: any,
  effectiveArea: number | null,
): number | null {
  const price = parseIndianNumber(priceStr);

  if (!price || !effectiveArea || effectiveArea <= 0) return null;
  return Math.round(price / effectiveArea);
}

export function calculateRatePerSqft(
  priceStr: any,
  effectiveArea: number | null,
): string | null {
  const rate = calculateRawRatePerSqft(
    priceStr,
    effectiveArea,
  );

  if (!rate) return null;

  // Format as Indian Rupee, e.g., ₹12,500 / sqft
  return `₹${rate.toLocaleString("en-IN")} / sqft`;
}
