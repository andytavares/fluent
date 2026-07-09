# Arrays & Objects

## What you'll learn

JavaScript arrays and objects are the two universal data structures. This lesson builds directly on lesson 2 — the array methods here (`map`, `filter`, `reduce`) all take the first-class functions you just learned as callbacks. Modern JS provides expressive built-in array methods and object utilities that replace most manual loops.

## Key concepts

**Array methods** (all return new arrays — the original is unchanged):
```js
const nums = [1, 2, 3, 4, 5];
nums.filter(n => n % 2 === 0);       // [2, 4]
nums.map(n => n * 2);                // [2, 4, 6, 8, 10]
nums.reduce((acc, n) => acc + n, 0); // 15
nums.find(n => n > 3);               // 4
```

**`reduce` builds any shape** — the accumulator doesn't have to be a number. Accumulating into an object is the standard way to group:
```js
const words = ["apple", "avocado", "banana"];
words.reduce((acc, w) => {
  const letter = w[0];
  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(w);
  return acc;                        // always return the accumulator
}, {});
// { a: ["apple", "avocado"], b: ["banana"] }
```

**Object property access with a dynamic key** uses bracket notation:
```js
const user = { name: "Alice", role: "admin" };
const key = "role";
user[key];   // "admin" — user.key would look up the literal property "key"
```

**Object spread** creates shallow copies and merges:
```js
const base = { a: 1, b: 2 };
const extended = { ...base, c: 3 };   // { a:1, b:2, c:3 }
const override = { ...base, b: 99 };  // { a:1, b:99 }
```

**`Object.entries` / `Object.fromEntries`** for transforming objects as arrays:
```js
const prices = { apple: 1, banana: 0.5 };
const doubled = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 2])
);
// { apple: 2, banana: 1 }
```

**vs other languages:** Arrays are objects and can hold mixed types. There are no typed arrays in plain JS (TypedArray exists for binary data). `length` is not fixed — arrays grow and shrink dynamically. Object keys are always strings (or symbols): `obj[1]` and `obj["1"]` are the same property.

## Watch out

- Accessing a missing property returns `undefined` — it does not throw. `{}.anything` is `undefined`.
- Not every array method is pure: `sort`, `reverse`, `splice`, and `push` mutate in place. `map`/`filter`/`reduce`/`concat`/`slice` do not.
- Forgetting `reduce`'s initial value makes the first element the accumulator — a classic bug when accumulating into an object.
- Object keys from non-string values are stringified: grouping by a numeric field gives you keys like `"1"`, not `1`.

## The task

You're implementing three collection utilities of the kind found in every utility library (lodash's `pluck`/`groupBy`/`flatten`).

**`pluck(arr, key)`** — given an array of objects and a property name, returns a new array of the values at that property, in the same order. If an object lacks the key, that position holds `undefined`. An empty input array yields `[]`.

```js
pluck([{ x: 1 }, { x: 2 }], "x");                    // [1, 2]
pluck([{ name: "Alice" }, { name: "Bob" }], "name"); // ["Alice", "Bob"]
pluck([{ a: 1 }, { b: 2 }], "a");                    // [1, undefined]
pluck([], "x");                                      // []
```

**`groupBy(arr, key)`** — groups an array of objects into an object whose keys are the (stringified) values found at `key`, and whose values are arrays of the objects that had that value, preserving input order within each group. An empty input array yields `{}`.

```js
groupBy(
  [{ type: "a", n: 1 }, { type: "b", n: 2 }, { type: "a", n: 3 }],
  "type"
);
// { a: [{type:"a",n:1}, {type:"a",n:3}], b: [{type:"b",n:2}] }

groupBy([{ n: 1 }, { n: 2 }, { n: 1 }], "n");
// { "1": [{n:1}, {n:1}], "2": [{n:2}] }  — object keys are strings

groupBy([], "x"); // {}
```

**`flatten(arr)`** — flattens exactly **one** level of nesting from an array of arrays, preserving order. Deeper nesting is kept as-is. An empty input yields `[]`.

```js
flatten([[1, 2], [3, 4]]);      // [1, 2, 3, 4]
flatten([["a", "b"], ["c"]]);   // ["a", "b", "c"]
flatten([[1, [2]], [3]]);       // [1, [2], 3] — only one level is flattened
flatten([[], [1], []]);         // [1] — empty inner arrays contribute nothing
flatten([]);                    // []
```
