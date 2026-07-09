# Interfaces

## What you'll learn

Building on classes and objects (concept 1): a Java interface defines a contract — a set of method signatures that implementing classes must provide, with no state of their own. Interfaces enable polymorphism: code written against an interface works with any implementation, including ones that don't exist yet.

## Key concepts

**Defining an interface:**
```java
public interface Shape {
    double area();
    double perimeter();
    String name();
}
```

**Implementing an interface:**
```java
public class Circle implements Shape {
    private final double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }

    @Override
    public double perimeter() {
        return 2 * Math.PI * radius;
    }

    @Override
    public String name() {
        return "Circle";
    }
}
```

**A class can implement multiple interfaces** (unlike extending classes, where Java allows only one parent):
```java
public class Square implements Shape, Comparable<Square> { ... }
```

**Default methods** (Java 8+) let interfaces provide a default implementation so existing implementors aren't broken when new methods are added:
```java
interface Shape {
    double area();
    default String describe() {
        return name() + " with area " + area();
    }
}
```

**vs other languages:** Java interfaces are nominal — a class must explicitly `implements` an interface. TypeScript and Go use structural typing (duck typing), where compatibility is inferred from the shape of the type alone, with no `implements` keyword required.

## Watch out

- **A variable declared with the interface type only exposes interface methods.** `Shape s = new Circle(5);` means `s.getRadius()` won't compile even though the underlying object has that method — you'd need to cast back to `Circle` first.
- **Multiple interfaces can't have conflicting default methods** without you resolving the conflict explicitly — the compiler forces you to override and pick (or combine) the behavior.
- **`implements` vs `extends`:** classes use `implements` for interfaces and `extends` for a superclass (singular). Interfaces use `extends` to inherit from other interfaces. Mixing these up is a common compile error for newcomers.

## The task

Two shapes need to satisfy a common `Shape` interface (already defined in `Solution.java`) so a caller can compare shapes without knowing their concrete type.

Implement two classes that both implement `Shape`:

**`Circle(double radius)`** — `area()` returns `π * r²`, `perimeter()` returns `2πr`, `name()` returns `"Circle"`.

**`Rectangle(double width, double height)`** — `area()` returns `w * h`, `perimeter()` returns `2(w+h)`, `name()` returns `"Rectangle"`.

Also implement the utility method:

**`static Shape larger(Shape a, Shape b)`** — returns whichever shape has the larger area; if the areas are equal, returns `a`.

```java
Shape c = new Circle(5);
Shape r = new Rectangle(4, 6);

c.area();               // ~78.54  (π * 25)
c.perimeter();           // ~31.42  (2π * 5)
c.name();                // "Circle"

r.area();                // 24.0
r.perimeter();            // 20.0
r.name();                 // "Rectangle"

Shape big   = new Circle(10);
Shape small = new Rectangle(1, 1);
larger(big, small).name();     // "Circle"    — big is the first arg and larger
larger(small, big).name();     // "Circle"    — order of args doesn't change which shape wins
larger(small, small).name();   // "Rectangle" — tie: returns the first argument (a)
```
