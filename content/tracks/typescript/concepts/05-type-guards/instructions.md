# Type Guards

## What you'll learn

A type guard is an expression that narrows a union type to a specific member within a conditional branch. TypeScript tracks the narrowed type automatically — no casts required.

## Key concepts

**Built-in narrowing with `typeof`:**
```ts
function format(value: string | number): string {
  if (typeof value === "string") return value.toUpperCase();
  return value.toFixed(2);
}
```

**`instanceof` narrowing:**
```ts
function handleError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
```

**Custom type guard** — a function with a `value is T` return type:
```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// TypeScript now knows value is string inside the if block:
if (isString(value)) {
  value.toUpperCase();  // ok — not possible without the guard
}
```

**Exhaustiveness check with `never`:**
```ts
type Color = "red" | "green" | "blue";

function hex(c: Color): string {
  switch (c) {
    case "red":   return "#ff0000";
    case "green": return "#00ff00";
    case "blue":  return "#0000ff";
    default:
      const _: never = c;  // compile error if a case is missing
      return _;
  }
}
```

**vs other languages:** Java requires explicit `instanceof` checks and casts (`(Subtype) value`). TypeScript's narrowing is automatic — the type just changes within the branch. Go uses type switches (`switch v := x.(type)`) which are similar in intent.

## The task

Implement four functions:

- `isString(value: unknown): value is string` — type guard for strings
- `isNumber(value: unknown): value is number` — type guard for numbers (excludes NaN)
- `parseNumber(value: unknown): number` — if `value` is already a number, return it; if it's a numeric string, parse and return it; otherwise throw `TypeError`
- `formatValue(value: string | number | boolean | null | undefined): string` — format each type distinctly:
  - `string` → surround with double quotes: `"hello"`
  - `number` → the number as a string: `42`
  - `boolean` → `"true"` or `"false"`
  - `null` → `"null"`
  - `undefined` → `"undefined"`
