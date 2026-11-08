## What you build

You write `pick`, `omit`, `mapValues` and `partialUpdate`, whose signatures use mapped and conditional types. Mapped types derive a new type from the keys of an existing type. Conditional types branch on type relationships. Together they build every utility type from **Utility Types**. This lesson builds on **Utility Types**.

## Key concepts

### A mapped type iterates over keys

`[K in keyof T]` visits each key of `T`. `T[K]` is the type of that property.

```ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};
type Partial<T> = {
  [K in keyof T]?: T[K];
};
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};
```

### `+` and `-` add or remove modifiers

`-readonly` removes `readonly`. `-?` removes optionality.

```ts
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};
type Required<T> = {
  [K in keyof T]-?: T[K];
};
```

### A conditional type is an if/else for types

`T extends U ? X : Y` gives `X` when `T` is assignable to `U`, and `Y` otherwise.

```ts
type IsString<T> =
  T extends string ? true : false;
type Flatten<T> =
  T extends Array<infer Item> ? Item : T;
```

### `infer` captures a type inside `extends`

`infer R` names the type at that position so that the true branch can use it.

```ts
type ReturnType<T> =
  T extends (...args: any[]) => infer R
    ? R
    : never;
```

### `Extract`, `Exclude` and `NonNullable` are conditional types

Each one is one line.

```ts
type Extract<T, U> =
  T extends U ? T : never;
type Exclude<T, U> =
  T extends U ? never : T;
type NonNullable<T> =
  T extends null | undefined ? never : T;
```

### These types exist only at compile time

JavaScript has nothing like them. The runtime code is plain JavaScript. The types only limit what callers can pass.

## Watch out

- A conditional type on a bare type parameter distributes over a union.
- With `T = A | B`, `T extends U ? X : Y` checks `A` and `B` one at a time.
- Wrap `T` as `[T] extends [U]` to stop the distribution. Unexpected distribution is a frequent surprise.
- `keyof` on `{ [key: string]: unknown }` gives `string | number`, not specific literal keys.
- `infer` works only inside the `extends` clause of a conditional type.

## The task

Write four generic functions. Their signatures use mapped and conditional types, and the tests check runtime behavior.

1. `pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>` returns a new object with only the listed keys.
2. `omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>` returns a new object without the listed keys.
3. A removed key is absent from the result. It is not present with the value `undefined`.
4. `mapValues<T extends object, U>(obj: T, fn: (value: T[keyof T], key: keyof T) => U): Record<keyof T, U>` applies `fn` to every value.
5. `mapValues` keeps the keys.
6. `partialUpdate<T extends object>(target: T, patch: Partial<T>): T` returns a new object with `patch` merged over `target`.
7. The merge is shallow, and `partialUpdate` must not change `target`.
8. An empty `patch` returns an equal copy of `target`.

The stub also defines two types. `Flatten<T>` gives the element type of an array, or `T` itself. `NonNullish<T>` removes `null` and `undefined` from `T`.

```ts
const user = {
  id: 1,
  name: "Alice",
  role: "admin",
};
pick(user, ["id"]);
// { id: 1 }
pick(user, ["id", "name"]);
// { id: 1, name: "Alice" }
pick(user, ["name"]);
// { name: "Alice" }: no "role" key

omit(user, ["role"]);
// { id: 1, name: "Alice" }
omit(user, ["id"]);
// { name: "Alice", role: "admin" }

const nums = { a: 1, b: 2, c: 3 };
mapValues(nums, (v) => (v as number) * 2);
// { a: 2, b: 4, c: 6 }
const xy = { x: 10, y: 20 };
mapValues(xy, (v) => String(v));
// { x: "10", y: "20" }

partialUpdate(user, { name: "Bob" });
// { id: 1, name: "Bob", role: "admin" }
// user.name is still "Alice"
partialUpdate(user, {});
// a copy equal to user
```
