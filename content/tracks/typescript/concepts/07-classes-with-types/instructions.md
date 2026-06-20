# Classes with Types

## What you'll learn

TypeScript extends JavaScript classes with field type annotations, access modifiers, abstract classes, and first-class interface implementation. The additions are largely erased at compile time — you get compile-time enforcement without runtime overhead.

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

## The task

Implement the following:

- `abstract class Shape` with an `abstract area(): number` method and a concrete `describe(): string` method that returns `"Area: <n>"` (rounded to 2 decimal places).
- `class Circle extends Shape` — constructor takes `radius: number` (private); implements `area()`.
- `class Rectangle extends Shape` — constructor takes `width: number` and `height: number` (both private); implements `area()`.
- `interface Resizable` with `scale(factor: number): void`.
- `class ResizableCircle extends Circle implements Resizable` — `scale` multiplies the radius by factor. Add a `getRadius(): number` accessor so tests can inspect the value.
