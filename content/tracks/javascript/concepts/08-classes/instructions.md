# Classes

## What you'll learn

JavaScript's `class` syntax (ES2015+) is syntactic sugar over prototype-based inheritance. Under the hood it's still prototypes, but the class keyword gives you clean OOP patterns. Private fields (`#field`) are a hard language-enforced privacy added in ES2022 — not just a naming convention.

## Key concepts

**Declaration and constructor:**
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

**Static members:**
```js
class MathUtils {
  static PI = 3.14159;

  static circleArea(r) {
    return MathUtils.PI * r * r;
  }
}

MathUtils.circleArea(5);   // 78.53...
// new MathUtils() is pointless — no instance data
```

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
  speak() {
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

**instanceof:**
```js
const d = new Dog("Rex");
d instanceof Dog;     // true
d instanceof Animal;  // true — checks the prototype chain
```

**vs other languages:** Java/C++ classes are compile-time types that define memory layout. JavaScript classes are runtime prototype chains — you can add methods to any class after the fact via `ClassName.prototype.method = ...` (don't do this in production, but understand it exists). Java's `private` is enforced by the compiler; JavaScript's `#field` is enforced by the parser — accessing it outside the class is a `SyntaxError`, not just a runtime error. Python's `__dunder` convention is unenforced; JS `#field` is.

## The task

Implement two classes:

**`Stack`** — a generic LIFO stack:
- `push(value)` — adds a value to the top
- `pop()` — removes and returns the top value; throws `Error("Stack is empty")` if empty
- `peek()` — returns the top value without removing it; throws `Error("Stack is empty")` if empty
- `get size` — getter returning the current number of elements
- `get isEmpty` — getter returning `true` if the stack has no elements
- Store items in a private field `#items`

**`Shape`** and subclasses:
- `Shape` base class: constructor takes `color` string; method `describe()` returns `"A {color} shape"`
- `Circle extends Shape`: constructor takes `(color, radius)`; overrides `describe()` to return `"A {color} circle with radius {radius}"`; static method `unitCircle()` returns a new `Circle("white", 1)`
- `Rectangle extends Shape`: constructor takes `(color, width, height)`; overrides `describe()` to return `"A {color} rectangle {width}x{height}"`; instance method `area()` returns `width * height`
