## What you build

You write `pluck`, `groupBy` and `flatten`, three collection functions like the ones in lodash. Arrays and objects are the two universal data structures in JavaScript. This lesson builds on **Functions**.

## Key concepts

### Array methods take functions as callbacks

`filter`, `map` and `reduce` take a callback and replace most manual loops. They return a new value and leave the original array unchanged.

```js
const nums = [1, 2, 3, 4, 5];
nums.filter(n => n % 2 === 0); // [2, 4]
nums.map(n => n * 2); // [2, 4, 6, 8, 10]
nums.reduce((acc, n) => acc + n, 0); // 15
nums.find(n => n > 3); // 4
```

### `reduce` builds any shape

The accumulator does not have to be a number. To group items, accumulate into an object. Always return the accumulator from the callback.

```js
const words =
  ["apple", "avocado", "banana"];
words.reduce((acc, w) => {
  const letter = w[0];
  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(w);
  return acc;
}, {});
// { a: ["apple", "avocado"],
//   b: ["banana"] }
```

### Bracket notation reads a dynamic key

`obj[key]` reads the property named by the value of `key`. `obj.key` reads the literal property `"key"`.

```js
const user =
  { name: "Alice", role: "admin" };
const key = "role";
user[key]; // "admin"
```

### Object spread copies and merges

`{ ...obj }` makes a shallow copy. Later properties replace earlier ones with the same name.

```js
const base = { a: 1, b: 2 };
// { a: 1, b: 2, c: 3 }
const extended = { ...base, c: 3 };
// { a: 1, b: 99 }
const override = { ...base, b: 99 };
```

### `Object.entries` turns an object into an array

`Object.entries` gives `[key, value]` pairs. `Object.fromEntries` turns pairs back into an object.

```js
const prices = { apple: 1, banana: 0.5 };
const doubled = Object.fromEntries(
  Object.entries(prices)
    .map(([k, v]) => [k, v * 2])
);
// { apple: 2, banana: 1 }
```

### Arrays grow, and object keys are strings

Arrays are objects. They can hold mixed types, and `length` changes as they grow and shrink. Plain arrays have no element type; `TypedArray` exists for binary data. Object keys are strings or symbols, so `obj[1]` and `obj["1"]` are the same property.

## Watch out

- A missing property gives `undefined`. It does not throw: `{}.anything` is `undefined`.
- `sort`, `reverse`, `splice` and `push` change the array in place.
- `map`, `filter`, `reduce`, `concat` and `slice` do not change the array.
- Without an initial value, `reduce` uses the first element as the accumulator. Grouping into an object then breaks.
- JavaScript converts non-string keys to strings. Grouping by a number field gives keys like `"1"`, not `1`.

## The task

Write three collection functions in `stub.js`, like lodash's `pluck`, `groupBy` and `flatten`.

1. `pluck(arr, key)` takes an array of objects and a property name.
2. `pluck` returns a new array of the values at that property, in the same order.
3. `groupBy(arr, key)` groups an array of objects into one object.
4. Each key of the result is a value found at `key`, as a string.
5. Each value of the result is an array of the objects with that value.
6. `flatten(arr)` removes exactly one level of nesting from an array of arrays.

If an object has no `key`, `pluck` puts `undefined` at that position.

`groupBy` keeps the input order inside each group. Number values become string keys.

`flatten` keeps the order. It keeps deeper nesting as it is. Empty inner arrays add nothing.

All three return an empty result for an empty array: `[]`, `{}` and `[]`.

```js
const users = [
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "viewer" },
  { name: "Carol", role: "admin" },
];

pluck(users, "name")
// ["Alice", "Bob", "Carol"]
pluck([{ a: 1 }, { b: 2 }], "a")
// [1, undefined]
pluck([], "x") // []

groupBy(users, "role")
// { admin: [Alice, Carol],
//   viewer: [Bob] }
groupBy(
  [{ n: 1 }, { n: 2 }, { n: 1 }], "n")
// { "1": [{ n: 1 }, { n: 1 }],
//   "2": [{ n: 2 }] }
groupBy([], "x") // {}

flatten([[1, 2], [3, 4]]) // [1, 2, 3, 4]
flatten([["a", "b"], ["c"]])
// ["a", "b", "c"]
flatten([[1, [2]], [3]]) // [1, [2], 3]
flatten([[], [1], []]) // [1]
flatten([]) // []
```
