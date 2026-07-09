# Functions

## What you'll learn

Building on the values and types from lesson 1: in JavaScript, functions *are* values — they can be assigned, passed, and returned like any string or number. JavaScript has three syntaxes for functions. Arrow functions are the modern default for callbacks and short expressions. Function declarations are hoisted; `function` expressions are not. You'll also learn default parameters, rest parameters, and function composition — the building blocks the rest of this track uses constantly.

## Key concepts

**Arrow functions** (preferred for most cases):
```js
const double = (x) => x * 2;          // implicit return
const add    = (a, b) => a + b;
const greet  = (name) => {             // block body requires explicit return
  return `Hello, ${name}`;
};
```

**Default parameters** fill in when an argument is missing *or* explicitly `undefined`:
```js
function greet(name, greeting = "Hello") {
  return `${greeting}, ${name}`;
}
greet("Alice");              // "Hello, Alice"
greet("Bob", "Hi");          // "Hi, Bob"
greet("Eve", undefined);     // "Hello, Eve" — undefined triggers the default
```

**Rest parameters** collect extra arguments into a real array:
```js
function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4);  // 10
sum();            // 0 — nums is []
```

**Functions are first-class values** — you can pass them as arguments and return them:
```js
function compose(f, g) {
  return (x) => f(g(x));   // g runs first, then f
}
const double = (x) => x * 2;
const inc    = (x) => x + 1;
const doubleAfterInc = compose(double, inc);
doubleAfterInc(3);  // double(inc(3)) = double(4) = 8
```

**vs other languages:** No function overloading — a second declaration of the same name silently replaces the first. Use default parameters and rest instead. Python engineers: rest parameters are `*args`; there is no `**kwargs` equivalent (pass an options object instead).

## Watch out

- Defaults trigger on `undefined` only. `multiply(4, null)` does **not** use the default — `null` coerces to `0` in arithmetic, so you get `0`, not `4`.
- Arrow functions have no `this` of their own and no `arguments` object — use rest parameters instead of `arguments`.
- Composition order trips people up: `compose(f, g)` applies `g` first. Read it right-to-left, like math's `f ∘ g`.

## The task

You're implementing three functions that exercise default parameters, rest parameters, and first-class functions.

**`multiply(a, b = 1)`** — returns `a * b`. The second parameter defaults to `1`, so calling with one argument (or passing `undefined`) returns `a` unchanged.

```js
multiply(3, 4);          // 12
multiply(5);             // 5   — b defaults to 1
multiply(4, undefined);  // 4   — undefined also triggers the default
multiply(0, 100);        // 0
multiply(-2, 3);         // -6
```

**`sum(...nums)`** — takes any number of numeric arguments and returns their sum. Called with no arguments, it returns `0`.

```js
sum();              // 0
sum(1);             // 1
sum(1, 2, 3);       // 6
sum(1, 2, 3, 4, 5); // 15
sum(-1, -2, -3);    // -6
```

**`compose(f, g)`** — function composition: given two single-argument functions `f` and `g`, returns a **new function** that, given `x`, computes `f(g(x))` — i.e. it applies `g` first, then applies `f` to the result.

```js
const double = (x) => x * 2;
const inc    = (x) => x + 1;

compose(double, inc)(3);       // double(inc(3)) = double(4) = 8
compose(inc, double)(3);       // inc(double(3)) = inc(6)    = 7  — order matters
compose((x) => x, (x) => x)(42); // 42 — composing identities is identity
```
