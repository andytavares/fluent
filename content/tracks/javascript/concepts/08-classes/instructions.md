# Classes

## What you'll learn

Lesson 4 showed private state via closures; classes are the other way JavaScript encapsulates state, and the one you'll meet in most codebases. JavaScript's `class` syntax (ES2015+) is syntactic sugar over prototype-based inheritance. Under the hood it's still prototypes, but the class keyword gives you clean OOP patterns. Private fields (`#field`) are hard, language-enforced privacy added in ES2022 — not just a naming convention. You'll also use `throw` from lesson 5 for invalid operations.

## Key concepts

**Declaration, constructor, private fields, getters:**
```js
class Counter {
  #count = 0;              // private field — inaccessible outside the class

  constructor(start = 0) {
    this.#count = start;
  }

  increment() {
    this.#count++;
  }

  get value() {           // getter — accessed as counter.value, not counter.value()
    return this.#count;
  }
}

const c = new Counter(10);
c.increment();
console.log(c.value);    // 11
console.log(c.#count);   // SyntaxError — private field
```

**Static members** belong to the class, not instances:
```js
class MathUtils {
  static PI = 3.14159;

  static circleArea(r) {
    return MathUtils.PI * r * r;
  }
}

MathUtils.circleArea(5);   // 78.53...
```
A static method is also the idiomatic home for named constructors (factories): `Circle.unitCircle()` reads better than a constructor flag.

**Inheritance:**
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
  speak() {                // override — replaces the parent method
    return `${this.name} barks.`;
  }
}

class Cat extends Animal {
  constructor(name, indoor) {
    super(name);           // must call super() before accessing this
    this.indoor = indoor;
  }
}
```

**instanceof** checks the whole prototype chain:
```js
const d = new Dog("Rex");
d instanceof Dog;     // true
d instanceof Animal;  // true — checks the prototype chain
```

**vs other languages:** Java/C++ classes are compile-time types that define memory layout. JavaScript classes are runtime prototype chains — you can add methods to any class after the fact via `ClassName.prototype.method = ...` (don't do this in production, but understand it exists). Java's `private` is enforced by the compiler; JavaScript's `#field` is enforced by the parser — accessing it outside the class is a `SyntaxError`, not just a runtime error. Python's `__dunder` convention is unenforced; JS `#field` is.

## Watch out

- Calling a class without `new` throws a `TypeError`. (Pre-class constructor functions silently corrupted globals instead — the class syntax fixed that.)
- In a subclass constructor, `super()` must run before any `this.` access — otherwise `ReferenceError`.
- Getters are accessed **without** parentheses: `stack.size`, not `stack.size()`. Calling one as a function throws `TypeError: not a function`.
- Extracting a method loses `this`: `const pop = stack.pop; pop()` fails. Bind it or keep the receiver.

## The task

You're implementing two class hierarchies: a `Stack` container with private state, and a `Shape` family demonstrating inheritance, overriding, and static factories.

**`Stack`** — a LIFO (last-in, first-out) stack storing its elements in a **private field `#items`**:

- `push(value)` — adds `value` to the top of the stack.
- `pop()` — removes and returns the top (most recently pushed) value. Throws `Error("Stack is empty")` if the stack is empty.
- `peek()` — returns the top value **without** removing it. Throws `Error("Stack is empty")` if the stack is empty.
- `get size` — getter (property access, no parentheses) returning the current number of elements.
- `get isEmpty` — getter returning `true` when the stack has no elements, else `false`.

```js
const s = new Stack();
s.isEmpty;   // true
s.size;      // 0
s.push(10);
s.push(20);
s.size;      // 2
s.peek();    // 20 — top value, not removed
s.size;      // 2
s.pop();     // 20 — LIFO: last pushed comes out first
s.pop();     // 10
s.isEmpty;   // true
s.pop();     // throws Error("Stack is empty")
new Stack().peek(); // throws Error("Stack is empty")
```

**`Shape`, `Circle`, `Rectangle`** — a small inheritance hierarchy:

- `Shape` — constructor takes a `color` string and stores it as `this.color`. Method `describe()` returns `"A {color} shape"`.
- `Circle extends Shape` — constructor takes `(color, radius)`. Overrides `describe()` to return `"A {color} circle with radius {radius}"`. Static method `Circle.unitCircle()` returns a new `Circle("white", 1)`.
- `Rectangle extends Shape` — constructor takes `(color, width, height)`. Overrides `describe()` to return `"A {color} rectangle {width}x{height}"`. Instance method `area()` returns `width * height`.

Both subclasses must actually extend `Shape` (so `instanceof Shape` is `true`).

```js
new Shape("red").describe();              // "A red shape"

const c = new Circle("blue", 5);
c.describe();                             // "A blue circle with radius 5"
c instanceof Shape;                       // true

const u = Circle.unitCircle();            // static factory
u instanceof Circle;                      // true
u.color;                                  // "white"
u.radius;                                 // 1
u.describe();                             // "A white circle with radius 1"

const r = new Rectangle("green", 3, 4);
r.describe();                             // "A green rectangle 3x4"
r.area();                                 // 12
r instanceof Shape;                       // true
```
