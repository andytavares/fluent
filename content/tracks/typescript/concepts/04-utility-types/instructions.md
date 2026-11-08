## What you build

You write `createProduct`, `updateProduct` and `catalogEntry`, each typed with a utility type derived from one `Product` interface. Built-in utility types derive new object shapes from an existing one. The derived types stay in sync when the source type changes. This lesson builds on **Types & Interfaces**.

## Key concepts

### `Partial<T>` makes every property optional

Use it for an update shape, where the caller sends only some fields.

```ts
interface User {
  id: number;
  name: string;
  email: string;
}
// { id?: number; name?: string; ... }
type UserUpdate = Partial<User>;
```

### `Required<T>` makes every property required

It is the inverse of `Partial`.

```ts
// { id: number; name: string; ... }
type FullUser = Required<UserUpdate>;
```

### `Pick<T, K>` keeps a subset of properties

`K` is a union of the keys to keep.

```ts
// { id: number; name: string }
type Preview = Pick<User, "id" | "name">;
```

### `Omit<T, K>` removes properties

`K` is a union of the keys to remove.

```ts
// { id: number; name: string }
type PublicUser = Omit<User, "email">;
```

### `Record<K, V>` builds an object type from keys and values

With a union of literal keys, `Record` requires every key. An index signature does not.

```ts
type ScoreBoard = Record<string, number>;
const s: ScoreBoard = { Alice: 95 };

type Status =
  "pending" | "done" | "failed";
// All three keys are required
type Counts = Record<Status, number>;
```

### `Readonly<T>` makes every property `readonly`

The compiler rejects an assignment to any property.

```ts
const config: Readonly<Config> = {
  port: 3000,
};
// Compile error
config.port = 4000;
```

### Utility types cost nothing at runtime

They are compile-time transformations. The emitted JavaScript is the same as without them. In Java or C#, you need separate DTO classes or a code generator for the same result.

## Watch out

- `Partial<T>` makes a property optional, not nullable. `{ name?: string }` still rejects `name: null`.
- `Omit<T, K>` does not check that `K` is a key of `T`. `Omit<Product, "pric">` compiles and removes nothing.
- `Pick` requires `K extends keyof T`, so it catches a misspelled key. Use it when typos matter.
- Nested utility types apply from the inside out. `Partial<Omit<Product, "id">>` removes `id` first, then makes the rest optional.
- Misreading the order is a common mistake with more than two nested types.

## The task

Write three functions over this interface. Each one uses a utility type in its signature.

```ts
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}
```

1. `createProduct(draft: Omit<Product, "id">, id: number): Product` combines `draft` with `id` into a full `Product`.
2. `updateProduct(product: Product, patch: Partial<Omit<Product, "id">>): Product` returns a new `Product` with the `patch` fields merged in.
3. `updateProduct` keeps `id`. The type of `patch` excludes `id`.
4. `updateProduct` must not change `product`.
5. An empty `patch` returns an equal copy of `product`.
6. `catalogEntry(product: Product): Pick<Product, "id" | "name" | "price">` returns only `id`, `name` and `price`.
7. The `catalogEntry` result has exactly three keys.

```ts
const draft = {
  name: "Widget",
  price: 9.99,
  category: "hardware",
  inStock: true,
};
const p = createProduct(draft, 1);
// { id: 1, name: "Widget", price: 9.99,
//   category: "hardware", inStock: true }

updateProduct(p, {
  price: 7.99,
  inStock: false,
});
// { id: 1, name: "Widget", price: 7.99,
//   category: "hardware", inStock: false }
// p.price is still 9.99

updateProduct(p, {});
// a copy equal to p

catalogEntry(p);
// { id: 1, name: "Widget", price: 9.99 }
```
