## What you build

You model shapes with an abstract `Shape` base, two subclasses and a resizable circle. TypeScript adds field types, access modifiers, abstract classes and interface implementation to JavaScript classes. The compiler erases most of these additions, so they cost nothing at runtime. This lesson builds on **Types & Interfaces** and **Enums**.

## Key concepts

### Constructor parameters can declare fields

An access modifier on a constructor parameter creates the field and assigns it.

```ts
class Point {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}
}

const p = new Point(3, 4);
// 3: the field exists
p.x;
```

### Access modifiers control who can use a member

- `public`: any code can use it. This is the default.
- `private`: only the class body can use it. Use `#name` for runtime enforcement.
- `protected`: the class and its subclasses can use it.
- `readonly`: only the constructor can assign it.

JavaScript has only the `#private` syntax. TypeScript modifiers disappear in the emitted JavaScript.

### An abstract class is a contract for subclasses

You cannot create an instance of an abstract class. A subclass must implement each `abstract` member.

```ts
abstract class Shape {
  abstract area(): number;

  describe(): string {
    return `Area is ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}
```

### `implements` checks a class against an interface

At call sites, structural typing needs no declaration. `implements` is an explicit contract, and the compiler checks every member.

```ts
interface Printable {
  print(): void;
}

class Report implements Printable {
  print(): void {
    console.log("printing...");
  }
}
```

### `override` marks an intended override

TypeScript 4.3 added `override`. The compiler reports an error if the base class has no method with that name. This catches bugs when someone changes the base class.

```ts
class Animal {
  speak(): string { return "..."; }
}
class Dog extends Animal {
  override speak(): string {
    return "woof";
  }
}
```

## Watch out

- `private` and `protected` exist only at compile time. `(obj as any).secret` reads a private field at runtime.
- `JSON.stringify` includes private fields. Use the native `#field` syntax for real runtime encapsulation.
- Without `noImplicitOverride`, an override without the `override` keyword compiles silently.
- An `abstract` class can declare fields and constructors. You still cannot use `new` on it.
- A subclass constructor must call `super()` before it uses `this`. The compiler reports a missing call.

## The task

Model shapes with a shared abstract base and a resizable circle.

1. `abstract class Shape` declares `abstract area(): number`.
2. `Shape.describe(): string` returns `"Area: <n>"`, with `area()` rounded to 2 decimal places.
3. `class Circle extends Shape` takes a private `radius: number`. `area()` returns `Math.PI * radius ** 2`.
4. `class Rectangle extends Shape` takes private `width` and `height` numbers. `area()` returns `width * height`.
5. `interface Resizable` declares `scale(factor: number): void`.
6. `class ResizableCircle extends Circle implements Resizable` takes a starting `radius: number`.
7. `scale(factor)` multiplies the radius by `factor`.
8. `getRadius(): number` returns the current radius.
9. After `scale`, `area()` and `describe()` use the new radius.

Every shape is an `instanceof Shape`, including `ResizableCircle` through `Circle`.

```ts
new Circle(5).area();
// 78.539... (Math.PI * 25)
new Circle(1).describe();  // "Area: 3.14"
new Circle(1) instanceof Shape; // true

new Rectangle(3, 4).area();     // 12
new Rectangle(3, 4).describe();
// "Area: 12.00"

new ResizableCircle(5).getRadius(); // 5

const rc = new ResizableCircle(4);
rc.scale(2);
rc.getRadius();  // 8

const r3 = new ResizableCircle(3);
r3.scale(2);
r3.area();       // Math.PI * 36

const r1 = new ResizableCircle(1);
r1.scale(3);
r1.describe();   // "Area: 28.27"
r1 instanceof Shape; // true
```
