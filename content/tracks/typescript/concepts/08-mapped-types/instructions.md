# Mapped Types & Conditional Types

## What you'll learn

TypeScript's type system is Turing-complete. Mapped types let you derive new types by iterating over the keys of an existing type. Conditional types let you branch on type relationships. Together they power the built-in utility types you already use (`Partial`, `Readonly`, `Extract`, etc.) — this concept shows you how those are implemented from scratch.

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

## The task

Implement these generic utility functions whose signatures use mapped and conditional types. Tests verify runtime behavior.

- `pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>` — return a new object with only the listed keys
- `omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>` — return a new object with the listed keys removed
- `mapValues<T extends object, U>(obj: T, fn: (value: T[keyof T], key: keyof T) => U): Record<keyof T, U>` — apply `fn` to every value, preserving keys
- `partialUpdate<T extends object>(target: T, patch: Partial<T>): T` — return a new object merging `patch` over `target` (shallow; does not mutate)

Also define these types (used by the test file):

- `type Flatten<T>` — if T is an array, the element type; otherwise T
- `type NonNullish<T>` — removes `null` and `undefined` from T
