## What you build

You write three small functions: `typeLabel`, `strictEquals` and `clamp`. They inspect types and compare values the JavaScript way.

## Key concepts

### `let` and `const` are block-scoped

`let` makes a binding you can reassign. `const` makes a binding you cannot reassign, but an object or array behind it stays mutable. `var` is function-scoped and legacy, so do not use it.

```js
// The binding cannot change
const name = "Alice";
// The binding can change
let count = 0;
count = 1;

const user = { id: 1 };
// OK: const locks the binding,
// not the object
user.id = 2;
```

From Java or C++, `const` is closer to `final` or a const pointer than to deep immutability.

### JavaScript has seven primitive types

The primitives are `string`, `number`, `boolean`, `null`, `undefined`, `bigint` and `symbol`. Everything else is an object: arrays, functions, dates and regular expressions. There is one `number` type, an IEEE 754 double, with no `int` or `float`. You do not declare a type; the value carries it.

### `typeof` returns the type name as a string

`typeof` gives a string for any value. It tells functions apart from other objects, but not arrays.

```js
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof {}         // "object"
// Arrays are objects
typeof []         // "object"
typeof (() => {}) // "function"
// A known quirk, fixed in the standard
typeof null       // "object"
```

### `===` compares without coercion

`==` converts the types before it compares, and gives surprising results. `===` never converts: values of different types are never equal. Always use `===`.

```js
0 == "0"    // true: coercion
0 === "0"   // false
0 == false  // true: coercion
0 === false // false
```

## Watch out

- `typeof null` is `"object"`, not `"null"`. To check for null, use `value === null`.
- `NaN === NaN` is `false`. No other value is unequal to itself. Use `Number.isNaN(x)` to detect it.
- `typeof []` is `"object"`. Use `Array.isArray(x)` to detect arrays.
- `const` stops reassignment, not mutation. `const arr = []; arr.push(1)` is legal.

## The task

Write three functions in `stub.js` that use JavaScript type inspection and comparison.

1. `typeLabel(value)` returns `typeof value` as a string.
2. `strictEquals(a, b)` returns `true` if `a === b`, and `false` otherwise.
3. `clamp(value, min, max)` returns `min` if `value < min`.
4. `clamp` returns `max` if `value > max`.
5. Otherwise, `clamp` returns `value` unchanged.

`typeLabel` keeps the JavaScript quirks. `null` and arrays give `"object"`, and functions give `"function"`.

Strict equality means the same type and the same value, with no coercion. `NaN` is never strictly equal to anything, itself included.

The range of `clamp` is inclusive at both ends. You can assume `min <= max`. Negative ranges work. When `min === max`, the range has one value.

```js
typeLabel("hi")        // "string"
typeLabel(42)          // "number"
typeLabel(true)        // "boolean"
typeLabel(undefined)   // "undefined"
typeLabel(null)        // "object"
typeLabel([])          // "object"
typeLabel(() => {})    // "function"

strictEquals(1, 1)       // true
strictEquals(1, "1")     // false
strictEquals(0, false)   // false
strictEquals(null, null) // true
strictEquals(NaN, NaN)   // false

clamp(-5, 0, 10)   // 0
clamp(15, 0, 10)   // 10
clamp(5, 0, 10)    // 5
clamp(0, 0, 10)    // 0
clamp(10, 0, 10)   // 10
clamp(-3, -10, -1) // -3
clamp(7, 7, 7)     // 7
```
