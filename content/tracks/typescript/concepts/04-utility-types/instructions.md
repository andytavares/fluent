# Utility Types

## What you'll learn

TypeScript ships a collection of built-in generic utility types that transform existing types. Instead of redefining variations of a type by hand, you derive them from a single source of truth.

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

**`Record<K, V>`** — construct an object type with keys K and values V:
```ts
type ScoreBoard = Record<string, number>;
const scores: ScoreBoard = { Alice: 95, Bob: 87 };

type Status = "pending" | "done" | "failed";
type StatusCounts = Record<Status, number>;
```

**`Readonly<T>`** — makes all properties `readonly`:
```ts
const config: Readonly<Config> = { port: 3000 };
config.port = 4000;  // compile error
```

**vs other languages:** These are compile-time transformations only — no runtime overhead. In Java or C# you would need to write separate classes or use code generation to achieve the same effect.

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

Implement three functions that demonstrate utility types:

- `createProduct(draft: Omit<Product, "id">, id: number): Product` — combine the draft with an id to make a full Product
- `updateProduct(product: Product, patch: Partial<Omit<Product, "id">>): Product` — return a new Product with the patched fields merged in (id is immutable)
- `catalogEntry(product: Product): Pick<Product, "id" | "name" | "price">` — return only the fields needed for a catalog listing
