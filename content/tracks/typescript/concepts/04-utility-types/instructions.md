# Utility Types

## What you'll learn

Building on the interfaces from lesson 1, TypeScript ships a collection of built-in generic utility types that *derive* new object shapes from an existing one. Instead of hand-writing variations of a type — a "create" shape, an "update" shape, a "listing" shape — you derive them all from a single source of truth, and they stay in sync automatically when the source changes.

## Key concepts

**`Partial<T>`** — makes all properties optional:
```ts
interface User { id: number; name: string; email: string; }
type UserUpdate = Partial<User>;  // { id?: number; name?: string; email?: string }
```

**`Required<T>`** — makes all properties required (inverse of Partial):
```ts
type FullUser = Required<UserUpdate>;  // back to { id: number; name: string; ... }
```

**`Pick<T, K>`** — select a subset of properties:
```ts
type UserPreview = Pick<User, "id" | "name">;  // { id: number; name: string }
```

**`Omit<T, K>`** — exclude certain properties:
```ts
type PublicUser = Omit<User, "email">;  // { id: number; name: string }
```

**`Record<K, V>`** — construct an object type with keys `K` and values `V`. Unlike an index signature, a `Record` with a literal-union key requires **every** key to be present:
```ts
type ScoreBoard = Record<string, number>;
const scores: ScoreBoard = { Alice: 95, Bob: 87 };

type Status = "pending" | "done" | "failed";
type StatusCounts = Record<Status, number>;  // all three keys required
```

**`Readonly<T>`** — makes all properties `readonly`:
```ts
const config: Readonly<Config> = { port: 3000 };
config.port = 4000;  // compile error
```

**vs other languages:** These are compile-time transformations only — no runtime overhead, and the emitted JS is identical to what you'd write without them. In Java or C# you'd need separate DTO classes or a code generator to get the same effect; here it's one line of type-level composition.

## Watch out

- `Partial<T>` makes a property *optional* (`T[K] | undefined`), not *nullable*. `{ name?: string }` still rejects `name: null` unless the original type already allowed `null`.
- `Omit<T, K>` does not require `K` to actually be a key of `T` — misspelling a key (`Omit<Product, "pric">`) does not produce a compile error; it silently omits nothing. `Pick` and mapped `K extends keyof T` constraints (used later) don't have this hole — prefer them when you want the compiler to catch typos.
- Utility types compose: `Partial<Omit<Product, "id">>` reads right-to-left like function composition — first remove `id`, then make what's left optional. Misreading the order is a common mistake when nesting more than two.

## The task

Given this interface:
```ts
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}
```

**`createProduct(draft: Omit<Product, "id">, id: number): Product`** — combine a draft (every field except `id`) with an id to build a full `Product`.

```ts
createProduct({ name: "Widget", price: 9.99, category: "hardware", inStock: true }, 1);
// { id: 1, name: "Widget", price: 9.99, category: "hardware", inStock: true }
```

**`updateProduct(product: Product, patch: Partial<Omit<Product, "id">>): Product`** — return a **new** `Product` with the patched fields merged in. `id` cannot be changed via `patch` (its type excludes `id`), and the original `product` is left untouched.

```ts
const p = createProduct({ name: "Widget", price: 9.99, category: "hardware", inStock: true }, 1);
updateProduct(p, { price: 7.99, inStock: false });
// { id: 1, name: "Widget", price: 7.99, category: "hardware", inStock: false }
updateProduct(p, {});
// returns a copy of p, unchanged
```

**`catalogEntry(product: Product): Pick<Product, "id" | "name" | "price">`** — return only the fields needed for a catalog listing: `id`, `name`, and `price` — nothing else.

```ts
catalogEntry(p);   // { id: 1, name: "Widget", price: 9.99 } — no category or inStock keys
```
