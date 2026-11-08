## What you build

You write `classify`, `sumArray`, `keyCount` and `firstEven`. Each uses one construct: branching, value iteration, key iteration or early exit. This lesson builds on **Error Handling**.

## Key concepts

### The syntax is C-family

`if`, `else` and comparisons work as in C or Java. The traps are `switch` fallthrough and `for...of` versus `for...in`. A manual loop still beats the array methods for an early `break` or for object keys.

### Chain ternaries for single values

A chained ternary is idiomatic when each branch is one value. Do not use it for side effects.

```js
const label =
  score >= 90 ? "A" :
  score >= 70 ? "B" : "C";
```

### `switch` falls through without `break`

Each case runs into the next one unless you `break` or `return`. A missing `break` is a silent bug. Use `return` inside functions and `break` elsewhere.

```js
switch (status) {
  case "active":
    return "running";
  case "paused":
  // Grouped cases: fallthrough on purpose
  case "idle":
    return "stopped";
  default:
    return "unknown";
}
```

`switch` compares with `===`, so it does no coercion. Java 14 added a `switch` expression, and Python 3.10 added `match`. In JavaScript, `switch` is only a statement, so wrap it in a function and `return` from each case.

### `for...of` iterates values

It works on any iterable: arrays, strings, `Map`, `Set` and generator results. Python's `for x in items` matches `for...of`, not `for...in`.

```js
for (const item of ["a", "b", "c"]) {
  // "a", "b", "c"
  console.log(item);
}
```

### `for...in` iterates enumerable keys

It also walks the prototype chain. For own keys only, check each key with `Object.prototype.hasOwnProperty.call(obj, key)`.

```js
const obj = { x: 1, y: 2 };
for (const key in obj) {
  // "x", "y"
  console.log(key);
}
```

### A label breaks an outer loop

You rarely need it, but `break label` exits the labelled loop.

```js
outer: for (const row of matrix) {
  for (const cell of row) {
    if (cell === target) break outer;
  }
}
```

## Watch out

- `for...in` on an array gives index strings (`"0"`, `"1"`) and can pick up prototype properties. Use `for...of` or `.forEach`.
- `for...in` includes inherited enumerable properties. Filter with `hasOwnProperty` for own keys only.
- Zero is even: `0 % 2 === 0`. A check that treats `0` as false misclassifies it.
- `switch` uses strict comparison. `case "1":` does not match the number `1`.

## The task

Write four functions in `stub.js`. Each uses a different control-flow construct.

1. `classify(n)` takes an integer and returns one of four labels.
2. `n < 0` gives `"negative"`.
3. `n === 0` gives `"zero"`.
4. `n` from 1 to 9, inclusive, gives `"small"`.
5. `n >= 10` gives `"large"`.
6. `sumArray(arr)` returns the sum of the numbers in `arr`. Use a `for...of` loop.
7. `keyCount(obj)` returns the count of the own enumerable keys of `obj`. Use a `for...in` loop.
8. `firstEven(arr)` returns the first even number in `arr`, from left to right.

`sumArray([])` returns `0`.

`keyCount` must not count inherited properties from the prototype. Check each key with `Object.prototype.hasOwnProperty.call(obj, key)`.

`firstEven` returns `null` when no number is even. Exit the loop at the first match. Zero and negative even numbers are even.

```js
classify(-1)   // "negative"
classify(-100) // "negative"
classify(0)    // "zero"
classify(1)    // "small"
classify(9)    // "small"
classify(10)   // "large"
classify(100)  // "large"

sumArray([])           // 0
sumArray([7])          // 7
sumArray([1, 2, 3, 4]) // 10
sumArray([-1, -2, 3])  // 0

keyCount({})             // 0
keyCount({ a: 1, b: 2 }) // 2
const o =
  Object.create({ inherited: true });
o.own = 1;
keyCount(o)              // 1

firstEven([])           // null
firstEven([1, 3, 5])    // null
firstEven([2, 3, 4])    // 2
firstEven([1, 3, 4, 6]) // 4
firstEven([-2, 1, 3])   // -2
firstEven([1, 0, 2])    // 0
```
