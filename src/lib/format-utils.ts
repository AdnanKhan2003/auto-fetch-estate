import { COMMA_REGEX, NUMERIC_REGEX } from "./regex";

// Parse from Human readable String to (Ex: '1.5 Cr' -> 15000000)
function parseIndianPrice(val: any): number {
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

// Calculates raw rate per square foot. (Ex: '1.5 Cr' / 1000 -> 15000)
function calculateRatePerSqft(
  priceStr: any,
  effectiveArea: number | null,
): number | null {
  const price = parseIndianPrice(priceStr);

  if (!price || !effectiveArea || effectiveArea <= 0) return null;
  return Math.round(price / effectiveArea);
}

// Calculates and formats rate per square foot to Indian currency style. (Ex: ("1.5 Cr", 1000) -> "₹15,000 / sqft")
function formatRatePerSqft(
  priceStr: any,
  effectiveArea: number | null,
): string | null {
  const rate = calculateRatePerSqft(priceStr, effectiveArea);

  if (!rate) return null;

  // Format as Indian Rupee, e.g., ₹12,500 / sqft
  return `₹${rate.toLocaleString("en-IN")} / sqft`;
}

export { parseIndianPrice, calculateRatePerSqft, formatRatePerSqft };
