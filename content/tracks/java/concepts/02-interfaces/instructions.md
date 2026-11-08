## What you build

You write two classes, `Circle` and `Rectangle`, that implement one `Shape` interface, and a method that compares any two shapes. This lesson builds on **Classes & Objects**.

## Key concepts

### An interface is a contract

An interface lists method signatures that each implementing class must supply. It has no state of its own.

```java
public interface Shape {
    double area();
    double perimeter();
    String name();
}
```

### A class implements the interface

The class writes `implements Shape` and gives a body to each method. `@Override` makes the compiler check the signature.

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

### Interfaces give polymorphism

Code written against an interface works with any implementation, also with implementations that do not exist yet.

```java
Shape s = new Circle(5);
// Works for every Shape
double a = s.area();
```

### A class can implement many interfaces

A class can extend only one parent class, but it can implement many interfaces.

```java
public class Square
    implements Shape, Comparable<Square> {
    // ...
}
```

### Default methods

Since Java 8, an interface can give a method a default body. You can then add a method to an interface and existing implementations still compile.

```java
interface Shape {
    double area();
    String name();

    default String describe() {
        return name() + " with area "
            + area();
    }
}
```

### Java interfaces are nominal

A class matches an interface only when it writes `implements`. TypeScript and Go use structural typing instead, where the shape of the type alone decides the match.

```java
// Compile error: Box does not say
// "implements Shape"
Shape s = new Box();
```

## Watch out

- A variable of the interface type shows only the interface methods.
- After `Shape s = new Circle(5);`, `s.getRadius()` does not compile. Cast to `Circle` first.
- Two interfaces with the same default method cause a conflict. The compiler makes you override the method and choose.
- Classes use `implements` for interfaces and `extends` for one superclass.
- Interfaces use `extends` to inherit from other interfaces. A mix-up is a compile error.

## The task

The class `Solution` already defines a `Shape` interface. Write two shapes that implement it, so a caller can compare shapes without their concrete type.

1. `Circle(double radius)`: `area()` returns `π * r²`.
2. `Circle`: `perimeter()` returns `2πr`, and `name()` returns `"Circle"`.
3. `Rectangle(double width, double height)`: `area()` returns `w * h`.
4. `Rectangle`: `perimeter()` returns `2(w + h)`, and `name()` returns `"Rectangle"`.
5. `static Shape larger(Shape a, Shape b)` returns the shape with the larger area.

When the areas are equal, `larger` returns `a`. The order of the arguments does not change which larger shape wins.

```java
Shape c = new Circle(5);
Shape r = new Rectangle(4, 6);

c.area();       // ~78.54 (π * 25)
c.perimeter();  // ~31.42 (2π * 5)
c.name();       // "Circle"

r.area();       // 24.0
r.perimeter();  // 20.0
r.name();       // "Rectangle"

Shape big   = new Circle(10);
Shape small = new Rectangle(1, 1);
larger(big, small).name();  // "Circle"
larger(small, big).name();  // "Circle"
// Tie: returns a, the same object
larger(small, small);       // small
```
