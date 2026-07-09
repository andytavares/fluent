# Closures

## What you'll learn

Lesson 2 established that functions are values you can return from other functions; this lesson is about what those returned functions can *remember*. A closure is a function that captures variables from its surrounding scope. In JavaScript, every function is a closure — it retains a live reference to the variables in the scope where it was defined, even after that scope has returned. Closures are how JS does private state, factories, and memoization.

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

**Each factory call creates a fresh scope** — two counters don't share state:
```js
const a = makeCounter();
const b = makeCounter();
a(); a(); // 1, 2
b();      // 1 — independent
```

**Factory functions** use closures to bake in configuration:
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

**vs other languages:** Languages with lexical scope (Python, Ruby, Go) all have closures. Python engineers: no `nonlocal` needed — JS closures can assign to captured variables directly. Java engineers: no "effectively final" restriction — captured bindings are fully mutable.

## Watch out

- **`var` in loops** is the most famous JS footgun — all iterations share one variable:
  ```js
  for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 3 3 3
  for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 0 1 2
  ```
  `let` creates a new binding per iteration; this is why it was added in ES6.
- A closure keeps its captured scope alive — holding a closure over a huge object prevents it from being garbage-collected.
- When caching a result, remember `undefined` is a legal result. Track "have I been called?" with a separate boolean, not by checking whether the result is set.

## The task

You're implementing three closure-based factories. Each returns a function that carries private state or configuration captured from the factory's scope.

**`makeCounter(start = 0)`** — returns a function that returns the next integer each time it's called, starting **at** `start`: the first call returns `start`, the second returns `start + 1`, and so on. Counters created by separate calls are independent.

```js
const c = makeCounter();
c(); // 0 — first call returns the start value
c(); // 1
c(); // 2

const d = makeCounter(10);
d(); // 10
d(); // 11
c(); // 3 — c is unaffected by d
```

**`makeAdder(n)`** — returns a function that takes one number `x` and returns `x + n`.

```js
const add5 = makeAdder(5);
add5(3);   // 8
add5(0);   // 5
add5(-5);  // 0

const add0 = makeAdder(0);
add0(7);   // 7
```

**`once(fn)`** — returns a wrapper function that invokes `fn` at most once. The first call invokes `fn`, forwarding any arguments, and caches the return value. Every subsequent call returns that cached value **without** invoking `fn` again — later arguments are ignored.

```js
let calls = 0;
const init = once(() => { calls++; return 42; });
init(); // 42 — fn ran
init(); // 42 — cached; fn NOT called again
init(); // 42
calls;  // 1

const add = once((a, b) => a + b);
add(2, 3);   // 5 — first call's arguments are forwarded to fn
add(10, 20); // 5 — still the first result; new arguments ignored
```
