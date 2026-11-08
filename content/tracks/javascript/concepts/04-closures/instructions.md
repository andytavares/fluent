## What you build

You write three factories: `makeCounter`, `makeAdder` and `once`. Each returns a function that keeps private state or configuration from the factory's scope. This lesson builds on **Arrays & Objects**.

## Key concepts

### Every function is a closure

A closure is a function that keeps variables from the scope where you define it. It keeps them after that scope returns. JavaScript uses closures for private state, factories and memoization.

### A closure captures the binding, not the value

The returned function holds a live reference to the variable, not a copy. Each call sees and changes the same `count`.

```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3
```

### Each factory call makes a fresh scope

Two counters from two calls do not share state.

```js
const a = makeCounter();
const b = makeCounter();
a(); a(); // 1, 2
// Independent of a
b();      // 1
```

### A factory captures configuration

The returned function keeps the argument of the factory call.

```js
function makeAdder(x) {
  return (y) => x + y;
}

const add5 = makeAdder(5);
add5(3);  // 8
add5(10); // 15
```

### Memoization caches results in a closure

The returned function keeps a `Map` of earlier results.

```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
}
```

### Captured variables stay writable

Python, Ruby and Go also have closures, because they use lexical scope. Unlike Python, JavaScript needs no `nonlocal` to assign a captured variable. Unlike Java, it has no "effectively final" rule.

## Watch out

- `var` in a loop gives one variable for all iterations. Every callback then sees the last value.

  ```js
  // Prints 3 3 3
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
  // Prints 0 1 2
  for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
  ```

  `let` makes a new binding for each iteration. ES6 added `let` for this reason.
- A closure keeps its captured scope alive. A closure over a huge object stops garbage collection of that object.
- `undefined` is a legal result to cache. Track "already called" with a separate boolean, not with the result.

## The task

Write three factories in `stub.js`. Each returns a function that keeps private state or configuration.

1. `makeCounter(start = 0)` returns a counter function.
2. The first call of the counter returns `start`. Each later call returns 1 more.
3. `makeAdder(n)` returns a function that takes one number `x` and returns `x + n`.
4. `once(fn)` returns a wrapper that calls `fn` at most one time.
5. The first call of the wrapper passes its arguments to `fn` and stores the return value.
6. Each later call returns the stored value and does not call `fn`.

Counters from separate `makeCounter` calls are independent.

The wrapper from `once` ignores the arguments of later calls.

```js
const c = makeCounter();
c() // 0
c() // 1
c() // 2
const d = makeCounter(10);
d() // 10
d() // 11
// c is independent of d
c() // 3
d() // 12

const add5 = makeAdder(5);
add5(3)  // 8
add5(0)  // 5
add5(-5) // 0
makeAdder(0)(7) // 7

let calls = 0;
const init = once(() => {
  calls++;
  return 42;
});
init() // 42
init() // 42
init() // 42
calls  // 1

const add = once((a, b) => a + b);
add(2, 3)   // 5
add(10, 20) // 5
```
