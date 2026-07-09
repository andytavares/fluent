# Destructuring & Spread

## What you'll learn

Lesson 3 used destructuring in passing; this lesson makes it the subject. Destructuring is syntax for extracting values from arrays and objects into variables. Spread (`...`) copies elements out of an iterable into another array or object. Both are core ES2015+ patterns that appear throughout modern JavaScript — you've already used rest parameters (lesson 2) and object spread (lesson 3); here you'll combine every variant.

## Key concepts

**Array destructuring:**
```js
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]

const [a, , b] = [10, 20, 30];  // skip element with empty slot
// a = 10, b = 30
```

**Default values:**
```js
const [x = 0, y = 0] = [42];
// x = 42, y = 0  (undefined triggers the default)
```

**Object destructuring:**
```js
const { name, age } = { name: "Alice", age: 30, role: "admin" };
// name = "Alice", age = 30

const { name: fullName, role = "user" } = { name: "Bob" };
// fullName = "Bob", role = "user"  (renamed + default)
```

**Computed keys in destructuring** — extract a property whose name is in a variable:
```js
const key = "score";
const { [key]: value } = { score: 97 };
// value = 97
```

**Nested destructuring, and destructuring in parameters and loops:**
```js
const { address: { city } } = { address: { city: "NY", zip: "10001" } };

for (const [k, v] of Object.entries({ a: 1, b: 2 })) { /* k, v */ }

const labels = pairs.map(([key]) => key);  // destructure in the callback
```

**Spread in arrays:**
```js
const a = [1, 2, 3];
const b = [...a, 4, 5];    // [1, 2, 3, 4, 5]
const c = [0, ...a, ...b]; // spread multiple
```

**Spread in objects:**
```js
const defaults = { color: "red", size: "M" };
const custom   = { ...defaults, color: "blue" };
// { color: "blue", size: "M" } — later keys win
```

**Function rest parameters:**
```js
function sum(...nums) {       // rest: collects remaining args into an array
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4);  // 10
```

**vs other languages:** Python has similar tuple unpacking and `*args`. Go has no destructuring but has multiple return values. Java has no destructuring. TypeScript adds static types on top of the same syntax.

## Watch out

- Spread and destructuring copies are **shallow**: `{ ...obj }` copies top-level keys; nested objects are still shared references, and a spread-merge replaces nested objects wholesale rather than deep-merging them.
- Destructuring `null` or `undefined` throws a `TypeError`: `const { a } = null` crashes.
- Defaults trigger only on `undefined` — `const [x = 5] = [null]` gives `x = null`.
- Rest destructuring (`[, ...rest]`) builds a **new** array — the source is untouched. Mutating methods like `splice` are the opposite.

## The task

You're building six small utilities. Each is a natural fit for one destructuring or spread form (noted per function) — the tests check behavior, but practice the syntax.

**`head(arr)`** — returns the first element of `arr`. Throws `Error("empty array")` if `arr` is empty. (Array destructuring: `const [first] = arr`.)

```js
head([10, 20, 30]);  // 10
head([42]);          // 42
head([]);            // throws Error("empty array")
```

**`tail(arr)`** — returns a **new** array of all elements after the first; the input array is not mutated. Returns `[]` when `arr` has 0 or 1 elements. (Rest destructuring: `const [, ...rest] = arr`.)

```js
tail([1, 2, 3, 4]);  // [2, 3, 4]
tail([1]);           // []
tail([]);            // []

const src = [1, 2, 3];
tail(src);           // [2, 3]
src;                 // [1, 2, 3] — unchanged
```

**`unzip(pairs)`** — given an array of two-element `[key, value]` pairs, returns a two-element array `[keys, values]`: all first elements in order, then all second elements in order. Returns `[[], []]` for an empty input. (Destructure each pair in the loop: `for (const [k, v] of pairs)`.)

```js
unzip([["a", 1], ["b", 2], ["c", 3]]);  // [["a", "b", "c"], [1, 2, 3]]
unzip([]);                              // [[], []]
```

**`mergeWithDefaults(defaults, overrides)`** — returns a **new** object containing every key of `defaults`, with any key also present in `overrides` taking the override's value. Neither input object is mutated. The merge is shallow: a nested object in `overrides` replaces the default wholesale. (Object spread: later spreads win.)

```js
mergeWithDefaults({ color: "red", size: "M" }, { color: "blue" });
// { color: "blue", size: "M" }

mergeWithDefaults({ a: 1, b: 2 }, {});   // { a: 1, b: 2 }

// Shallow: nested objects are replaced, not deep-merged
mergeWithDefaults({ theme: { dark: true, font: 12 } }, { theme: { dark: false } });
// { theme: { dark: false } } — font is gone

const defaults = { x: 1 };
mergeWithDefaults(defaults, { x: 99 });
defaults.x;  // 1 — inputs are not mutated
```

**`sumRest(...nums)`** — takes any number of numeric arguments and returns their sum; returns `0` when called with no arguments. (Rest parameters.)

```js
sumRest(1, 2, 3, 4);  // 10
sumRest(7);           // 7
sumRest();            // 0
```

**`pluck(arr, key)`** — returns a new array of `obj[key]` for each object in `arr`, in order; positions where the key is missing hold `undefined`. (Destructure with a computed key in the `map` callback: `({ [key]: value }) => value`.)

```js
pluck([{ name: "Alice" }, { name: "Bob" }], "name");  // ["Alice", "Bob"]
pluck([{ a: 1 }, { b: 2 }], "a");                     // [1, undefined]
pluck([], "name");                                    // []
```
