# Interfaces

## What you'll learn

A Java interface defines a contract — a set of method signatures that implementing classes must provide. Interfaces enable polymorphism: code written against an interface works with any implementation.

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

**vs other languages:** Java interfaces are nominal — a class must explicitly `implements` an interface. TypeScript and Go use structural typing (duck typing), where compatibility is inferred from the shape of the type.

## The task

Implement two classes that both implement the `Shape` interface (defined in `Solution.java`):

- `Circle(double radius)` — area: `π * r²`, perimeter: `2πr`, name: `"Circle"`
- `Rectangle(double width, double height)` — area: `w * h`, perimeter: `2(w+h)`, name: `"Rectangle"`

Also implement the utility method:
- `static Shape larger(Shape a, Shape b)` — returns whichever shape has the larger area (return `a` if equal)
