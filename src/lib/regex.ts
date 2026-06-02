// Constants for unit conversion factors to Square Feet.

const SQM_TO_SQFT = 10.7639;
const SQYD_TO_SQFT = 9;
const ACRE_TO_SQFT = 43560;

// strip thousand separators (e.g. "1,50,000" -> "150000")
const COMMA_REGEX = /,/g;

// capture integers and decimals (e.g. extracts "1.5" from "₹ 1.5 Cr")
const NUMERIC_REGEX = /(\d+(?:\.\d+)?)/;

// collapse double spaces, tabs, and newlines
const WHITESPACE_REGEX = /\s+/g;

const DEFAULT_UNIT = "sqft";

// Reusable Regular Expressions for unit detection.

// matches "sq.m", "sqm", "square meter" (case-insensitive)
const SQM_REGEX = /sq\.?m|square\s*meter/i;

// matches "sq.yd", "sqyd", "square yard" (case-insensitive)
const SQYD_REGEX = /sq\.?yd|square\s*yard/i;

// matches "acre" or "acres" (case-insensitive)
const ACRE_REGEX = /acre/i;

// Reusable Regular Expressions for area type detection.

// matches "carpet", "carpet-area" (case-insensitive)
const CARPET_REGEX = /carpet/i;

// matches "super built-up", "super built up" (case-insensitive)
const SUPER_BUILT_REGEX = /super\s*built[\s-]*up/i;

// matches "built-up", "built up" (case-insensitive)
const BUILT_UP_REGEX = /built[\s-]*up/i;

// matches fallback "super" or "super area" (case-insensitive)
const SUPER_REGEX = /super/i;

export {
  COMMA_REGEX,
  NUMERIC_REGEX,
  WHITESPACE_REGEX,
  SQM_TO_SQFT,
  SQYD_TO_SQFT,
  ACRE_TO_SQFT,
  DEFAULT_UNIT,
  SQM_REGEX,
  SQYD_REGEX,
  ACRE_REGEX,
  CARPET_REGEX,
  SUPER_BUILT_REGEX,
  BUILT_UP_REGEX,
  SUPER_REGEX,
};
