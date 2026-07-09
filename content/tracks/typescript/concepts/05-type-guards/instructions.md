# Type Guards

## What you'll learn

Lesson 3 introduced narrowing through `typeof` checks and discriminated unions built into the language; this lesson covers writing your **own** narrowing functions. A type guard is an expression — often a function — that narrows a union type to a specific member within a conditional branch, and TypeScript tracks the narrowed type automatically once you've written the guard, no casts required.

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

**vs other languages:** Java requires explicit `instanceof` checks and casts (`(Subtype) value`). TypeScript's narrowing is automatic — the type just changes within the branch, no cast needed. Go uses type switches (`switch v := x.(type)`) which are similar in intent but built into the language rather than user-defined.

## Watch out

- A custom type guard is a **promise you make to the compiler**, not something it verifies. `function isString(v: unknown): v is string { return true; }` compiles fine and lies about every input — the unsoundness is entirely on you. Get the guard's body right; the compiler trusts the return type blindly.
- `typeof null === "object"`, not `"null"`. A guard that only checks `typeof value === "object"` will treat `null` as an object unless you explicitly exclude it.
- `NaN` has `typeof NaN === "number"` — a naive `isNumber` guard based purely on `typeof` will call `NaN` a number. Whether that's correct depends on your domain; this lesson's `isNumber` explicitly excludes it.

## The task

Implement four functions:

**`isString(value: unknown): value is string`** — type guard for strings.

```ts
isString("hello");   // true
isString(42);         // false
isString(null);       // false
isString(undefined);  // false
```

**`isNumber(value: unknown): value is number`** — type guard for numbers, **excluding `NaN`**.

```ts
isNumber(42);    // true
isNumber(0);     // true
isNumber(NaN);   // false — excluded even though typeof NaN === "number"
isNumber("42");  // false
isNumber(null);  // false
```

**`parseNumber(value: unknown): number`** — if `value` is already a number (per `isNumber`), return it unchanged; if it's a string that parses to a valid number, parse and return it; otherwise **throw a `TypeError`**.

```ts
parseNumber(42);       // 42
parseNumber("99");     // 99
parseNumber("3.14");   // 3.14
parseNumber({});        // throws TypeError
parseNumber("abc");     // throws TypeError — not a numeric string
```

**`formatValue(value: string | number | boolean | null | undefined): string`** — format each type distinctly:

| Input type | Output |
|---|---|
| `string` | wrapped in double quotes, e.g. `"hi"` → `'"hi"'` |
| `number` | the number as a string, e.g. `42` → `"42"` |
| `boolean` | `"true"` or `"false"` |
| `null` | `"null"` |
| `undefined` | `"undefined"` |

```ts
formatValue("hi");        // '"hi"'
formatValue(42);          // "42"
formatValue(true);        // "true"
formatValue(false);       // "false"
formatValue(null);        // "null"
formatValue(undefined);   // "undefined"
```
