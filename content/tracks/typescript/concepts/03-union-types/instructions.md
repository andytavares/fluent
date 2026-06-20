# Union Types & Narrowing

## What you'll learn

A union type `A | B` means "this value is either type A or type B." TypeScript tracks which branch of a union you're in — this is called **narrowing** — and gives you the correct type within each branch.

## Key concepts

**Union types:**
```ts
type StringOrNumber = string | number;

function display(value: StringOrNumber): string {
  return String(value);
}
```

**Narrowing with `typeof`:**
```ts
function double(value: string | number): string | number {
  if (typeof value === "string") {
    return value.repeat(2);   // TypeScript knows value is string here
  }
  return value * 2;            // TypeScript knows value is number here
}
```

**Discriminated unions** — a shared literal field that tags each variant:
```ts
type Shape =
  | { kind: "circle";    radius: number }
  | { kind: "rectangle"; width: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":    return Math.PI * s.radius ** 2;
    case "rectangle": return s.width * s.height;
  }
}
```

**`never` at the end of an exhaustive switch** — if you add a new variant and forget a case, TypeScript reports an error:
```ts
default:
  const _: never = s;  // compile error if any case is unhandled
  return _;
```

**vs other languages:** There are no null-pointer exceptions by default in strict TypeScript — `null` and `undefined` are their own types in the union, not implicit members of every type. You must explicitly narrow them away.

## The task

```ts
type Result<T> =
  | { ok: true;  value: T }
  | { ok: false; error: string };
```

Implement:
- `ok<T>(value: T): Result<T>` — wraps a success value
- `err<T>(message: string): Result<T>` — wraps an error message
- `map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U>` — applies `fn` to the value if `ok`, passes the error through unchanged
- `unwrap<T>(result: Result<T>): T` — returns the value if `ok`, throws with the error message if not
