# Mapped Types & Conditional Types

## What you'll learn

Lesson 4 used `Partial`, `Pick`, and `Omit` as black boxes. TypeScript's type system is Turing-complete, and this lesson opens those boxes: mapped types let you derive new types by iterating over the keys of an existing type, and conditional types let you branch on type relationships. Together they power every built-in utility type you've already used.

## Key concepts

**Mapped types** iterate over a union of keys using `in keyof`:

```ts
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Partial<T> = { [K in keyof T]?: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };
```

**Modifiers** can be added or removed with `+` / `-`:

```ts
// Remove readonly from every property
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
// Remove optionality
type Required<T> = { [K in keyof T]-?: T[K] };
```

**Conditional types** express `if/else` at the type level:

```ts
type IsString<T> = T extends string ? true : false;
type Flatten<T> = T extends Array<infer Item> ? Item : T;
```

**`infer`** captures a type variable inside an `extends` clause:

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

**`Extract`, `Exclude`, `NonNullable`** are all one-liners built on conditional types:

```ts
type Extract<T, U>     = T extends U ? T : never;
type Exclude<T, U>     = T extends U ? never : T;
type NonNullable<T>    = T extends null | undefined ? never : T;
```

**vs JavaScript:** None of this exists in JavaScript — it is purely TypeScript's compile-time type algebra. The runtime behavior of functions using these types is identical to plain JS; the types just constrain what callers can pass.

## Watch out

- A conditional type is **distributive** when its checked type is a bare, unwrapped type parameter: `T extends U ? X : Y` applied to a union `T = A | B` evaluates as `(A extends U ? X : Y) | (B extends U ? X : Y)`, not as one check against the whole union. Wrapping `T` (e.g. `[T] extends [U] ? ... : ...`) suppresses distribution when you don't want it — a frequent source of "why did my conditional type do that" confusion.
- `keyof T` on a type with an index signature (`{ [key: string]: unknown }`) widens to `string | number`, not the specific literal keys you might expect from a similar-looking interface.
- `infer` only works inside the `extends` clause of a conditional type — you cannot use it standalone to "declare a type variable" anywhere else.

## The task

Implement these generic utility functions whose signatures use mapped and conditional types. Tests verify runtime behavior.

**`pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>`** — return a new object with only the listed keys.

```ts
const user = { id: 1, name: "Alice", role: "admin" };
pick(user, ["id"]);          // { id: 1 }
pick(user, ["id", "name"]);  // { id: 1, name: "Alice" }
```

**`omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>`** — return a new object with the listed keys removed.

```ts
omit(user, ["role"]);  // { id: 1, name: "Alice" }
omit(user, ["id"]);    // { name: "Alice", role: "admin" } — "id" key is absent, not just undefined
```

**`mapValues<T extends object, U>(obj: T, fn: (value: T[keyof T], key: keyof T) => U): Record<keyof T, U>`** — apply `fn` to every value, preserving keys.

```ts
mapValues({ a: 1, b: 2, c: 3 }, (v) => (v as number) * 2);  // { a: 2, b: 4, c: 6 }
mapValues({ x: 10, y: 20 }, (v) => String(v));               // { x: "10", y: "20" }
```

**`partialUpdate<T extends object>(target: T, patch: Partial<T>): T`** — return a **new** object merging `patch` over `target` (shallow; does not mutate `target`).

```ts
partialUpdate(user, { name: "Bob" });  // { id: 1, name: "Bob", role: "admin" }
partialUpdate(user, {});               // equivalent copy of user, unchanged
// user.name is still "Alice" after both calls — target is never mutated
```

Also define these types (used by the test file and by callers who want compile-time guarantees):

- `type Flatten<T>` — if `T` is an array, the element type; otherwise `T` unchanged. `Flatten<string[]>` is `string`; `Flatten<number>` is `number`.
- `type NonNullish<T>` — removes `null` and `undefined` from `T`. `NonNullish<string | null>` is `string`.
