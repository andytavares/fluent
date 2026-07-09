# Variables & Types

## What you'll learn

This is the track's starting point: how JavaScript declares variables and what its type system actually is. JavaScript has three ways to declare variables: `var` (function-scoped, legacy — avoid it), `let` (block-scoped, reassignable), and `const` (block-scoped, binding is not reassignable — but objects/arrays are still mutable). You'll also meet the seven primitive types, the `typeof` operator, and why `===` is the only equality operator worth reaching for.

## Key concepts

**let and const:**
```js
const name = "Alice";   // binding cannot be reassigned
let count = 0;           // can be reassigned
count = 1;               // ok

const user = { id: 1 };
user.id = 2;             // ok — const freezes the binding, not the object
```

**Primitive types:** `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`. Everything else — arrays, functions, dates, regexes — is an object.

**typeof** returns the type name as a string:
```js
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof {}         // "object"
typeof []         // "object"    ← arrays are objects; use Array.isArray
typeof (() => {}) // "function"  ← the one non-primitive typeof distinguishes
typeof null       // "object"    ← famous JS quirk, standardized forever
```

**Strict equality:** Always use `===` (strict) over `==` (loose). Loose equality coerces types and produces surprising results.
```js
0 == "0"    // true  — type coercion
0 === "0"   // false — strict: different types are never equal
0 == false  // true  — coercion again
0 === false // false
```

**vs other languages:** There is no `int` vs `float` — JavaScript has a single `number` type (IEEE 754 double). No explicit type declaration is needed; the type is inferred from the value. Coming from Java/C++: `const` is closer to `final` / a const pointer than to deep immutability.

## Watch out

- `typeof null` is `"object"`, not `"null"`. To check for null, compare directly: `value === null`.
- `NaN === NaN` is `false` — NaN is the only value not strictly equal to itself. Use `Number.isNaN(x)` to detect it.
- `typeof []` is `"object"`. Use `Array.isArray(x)` to detect arrays.
- `const` prevents reassignment, not mutation: `const arr = []; arr.push(1)` is legal.

## The task

You're building three small utilities that exercise JavaScript's type inspection and comparison semantics.

**`typeLabel(value)`** — returns the result of the `typeof` operator applied to `value`, as a string. Note the JavaScript quirks: `typeof null` is `"object"`, arrays are `"object"`, and functions are `"function"`.

```js
typeLabel("hi");        // "string"
typeLabel(42);          // "number"
typeLabel(true);        // "boolean"
typeLabel(undefined);   // "undefined"
typeLabel(null);        // "object"   — typeof null is "object" in JavaScript
typeLabel([]);          // "object"   — arrays are objects
typeLabel(() => {});    // "function"
```

**`strictEquals(a, b)`** — returns `true` if `a === b` (strict equality: same type and same value, no type coercion), `false` otherwise.

```js
strictEquals(1, 1);        // true
strictEquals(1, "1");      // false — different types, no coercion
strictEquals(0, false);    // false
strictEquals(null, null);  // true
strictEquals(NaN, NaN);    // false — NaN is never strictly equal to anything
```

**`clamp(value, min, max)`** — returns `value` constrained to the inclusive range `[min, max]`: if `value < min` return `min`, if `value > max` return `max`, otherwise return `value` unchanged. Assume `min <= max`.

```js
clamp(-5, 0, 10);   // 0    — below the range
clamp(15, 0, 10);   // 10   — above the range
clamp(5, 0, 10);    // 5    — inside the range
clamp(0, 0, 10);    // 0    — at min (inclusive)
clamp(10, 0, 10);   // 10   — at max (inclusive)
clamp(-3, -10, -1); // -3   — negative ranges work
clamp(7, 7, 7);     // 7    — min === max collapses the range to one value
```
