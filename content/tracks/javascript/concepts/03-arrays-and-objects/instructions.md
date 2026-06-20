# Arrays & Objects

## What you'll learn

JavaScript arrays and objects are the two universal data structures. Modern JS provides expressive built-in array methods and destructuring syntax that replace most manual loops.

## Key concepts

**Array methods** (all return new arrays — original is unchanged):
```js
const nums = [1, 2, 3, 4, 5];
nums.filter(n => n % 2 === 0);      // [2, 4]
nums.map(n => n * 2);               // [2, 4, 6, 8, 10]
nums.reduce((acc, n) => acc + n, 0); // 15
nums.find(n => n > 3);              // 4
```

**Destructuring:**
```js
const [first, second, ...rest] = [1, 2, 3, 4];
// first=1, second=2, rest=[3,4]

const { name, age, ...extra } = { name: "Alice", age: 30, city: "NYC" };
// name="Alice", age=30, extra={city:"NYC"}
```

**Object spread** creates shallow copies and merges:
```js
const base = { a: 1, b: 2 };
const extended = { ...base, c: 3 };   // { a:1, b:2, c:3 }
const override  = { ...base, b: 99 }; // { a:1, b:99 }
```

**`Object.entries` / `Object.fromEntries`** for transforming objects as arrays:
```js
const prices = { apple: 1, banana: 0.5 };
const doubled = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 2])
);
// { apple: 2, banana: 1 }
```

**vs other languages:** Arrays are objects and can hold mixed types. There are no typed arrays in plain JS (TypedArray exists for binary data). `length` is not fixed — arrays grow and shrink dynamically.

## The task

Implement three functions:

- `pluck(arr, key)` — given an array of objects and a key name, return an array of the values at that key (e.g. `pluck([{x:1},{x:2}], 'x')` → `[1, 2]`)
- `groupBy(arr, key)` — group an array of objects into an object keyed by the value at `key` (e.g. `groupBy([{type:'a'},{type:'b'},{type:'a'}], 'type')` → `{a:[...], b:[...]}`)
- `flatten(arr)` — flatten one level of nesting from an array of arrays (e.g. `[[1,2],[3,4]]` → `[1,2,3,4]`)
