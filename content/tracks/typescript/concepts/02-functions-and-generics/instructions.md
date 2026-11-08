## What you build

You write three generic functions: `identity`, `first` and `zip`. Generics let one function work with any type and keep the type information from input to output. This lesson builds on **Types & Interfaces**.

## Key concepts

### Functions carry full type signatures

You type each parameter and the return value. Arrow functions use the same annotations.

```ts
function add(
  a: number,
  b: number,
): number {
  return a + b;
}

const greet = (name: string): string =>
  `Hello, ${name}`;
```

### Parameters can be optional or have defaults

A parameter with a default value is optional for the caller.

```ts
function createUser(
  name: string,
  role: string = "viewer",
): string {
  return `${name}:${role}`;
}
```

### A generic parameterizes a function over a type

The compiler infers the type parameter `T` from the argument. You do not write the type at the call site.

```ts
function identity<T>(value: T): T {
  return value;
}

// T is inferred from each argument
identity(42);
identity("hello");
```

### A constraint limits what `T` can be

`extends` restricts `T`. Inside the function, you can then use what the constraint promises.

```ts
function length<
  T extends { length: number },
>(value: T): number {
  // Safe: every T has .length
  return value.length;
}
length("hello");    // 5
length([1, 2, 3]);  // 3
```

### The return type states what can be missing

Without a constraint, `T` can be anything. An empty array has no first element, so the return type includes `undefined`.

```ts
function first<T>(
  arr: T[],
): T | undefined {
  return arr[0];
}
```

### Functions can have more than one type parameter

Each type parameter is independent. A tuple type such as `[A, B]` describes a fixed-length array.

```ts
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
```

### Type parameters do not exist at runtime

TypeScript erases type parameters, as Java does. You cannot call `new T()` or check `x instanceof T`. Pass a factory function or a class reference instead. One function body serves every type.

## Watch out

- A literal argument keeps its literal type. `const n = identity(42)` gives `n` the type `42`, not `number`.
- A `let` declaration widens the literal. `let n = identity(42)` gives `n` the type `number`.
- `arr[0]` has type `T`, not `T | undefined`, by default. Only `noUncheckedIndexedAccess` or your return type adds `undefined`.
- The compiler does not catch an out-of-bounds index by default.
- `zip` stops at the shorter array. Arrays of different lengths lose data, with no runtime error.

## The task

Write three generic functions. Each one keeps the type of its input.

1. `identity<T>(value: T): T` returns `value` unchanged.
2. For an object, `identity` returns the same reference, not a copy.
3. `first<T>(arr: T[]): T | undefined` returns the first element of `arr`.
4. `first` returns `undefined` for an empty array.
5. `zip<A, B>(as: A[], bs: B[]): [A, B][]` pairs each element of `as` with the element of `bs` at the same index.
6. `zip` stops at the length of the shorter array.

Two empty arrays give an empty result.

```ts
identity(42);         // 42
identity("hello");    // "hello"
identity(true);       // true
const obj = { x: 1 };
identity(obj) === obj; // true

first([1, 2, 3]);     // 1
first(["a"]);         // "a"
first(["x", "y"]);    // "x"
first([]);            // undefined

zip([1, 2, 3], ["a", "b", "c"]);
// [[1, "a"], [2, "b"], [3, "c"]]
zip([1], ["a", "b", "c"]); // [[1, "a"]]
zip([1, 2, 3], ["a"]);     // [[1, "a"]]
zip([], []);               // []
```
