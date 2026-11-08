## What you build

You build a `Result<T>` type that holds either a value or an error, with four functions that use it. A union type `A | B` says a value is one of several specific types. This lesson builds on **Functions & Generics**.

## Key concepts

### A union type lists the allowed types

A value of type `string | number` is a string or a number.

```ts
type StringOrNumber = string | number;

function show(v: StringOrNumber): string {
  return String(v);
}
```

### Narrowing gives each branch a specific type

TypeScript tracks which member of the union a value is at each point in the code. This is narrowing. A `typeof` check narrows the value without a cast.

```ts
function double(
  value: string | number,
): string | number {
  if (typeof value === "string") {
    // value is string here
    return value.repeat(2);
  }
  // value is number here
  return value * 2;
}
```

### A discriminated union tags each variant

Each variant has a shared literal field, the discriminant. A `switch` or `if` on that field narrows to one variant.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.w * s.h;
  }
}
```

### `never` makes a `switch` exhaustive

Assign the value to `never` in the `default` case. If you add a variant and forget its case, the compiler reports an error.

```ts
default:
  // Compile error if a case is missing
  const _: never = s;
  return _;
```

### `null` and `undefined` are separate types

With strict null checks, `null` and `undefined` are not members of every type. You must narrow them away before use. Rust's `Option<T>` and Kotlin's `T?` express the same idea.

```ts
function len(s: string | null): number {
  if (s === null) return 0;
  return s.length;
}
```

## Watch out

- A saved condition such as `const isOk = result.ok` narrows `result` only in TypeScript 4.4 or later.
- Reassign `result` after you save the condition, and the narrowing is lost.
- A `switch` with a missing case compiles. Only the `never` check makes it exhaustive, and you must write it.
- Narrowing needs a shared literal field. Variants tagged `type: "a"` and `kind: "b"` do not narrow.

## The task

Build a `Result<T>` type. It holds either a value or an error, so expected failures need no exception.

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

1. `ok<T>(value: T): Result<T>` returns `{ ok: true, value }`.
2. `err<T>(message: string): Result<T>` returns `{ ok: false, error: message }`.
3. In `err`, `T` is the type the value has on success.
4. `map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U>` applies `fn` to an `ok` value and wraps the output.
5. `map` returns an error result unchanged and does not call `fn`.
6. `unwrap<T>(result: Result<T>): T` returns the value of an `ok` result.
7. For an error result, `unwrap` throws an `Error` whose message is the error string.

`fn` can change the type, so `T` and `U` can differ.

```ts
ok(42);   // { ok: true, value: 42 }
err<number>("not found");
// { ok: false, error: "not found" }

map(ok(5), (n) => n * 2);
// { ok: true, value: 10 }
map(ok(42), (n) => String(n));
// { ok: true, value: "42" }
map(err<number>("oops"), (n) => n * 2);
// { ok: false, error: "oops" }

unwrap(ok(99));       // 99
unwrap(err("boom"));
// throws Error("boom")
```
