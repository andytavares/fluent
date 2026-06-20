// isString returns true and narrows to string if value is a string.
export function isString(value: unknown): value is string {
  // TODO
  return false;
}

// isNumber returns true and narrows to number if value is a non-NaN number.
export function isNumber(value: unknown): value is number {
  // TODO
  return false;
}

// parseNumber returns value as a number, parsing string representations.
// Throws TypeError if value cannot be converted.
export function parseNumber(value: unknown): number {
  // TODO
  throw new TypeError("not implemented");
}

// formatValue returns a string representation that includes the type context.
export function formatValue(
  value: string | number | boolean | null | undefined,
): string {
  // TODO
  return "";
}
