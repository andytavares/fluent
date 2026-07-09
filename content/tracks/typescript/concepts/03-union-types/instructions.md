# Union Types & Narrowing

## What you'll learn

Lesson 2 showed generics parameterizing over "any one type"; a union type `A | B` says a value is *one of several specific* types. TypeScript tracks which branch of a union you're in at any point in your code — this is called **narrowing** — and gives you the correct, specific type within each branch without a single cast.

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

**Discriminated unions** — a shared literal field ("discriminant") that tags each variant, letting the compiler narrow on a `switch` or `if`:
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

**`never` at the end of an exhaustive switch** — if you add a new variant and forget a case, TypeScript reports an error, catching the omission at compile time instead of at runtime:
```ts
default:
  const _: never = s;  // compile error if any case is unhandled
  return _;
```

**vs other languages:** There are no null-pointer exceptions by default in strict TypeScript — `null` and `undefined` are their own types in the union, not implicit members of every type. You must explicitly narrow them away before use. This is the same idea as Rust's `Option<T>` or Kotlin's nullable types (`T?`), just expressed with plain unions instead of a wrapper type.

## Watch out

- Narrowing is control-flow-based, not variable-based: if you extract `const isOk = result.ok` and branch on `isOk` instead of `result.ok` directly, TypeScript loses the connection and won't narrow `result` for you.
- A `switch` without a `default: const _: never = ...` check compiles fine even if a case is missing — the exhaustiveness guarantee only exists if you write it. It is opt-in, not automatic.
- Discriminated unions need a genuinely shared **literal** field. If the two branches don't share a common tag (e.g. one has `type: "a"` and the other has `kind: "b"`), TypeScript can't narrow between them at all — you're stuck checking individual properties.

## The task

You're building a `Result<T>` type — a common pattern for representing "either a value or an error" without throwing exceptions for expected failures.

```ts
type Result<T> =
  | { ok: true;  value: T }
  | { ok: false; error: string };
```

**`ok<T>(value: T): Result<T>`** — wraps a success value.

```ts
ok(42);      // { ok: true, value: 42 }
ok("hi");    // { ok: true, value: "hi" }
```

**`err<T>(message: string): Result<T>`** — wraps an error message. `T` is not constrained by the message — it describes what the value *would have been* had the call succeeded.

```ts
err<number>("not found");   // { ok: false, error: "not found" }
```

**`map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U>`** — if `result` is `ok`, applies `fn` to the value and wraps the result; if `result` is an error, returns the error unchanged (and does **not** call `fn`).

```ts
map(ok(5), (n) => n * 2);          // { ok: true, value: 10 }
map(ok(42), (n) => String(n));     // { ok: true, value: "42" } — T can change to U
map(err<number>("oops"), (n) => n * 2); // { ok: false, error: "oops" } — fn never runs
```

**`unwrap<T>(result: Result<T>): T`** — returns the value if `ok`; otherwise **throws** an `Error` whose message is the wrapped error string.

```ts
unwrap(ok(99));           // 99
unwrap(err("boom"));      // throws Error("boom")
```
