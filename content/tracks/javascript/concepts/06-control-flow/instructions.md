# Control Flow

## What you'll learn

JavaScript's control flow will feel familiar — the syntax is C-family, and you've already been using `if` and comparisons since lesson 1. The things worth knowing are the subtle traps: `switch` fallthrough, the difference between `for...of` and `for...in`, and when a manual loop still beats the array methods from lesson 3 (early exit with `break`, iterating object keys).

## Key concepts

**if / else / ternary:**
```js
const label = score >= 90 ? "A" : score >= 70 ? "B" : "C";
```
Chained ternaries are idiomatic in JS when each branch is a single value — not for side effects.

**switch — always break (or return):**
```js
switch (status) {
  case "active":
    return "running";
  case "paused":
  case "idle":       // intentional fallthrough — grouped cases
    return "stopped";
  default:
    return "unknown";
}
```
Forgetting `break`/`return` is a silent bug. Use `return` inside functions; `break` everywhere else. Note `switch` compares with `===` — no coercion.

**for...of — iterates values:**
```js
for (const item of ["a", "b", "c"]) {
  console.log(item);  // "a", "b", "c"
}
```
Works on any iterable: arrays, strings, `Map`, `Set`, generator results.

**for...in — iterates enumerable keys:**
```js
const obj = { x: 1, y: 2 };
for (const key in obj) {
  console.log(key);  // "x", "y"
}
```
`for...in` walks the prototype chain too — guard with `Object.prototype.hasOwnProperty.call(obj, key)` when you only want the object's own keys.

**break / continue with labels** — rarely needed, but JS supports labelled outer-loop breaks:
```js
outer: for (const row of matrix) {
  for (const cell of row) {
    if (cell === target) break outer;
  }
}
```

**vs other languages:** Python has no `switch` (uses `match` in 3.10+). Java's `switch` gained an expression form in Java 14; JavaScript's has been statement-only and fallthrough-prone since always — wrap it in a function and `return` from each case. Python's `for x in iterable` is equivalent to JS `for...of`, **not** `for...in` — that naming collision bites Python engineers constantly.

## Watch out

- `for...in` on arrays is almost always wrong — it iterates index *strings* (`"0"`, `"1"`, …) and can pick up prototype properties. Use `for...of` or `.forEach` for arrays.
- `for...in` includes inherited enumerable properties. Filter with `hasOwnProperty` for own keys only.
- `0 % 2 === 0` — zero is even. An "is even" check that treats `0` as falsy (`if (n % 2)`-style logic inverted) will misclassify it.
- `switch` uses strict comparison: `case "1":` will not match the number `1`.

## The task

You're implementing four small functions, each exercising a different control-flow construct: branching, value iteration, key iteration, and early exit.

**`classify(n)`** — categorizes an integer `n` into one of four string labels:

| Condition | Return |
|-----------|--------|
| `n < 0` | `"negative"` |
| `n === 0` | `"zero"` |
| `1 <= n <= 9` | `"small"` |
| `n >= 10` | `"large"` |

```js
classify(-1);   // "negative"
classify(-100); // "negative"
classify(0);    // "zero"
classify(1);    // "small"  — lower boundary
classify(9);    // "small"  — upper boundary
classify(10);   // "large"  — boundary
classify(100);  // "large"
```

**`sumArray(arr)`** — returns the sum of all numbers in the array `arr`, using a `for...of` loop. Returns `0` for an empty array.

```js
sumArray([]);           // 0
sumArray([7]);          // 7
sumArray([1, 2, 3, 4]); // 10
sumArray([-1, -2, 3]);  // 0
```

**`keyCount(obj)`** — returns the number of the object's **own** enumerable keys, using a `for...in` loop. Inherited (prototype) properties must not be counted — guard with `Object.prototype.hasOwnProperty.call(obj, key)`.

```js
keyCount({});               // 0
keyCount({ a: 1, b: 2 });   // 2

const o = Object.create({ inherited: true }); // prototype property
o.own = 1;
keyCount(o);                // 1 — inherited keys don't count
```

**`firstEven(arr)`** — returns the first even number in `arr` (scanning left to right), or `null` if there is none. Use a loop that exits early once a match is found. Remember `0` and negative even numbers count as even.

```js
firstEven([]);            // null
firstEven([1, 3, 5]);     // null
firstEven([2, 3, 4]);     // 2   — first match wins
firstEven([1, 3, 4, 6]);  // 4
firstEven([-2, 1, 3]);    // -2  — negative evens count
firstEven([1, 0, 2]);     // 0   — zero is even, and 0 !== null
```
