# Classes with Types

## What you'll learn

You've used interfaces (lesson 1) to describe object shapes and enums (lesson 6) to model runtime constants; this lesson brings the type system to JavaScript classes. TypeScript extends classes with field type annotations, access modifiers, abstract classes, and first-class interface implementation. The additions are largely erased at compile time — you get compile-time enforcement without runtime overhead.

## Key concepts

**Typed fields and constructor shorthand.** Declaring a parameter with an access modifier in the constructor automatically creates and assigns the corresponding field:

```ts
class Point {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}
}

const p = new Point(3, 4);
p.x;  // 3 — field created automatically
```

**Access modifiers:**
- `public` — accessible everywhere (the default)
- `private` — accessible only within the class body (compile-time only; use `#name` for runtime enforcement)
- `protected` — accessible within the class and subclasses
- `readonly` — can only be assigned during construction

**Abstract classes** define a contract that subclasses must fulfill. They cannot be instantiated directly:

```ts
abstract class Shape {
  abstract area(): number;

  describe(): string {
    return `Area is ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) { super(); }
  area(): number { return Math.PI * this.radius ** 2; }
}
```

**Implementing interfaces.** Unlike structural typing at call sites, the `implements` keyword is an explicit contract that the class fulfills a named interface — the compiler verifies every member:

```ts
interface Printable {
  print(): void;
}

class Report implements Printable {
  print(): void { console.log("printing..."); }
}
```

**The `override` keyword** (TypeScript 4.3+) marks that a method intentionally overrides a base-class method. The compiler errors if no matching method exists in the parent — preventing silent bugs when base classes are refactored:

```ts
class Animal { speak(): string { return "..."; } }
class Dog extends Animal {
  override speak(): string { return "woof"; }
}
```

**vs JavaScript:** JavaScript classes have no type annotations, no access modifiers at the syntax level (only the `#private` runtime proposal), and no abstract classes. TypeScript's access modifiers are purely compile-time — they disappear in the emitted JS.

## Watch out

- `private` and `protected` are **compile-time only**. `(instance as any).privateField` reads it just fine at runtime, and `JSON.stringify(instance)` serializes private fields too — they are not hidden from anything except the type checker. Use the native `#field` syntax if you need real runtime encapsulation.
- `override` only produces a compile error for a missing base method when the `noImplicitOverride` compiler flag is enabled. Without that flag, `override` is purely documentation — writing it on a method that doesn't actually override anything compiles silently.
- An `abstract` class can declare fields and constructors, but you cannot `new` it directly — only a concrete subclass. Forgetting to call `super()` in a subclass constructor before accessing `this` is a runtime error, not a compile error, if the abstract base has no required constructor parameters of its own.

## The task

You're modeling shapes with a shared abstract base and a resizable variant.

**`abstract class Shape`** — declares `abstract area(): number` (implemented by subclasses) and a concrete `describe(): string` that returns `"Area: <n>"`, where `<n>` is `area()` rounded to 2 decimal places.

```ts
class Circle extends Shape {
  constructor(private radius: number) { super(); }
  area(): number { return Math.PI * this.radius ** 2; }
}
new Circle(1).describe();  // "Area: 3.14"
```

**`class Circle extends Shape`** — constructor takes `radius: number` (private); `area()` returns `π × radius²`.

```ts
new Circle(5).area();       // ~78.54  (Math.PI * 25)
new Circle(1) instanceof Shape;  // true
```

**`class Rectangle extends Shape`** — constructor takes `width: number` and `height: number` (both private); `area()` returns `width × height`.

```ts
new Rectangle(3, 4).area();      // 12
new Rectangle(3, 4).describe();  // "Area: 12.00"
```

**`interface Resizable`** — declares `scale(factor: number): void`.

**`class ResizableCircle extends Circle implements Resizable`** — a circle whose radius can be scaled after construction. `scale(factor)` multiplies the radius by `factor`; `getRadius(): number` returns the current radius so callers (and tests) can inspect it.

```ts
const rc = new ResizableCircle(4);
rc.getRadius();      // 4
rc.scale(2);
rc.getRadius();      // 8
rc.area();           // π × 8² ≈ 201.06
rc instanceof Shape;  // true — inherits through Circle
```
