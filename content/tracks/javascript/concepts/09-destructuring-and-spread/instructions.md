# Destructuring & Spread

## What you'll learn

Destructuring is syntax for extracting values from arrays and objects into variables. Spread (`...`) copies elements out of an iterable into another array or object. Both are core ES2015+ patterns that appear throughout modern JavaScript.

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

**Nested destructuring:**
```js
const { address: { city, zip } } = { address: { city: "NY", zip: "10001" } };
```

**Spread in arrays:**
```js
const a = [1, 2, 3];
const b = [...a, 4, 5];   // [1, 2, 3, 4, 5]
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

## The task

Implement the following functions in `stub.js`:

- `function head(arr)` — return the first element; throw `Error("empty array")` if arr is empty
- `function tail(arr)` — return all elements after the first as a new array; return `[]` if arr has 0 or 1 elements
- `function unzip(pairs)` — given an array of `[key, value]` pairs, return `[keys, values]` (use array destructuring in the loop)
- `function mergeWithDefaults(defaults, overrides)` — return a new object with all defaults, overriding with any keys in overrides (use object spread)
- `function sumRest(...nums)` — return the sum of all arguments
- `function pluck(arr, key)` — return an array of `obj[key]` for each object in arr (use destructuring in the map callback)
