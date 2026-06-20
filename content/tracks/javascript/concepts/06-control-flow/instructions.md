# Control Flow

## What you'll learn

JavaScript's control flow will feel familiar — the syntax is C-family. The things worth knowing are the subtle traps: `switch` fallthrough, the difference between `for...of` and `for...in`, and how the ternary operator composes in modern JS.

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
Unlike C, there is no implicit `[[fallthrough]]` annotation. Forgetting `break`/`return` is a silent bug. Use `return` inside functions; `break` everywhere else.

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
`for...in` on arrays is almost always wrong — it iterates index strings and can pick up prototype properties. Use `for...of` or `.forEach` for arrays.

**break / continue with labels** — rarely needed, but JS supports labelled outer-loop breaks:
```js
outer: for (const row of matrix) {
  for (const cell of row) {
    if (cell === target) break outer;
  }
}
```

**vs other languages:** Python has no `switch` (uses `match` in 3.10+). Java's `switch` added expression form in Java 14. JavaScript's `switch` has been expression-less and fallthrough-prone since always — wrap in a function and `return` from each case to keep it safe. Python's `for x in iterable` is equivalent to JS `for...of`, not `for...in`.

## The task

Implement four functions:

- `classify(n)` — given a number, return `"negative"` if `n < 0`, `"zero"` if `n === 0`, `"small"` if `1 <= n <= 9`, `"large"` if `n >= 10`
- `sumArray(arr)` — return the sum of all numbers in `arr` using a `for...of` loop (return `0` for empty arrays)
- `keyCount(obj)` — return the number of own enumerable keys on `obj` using `for...in`
- `firstEven(arr)` — return the first even number in `arr`, or `null` if none exists (use a loop with `break`)
