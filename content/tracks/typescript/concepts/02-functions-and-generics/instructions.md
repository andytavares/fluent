# Functions & Generics

## What you'll learn

TypeScript functions carry full type signatures. Generics let you write functions that work with any type while preserving type information — the compiler infers the type parameter from what you pass in.

## Key concepts

**Typed function signatures:**
```ts
function add(a: number, b: number): number {
  return a + b;
}

const greet = (name: string): string => `Hello, ${name}`;
```

**Optional and default parameters:**
```ts
function createUser(name: string, role: string = "viewer"): string {
  return `${name}:${role}`;
}
```

**Generics** parameterize a function over a type `T`:
```ts
function identity<T>(value: T): T {
  return value;
}

identity(42);       // T inferred as number, returns number
identity("hello");  // T inferred as string, returns string
```

**Generic constraints** restrict what `T` can be:
```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

**Tuple return type:**
```ts
function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  return as.map((a, i) => [a, bs[i]]);
}
```

**vs other languages:** TypeScript's generics are erased at runtime (no reification). Unlike Java, you cannot call `new T()` or check `instanceof T` inside a generic function without extra machinery.

## The task

Implement three generic functions:

- `identity<T>(value: T): T` — returns its argument unchanged
- `first<T>(arr: T[]): T | undefined` — returns the first element, or `undefined` if the array is empty
- `zip<A, B>(as: A[], bs: B[]): [A, B][]` — pairs each element of `as` with the corresponding element of `bs` (stop at the shorter array's length)
