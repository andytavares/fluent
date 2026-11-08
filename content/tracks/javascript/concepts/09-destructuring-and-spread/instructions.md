## What you build

You write six small functions. Each one fits one form of destructuring or spread. You already met rest parameters in Functions and object spread in Arrays & Objects. This lesson builds on **Classes**.

## Key concepts

### Destructuring extracts values into variables

Destructuring takes values out of an array or object. Spread (`...`) copies elements into another array or object. ES2015 added both.

### Array destructuring works by position

`...rest` collects the remaining elements. An empty slot skips one element.

```js
const [first, second, ...rest] =
  [1, 2, 3, 4, 5];
// first = 1, second = 2,
// rest = [3, 4, 5]

// Skip an element with an empty slot
const [a, , b] = [10, 20, 30];
// a = 10, b = 30
```

### A default fills an `undefined` value

```js
const [x = 0, y = 0] = [42];
// x = 42, y = 0
```

### Object destructuring works by name

You can rename a property and give it a default.

```js
const { name, age } = {
  name: "Alice", age: 30, role: "admin",
};
// name = "Alice", age = 30

const { name: fullName, role = "user" } =
  { name: "Bob" };
// fullName = "Bob", role = "user"
```

### A computed key reads a property named in a variable

```js
const key = "score";
const { [key]: value } = { score: 97 };
// value = 97
```

### Destructuring nests, and works in parameters and loops

```js
const { address: { city } } = {
  address: { city: "NY", zip: "10001" },
};

const obj = { a: 1, b: 2 };
for (const [k, v] of Object.entries(obj)) {
  // use k and v
}

// Destructure in the callback
const labels = pairs.map(([key]) => key);
```

### Spread copies into arrays and objects

In an object, later keys win.

```js
const a = [1, 2, 3];
// [1, 2, 3, 4, 5]
const b = [...a, 4, 5];
// Spread more than one array
const c = [0, ...a, ...b];

const base = { color: "red", size: "M" };
const custom = { ...base, color: "blue" };
// { color: "blue", size: "M" }
```

### Rest parameters collect the remaining arguments

```js
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10
```

Python has tuple unpacking and `*args`. Go has multiple return values but no destructuring, Java has none, and TypeScript adds types to the same syntax.

## Watch out

- Spread copies are shallow. Nested objects stay shared, and a spread merge replaces a nested object instead of merging it.
- Destructuring `null` or `undefined` throws a `TypeError`: `const { a } = null` crashes.
- A default applies only on `undefined`. `const [x = 5] = [null]` gives `x = null`.
- Rest destructuring (`[, ...rest]`) builds a new array and leaves the source unchanged. `splice` does the opposite.

## The task

Write six functions in `stub.js`. Each fits one destructuring or spread form, given in brackets. The tests check behavior only.

1. `head(arr)` returns the first element of `arr` (array destructuring).
2. `tail(arr)` returns a new array of all elements after the first (rest destructuring).
3. `unzip(pairs)` takes an array of `[key, value]` pairs and returns `[keys, values]` (destructuring in a `for...of` loop).
4. `mergeWithDefaults(defaults, overrides)` returns a new object with every key of both inputs (object spread).
5. `sumRest(...nums)` returns the sum of any count of numbers (rest parameters).
6. `pluck(arr, key)` returns a new array of `obj[key]` for each object, in order (computed key in the `map` callback).

`head([])` throws `Error("empty array")`.

`tail` does not change the input. It returns `[]` for 0 or 1 elements.

`unzip` keeps the order of the keys and of the values. An empty input gives `[[], []]`.

In `mergeWithDefaults`, a key in `overrides` wins. Neither input changes. The merge is shallow, so a nested object in `overrides` replaces the default.

`sumRest()` returns `0`.

`pluck` gives `undefined` where an object has no `key`.

```js
head([10, 20, 30]) // 10
head([42])         // 42
// Throws Error("empty array")
head([]);

tail([1, 2, 3, 4]) // [2, 3, 4]
tail([1])          // []
tail([])           // []
const src = [1, 2, 3];
tail(src)          // [2, 3]
src                // [1, 2, 3]

unzip([["a", 1], ["b", 2], ["c", 3]])
// [["a", "b", "c"], [1, 2, 3]]
unzip([]) // [[], []]

mergeWithDefaults(
  { color: "red", size: "M" },
  { color: "blue" })
// { color: "blue", size: "M" }
mergeWithDefaults({ a: 1, b: 2 }, {})
// { a: 1, b: 2 }
// Shallow: font is gone
mergeWithDefaults(
  { theme: { dark: true, font: 12 } },
  { theme: { dark: false } })
// { theme: { dark: false } }
const defaults = { x: 1 };
mergeWithDefaults(defaults, { x: 99 });
defaults.x // 1

sumRest(1, 2, 3, 4) // 10
sumRest(7)          // 7
sumRest()           // 0

pluck([{ name: "Alice", age: 30 },
       { name: "Bob", age: 25 }], "name")
// ["Alice", "Bob"]
pluck([{ a: 1 }, { b: 2 }], "a")
// [1, undefined]
pluck([], "name") // []
```
