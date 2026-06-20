export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function parseNumber(value: unknown): number {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const n = Number(value);
    if (!Number.isNaN(n)) return n;
  }
  throw new TypeError(`Cannot convert ${String(value)} to number`);
}

export function formatValue(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null)      return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string")  return `"${value}"`;
  if (typeof value === "number")  return String(value);
  if (typeof value === "boolean") return String(value);
  const _: never = value;
  return _;
}
