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
  } else if (str.includes("lac") || str.includes("lakh") || str.includes(" l")) {
    num *= 100000;
  } else if (str.includes("k")) {
    num *= 1000;
  }
  
  return num;
}

export function calculateRawRatePerSqft(priceStr: any, carpetAreaStr: any, fallbackAreaStr: any): number | null {
  const price = parseIndianNumber(priceStr);
  const areaToUse = carpetAreaStr || fallbackAreaStr;
  const area = parseIndianNumber(areaToUse);

  if (!price || !area || area === 0) return null;

  return Math.round(price / area);
}

export function calculateRatePerSqft(priceStr: any, carpetAreaStr: any, fallbackAreaStr: any): string | null {
  const rate = calculateRawRatePerSqft(priceStr, carpetAreaStr, fallbackAreaStr);
  
  if (!rate) return null;
  
  // Format as Indian Rupee, e.g., ₹12,500 / sqft
  return `₹${rate.toLocaleString('en-IN')} / sqft`;
}
