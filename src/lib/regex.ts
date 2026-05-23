const COMMA_REGEX = /,/g;
const NUMERIC_REGEX = /(\d+(?:\.\d+)?)/;
const WHITESPACE_REGEX = /\s+/g;

/**
 * Constants for unit conversion factors to Square Feet.
 */
const SQM_TO_SQFT = 10.7639;
const SQYD_TO_SQFT = 9;
const ACRE_TO_SQFT = 43560;

const DEFAULT_UNIT = "sqft";

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
