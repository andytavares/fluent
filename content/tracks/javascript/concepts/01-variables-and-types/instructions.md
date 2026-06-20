# Variables & Types

## What you'll learn

JavaScript has three ways to declare variables: `var` (function-scoped, legacy — avoid it), `let` (block-scoped, reassignable), and `const` (block-scoped, binding is not reassignable — but objects/arrays are still mutable).

## Key concepts

**let and const:**
```js
const name = "Alice";   // binding cannot be reassigned
let count = 0;           // can be reassigned
count = 1;               // ok
```

**Primitive types:** `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`

**typeof:**
```js
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object"  ← famous JS quirk
```

**Strict equality:** Always use `===` (strict) over `==` (loose). Loose equality coerces types and produces surprising results.
```js
0 == "0"   // true  — type coercion
0 === "0"  // false — strict
```

**vs other languages:** There is no `int` vs `float` — JavaScript has a single `number` type (IEEE 754 double). No explicit type declaration is needed; the type is inferred from the value.

## The task

Implement three functions:

- `typeLabel(value)` — returns `typeof value` as a string
- `strictEquals(a, b)` — returns `true` if `a === b`, `false` otherwise
- `clamp(value, min, max)` — returns `value` clamped to the range `[min, max]` (inclusive)
