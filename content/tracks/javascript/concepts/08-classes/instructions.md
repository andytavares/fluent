## What you build

You write a `Stack` with private state and a `Shape` family with inheritance, overrides and a static factory. Classes are the other way to keep state private, after closures, and most codebases use them. This lesson builds on **Async JavaScript**.

## Key concepts

### `class` is syntax over prototypes

ES2015 added `class` syntax. Under it, inheritance still uses prototypes. Java and C++ classes are compile-time types that fix memory layout. JavaScript classes are prototype chains at runtime.

### The language enforces private fields

ES2022 added `#field`. Code outside the class cannot read it: the parser rejects the access with a `SyntaxError`. Python's `__name` is only a convention, and Java's `private` is a compiler check.

```js
class Counter {
  // Private: no access outside the class
  #count = 0;

  constructor(start = 0) {
    this.#count = start;
  }

  increment() {
    this.#count++;
  }

  // Read it as counter.value
  get value() {
    return this.#count;
  }
}

const c = new Counter(10);
c.increment();
console.log(c.value);  // 11
// SyntaxError: private field
console.log(c.#count);
```

### Static members belong to the class

You call a static member on the class, not on an instance. A static method is the idiomatic home for a named constructor. `Circle.unitCircle()` reads better than a constructor flag.

```js
class MathUtils {
  static PI = 3.14159;

  static circleArea(r) {
    return MathUtils.PI * r * r;
  }
}

MathUtils.circleArea(5); // 78.53...
```

### `extends` inherits, and a method can override

A subclass method with the same name replaces the parent method. A subclass constructor must call `super()` before it uses `this`.

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a noise.`;
  }
}

class Dog extends Animal {
  // Override
  speak() {
    return `${this.name} barks.`;
  }
}

class Cat extends Animal {
  constructor(name, indoor) {
    // Call super() before this
    super(name);
    this.indoor = indoor;
  }
}
```

### `instanceof` checks the whole prototype chain

An instance of a subclass is also an instance of each parent class.

```js
const d = new Dog("Rex");
d instanceof Dog;    // true
d instanceof Animal; // true
```

### You can add methods at runtime

`ClassName.prototype.method = ...` adds a method to an existing class. Do not do this in production code, but know that it exists.

## Watch out

- A class call without `new` throws a `TypeError`. Old constructor functions wrote to globals instead.
- In a subclass constructor, `this` before `super()` throws a `ReferenceError`.
- Read a getter without parentheses: `stack.size`, not `stack.size()`. A call throws `TypeError: not a function`.
- A method taken off its object loses `this`: `const pop = stack.pop; pop()` fails. Bind it or keep the receiver.

## The task

Write two class hierarchies in `stub.js`: a `Stack` with private state and a `Shape` family.

`Stack` is last-in, first-out (LIFO). It keeps its elements in a private field `#items`.

1. `push(value)` adds `value` to the top.
2. `pop()` removes and returns the top value, the one pushed last.
3. `peek()` returns the top value and does not remove it.
4. The getter `size` returns the current count of elements.
5. The getter `isEmpty` returns `true` when the stack has no elements, and `false` otherwise.
6. `pop()` and `peek()` on an empty stack throw `Error("Stack is empty")`.

`Shape`, `Circle` and `Rectangle` form a small hierarchy.

7. The `Shape` constructor takes a `color` string and stores it as `this.color`.
8. `Shape` has `describe()`, which returns `"A {color} shape"`.
9. `Circle extends Shape`. Its constructor takes `(color, radius)` and stores `this.radius`.
10. `Circle` overrides `describe()` to return `"A {color} circle with radius {radius}"`.
11. The static method `Circle.unitCircle()` returns a new `Circle("white", 1)`.
12. `Rectangle extends Shape`. Its constructor takes `(color, width, height)`.
13. `Rectangle` overrides `describe()` to return `"A {color} rectangle {width}x{height}"`.
14. `Rectangle` has `area()`, which returns `width * height`.

Both subclasses must extend `Shape`, so `instanceof Shape` is `true`.

```js
const s = new Stack();
s.isEmpty // true
s.size    // 0
s.push(10);
s.push(20);
s.size    // 2
s.peek()  // 20
s.size    // 2
s.pop()   // 20
s.pop()   // 10
s.isEmpty // true
// Both throw Error("Stack is empty")
s.pop();
new Stack().peek();

new Shape("red").describe()
// "A red shape"

const c = new Circle("blue", 5);
c.describe()
// "A blue circle with radius 5"
c instanceof Shape // true

const u = Circle.unitCircle();
u instanceof Circle // true
u.color  // "white"
u.radius // 1
u.describe()
// "A white circle with radius 1"

const r = new Rectangle("green", 3, 4);
r.describe()
// "A green rectangle 3x4"
r.area() // 12
r instanceof Shape // true
```
