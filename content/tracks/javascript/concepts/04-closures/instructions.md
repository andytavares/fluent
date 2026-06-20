# Closures

## What you'll learn

A closure is a function that captures variables from its surrounding scope. In JavaScript, every function is a closure — it retains a live reference to the variables in the scope where it was defined, even after that scope has returned.

## Key concepts

**A closure captures the binding, not the value:**
```js
function makeCounter() {
  let count = 0;
  return () => ++count;  // captures the `count` variable, not a copy
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3
```

**Factory functions** use closures to create private state:
```js
function makeAdder(x) {
  return (y) => x + y;  // x is captured
}

const add5 = makeAdder(5);
add5(3);  // 8
add5(10); // 15
```

**Memoization** caches results using a closure over a Map:
```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}
```

**Pitfall — `var` in loops** (one of the most famous JS footguns):
```js
// Broken: all closures share the same `i` variable
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 3 3 3

// Fixed: use `let` (block-scoped, new binding per iteration)
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 0 1 2
```

**vs other languages:** Languages with lexical scope (Python, Ruby, Go) all have closures. The JS-specific subtlety is `var`'s function scope — understanding it explains why `let` was added in ES6.

## The task

Implement three functions:

- `makeCounter(start = 0)` — returns a function that, each time called, returns the next integer starting from `start`
- `makeAdder(n)` — returns a function that adds `n` to its argument
- `once(fn)` — returns a wrapper that calls `fn` the first time it is invoked, then returns that same result on all subsequent calls without calling `fn` again
