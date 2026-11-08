## What you build

You write `multiply`, `sum` and `compose`. They use default parameters, rest parameters and functions as values. This lesson builds on **Variables & Types**.

## Key concepts

### Functions are values

You can assign a function, pass it as an argument and return it, like a string or a number. JavaScript has three syntaxes: declarations, `function` expressions and arrow functions. JavaScript hoists declarations, but not `function` expressions.

### Arrow functions are the modern default

Use arrow functions for callbacks and short expressions. An expression body returns its value. A block body needs an explicit `return`.

```js
// Implicit return
const double = (x) => x * 2;
const add = (a, b) => a + b;
// A block body needs return
const greet = (name) => {
  return `Hello, ${name}`;
};
```

### A default parameter fills a missing argument

The default applies when the argument is missing or is `undefined`.

```js
function greet(name, greeting = "Hello") {
  return `${greeting}, ${name}`;
}
greet("Alice");          // "Hello, Alice"
greet("Bob", "Hi");      // "Hi, Bob"
// undefined uses the default
greet("Eve", undefined); // "Hello, Eve"
```

### Rest parameters collect extra arguments

`...name` puts the remaining arguments into a real array. With no arguments, the array is empty. Python's `*args` is the same idea, but JavaScript has no `**kwargs`; pass an options object.

```js
function sum(...nums) {
  return nums.reduce(
    (acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4); // 10
// nums is []
sum();           // 0
```

### Composition returns a new function

`compose(f, g)` returns a function that runs `g` first, then `f` on the result.

```js
function compose(f, g) {
  return (x) => f(g(x));
}
const double = (x) => x * 2;
const inc = (x) => x + 1;
const incThenDouble = compose(double, inc);
// double(inc(3)) = double(4) = 8
incThenDouble(3); // 8
```

### JavaScript has no overloading

A second declaration with the same name replaces the first, with no warning. Use default and rest parameters instead.

## Watch out

- A default applies on `undefined` only. `multiply(4, null)` gives `0`, because `null` becomes `0` in arithmetic.
- Arrow functions have no own `this` and no `arguments` object. Use rest parameters in place of `arguments`.
- `compose(f, g)` applies `g` first. Read it right to left, like `f ∘ g` in math.

## The task

Write three functions in `stub.js` that use default parameters, rest parameters and functions as values.

1. `multiply(a, b = 1)` returns `a * b`.
2. `sum(...nums)` takes any count of numbers and returns their sum.
3. `compose(f, g)` takes two functions of one argument each.
4. `compose` returns a new function that computes `f(g(x))` for a given `x`.

`multiply` with one argument returns `a`. An explicit `undefined` for `b` also gives the default `1`.

`sum` with no arguments returns `0`.

`compose` applies `g` first, so the argument order changes the result.

```js
multiply(3, 4)         // 12
multiply(5)            // 5
multiply(4, undefined) // 4
multiply(0, 100)       // 0
multiply(-2, 3)        // -6

sum()              // 0
sum(1)             // 1
sum(1, 2, 3)       // 6
sum(1, 2, 3, 4, 5) // 15
sum(-1, -2, -3)    // -6

const double = (x) => x * 2;
const inc = (x) => x + 1;
compose(double, inc)(3) // 8
compose(inc, double)(3) // 7
// Composing identities gives identity
compose((x) => x, (x) => x)(42) // 42
```
