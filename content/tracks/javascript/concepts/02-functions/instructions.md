# Functions

## What you'll learn

JavaScript has three syntaxes for functions. Arrow functions are the modern default for callbacks and short expressions. Function declarations are hoisted. `function` expressions are not.

## Key concepts

**Arrow functions** (preferred for most cases):
```js
const double = (x) => x * 2;          // implicit return
const add    = (a, b) => a + b;
const greet  = (name) => {             // block body requires explicit return
  return `Hello, ${name}`;
};
```

**Default parameters:**
```js
function greet(name, greeting = "Hello") {
  return `${greeting}, ${name}`;
}
greet("Alice");           // "Hello, Alice"
greet("Bob", "Hi");       // "Hi, Bob"
```

**Rest parameters** collect extra arguments into an array:
```js
function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4);  // 10
```

**Functions are first-class values** — you can pass them as arguments and return them:
```js
function compose(f, g) {
  return (x) => f(g(x));
}
const double = (x) => x * 2;
const inc    = (x) => x + 1;
const doubleAfterInc = compose(double, inc);
doubleAfterInc(3);  // 8
```

**vs other languages:** No function overloading — a second declaration of the same name silently replaces the first. Use default parameters and rest instead.

## The task

Implement three functions:

- `multiply(a, b = 1)` — returns `a * b`; `b` defaults to `1`
- `sum(...nums)` — returns the sum of all arguments (returns `0` if called with no arguments)
- `compose(f, g)` — returns a new function that, given `x`, computes `f(g(x))`
