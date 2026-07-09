# Functions & Generics

## What you'll learn

Lesson 1 covered annotating fixed shapes with interfaces; this lesson covers functions whose types depend on their inputs. TypeScript functions carry full type signatures, and generics let you write a single function that works with any type while preserving type information end to end — the compiler infers the type parameter from what you pass in, no explicit instantiation required.

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

**Generics** parameterize a function over a type `T`, inferred from the call site:
```ts
function identity<T>(value: T): T {
  return value;
}

identity(42);       // T inferred as number, returns number
identity("hello");  // T inferred as string, returns string
```

**Generic constraints** restrict what `T` can be, using `extends`:
```ts
function length<T extends { length: number }>(value: T): number {
  return value.length;   // safe: every T is guaranteed to have .length
}
length("hello");     // ok — strings have .length
length([1, 2, 3]);   // ok — arrays have .length
```

Without a constraint, `T` could be anything, and the return type has to say so:
```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];   // T | undefined — arr could be empty
}
```

**Multiple type parameters and tuple return types:**
```ts
function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  return as.map((a, i) => [a, bs[i]]);
}
```

**vs other languages:** TypeScript's generics are erased at runtime (no reification). Unlike Java, you cannot call `new T()` or check `instanceof T` inside a generic function without extra machinery (a factory parameter, a class reference, etc.). Unlike C++ templates, there's no per-instantiation code generation — one function body serves every type.

## Watch out

- Generic inference can widen more than you expect. `identity(42)` infers `T` as `number`, not the literal type `42` — if you need the narrower literal type, callers add `as const`.
- Indexing an array (`arr[0]`) does **not** automatically become `T | undefined` unless the function's return type says so, or the `noUncheckedIndexedAccess` compiler flag is on. Don't assume the compiler catches an out-of-bounds access by default.
- `zip` silently truncates to the shorter array — there's no runtime error for mismatched lengths, so a caller passing arrays of different sizes loses data with no warning.

## The task

Implement three generic functions:

**`identity<T>(value: T): T`** — returns its argument unchanged, for any type.

```ts
identity(42);          // 42
identity("hello");     // "hello"
identity(true);        // true
const obj = { x: 1 };
identity(obj) === obj; // true — same object reference, not a copy
```

**`first<T>(arr: T[]): T | undefined`** — returns the first element of `arr`, or `undefined` if the array is empty.

```ts
first([1, 2, 3]);   // 1
first(["a"]);        // "a"
first([]);           // undefined — empty array
```

**`zip<A, B>(as: A[], bs: B[]): [A, B][]`** — pairs each element of `as` with the corresponding element of `bs`, stopping at the length of the **shorter** array.

```ts
zip([1, 2, 3], ["a", "b", "c"]);  // [[1, "a"], [2, "b"], [3, "c"]]
zip([1], ["a", "b", "c"]);        // [[1, "a"]]              — as is shorter
zip([1, 2, 3], ["a"]);            // [[1, "a"]]              — bs is shorter
zip([], []);                       // []
```
