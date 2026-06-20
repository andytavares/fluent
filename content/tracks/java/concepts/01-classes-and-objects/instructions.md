# Classes & Objects

## What you'll learn

Java is a class-based, object-oriented language. Every piece of code lives inside a class. A class defines fields (data) and methods (behavior). Access modifiers (`public`, `private`, `protected`) control what is visible from outside the class.

## Key concepts

**Defining a class:**
```java
public class Circle {
    private final double radius;  // private field, immutable after construction

    public Circle(double radius) {
        this.radius = radius;      // constructor
    }

    public double area() {
        return Math.PI * radius * radius;
    }
}
```

**Constructors** have the same name as the class and no return type. Use `this.field = value` when parameter names shadow field names.

**`final` fields** can only be assigned once — either at declaration or in the constructor. Prefer `final` for fields that represent intrinsic, unchanging properties of an object.

**toString:** Override `Object.toString()` to produce a human-readable representation — very useful for logging and debugging.
```java
@Override
public String toString() {
    return "Circle(radius=" + radius + ")";
}
```

**vs other languages:** Java objects always live on the heap and are accessed through references. There is no stack-allocated object syntax. The JVM's garbage collector handles deallocation — you never call `free` or `delete`.

## The task

Implement the `Rectangle` class inside `Solution.java`:
- Constructor `Rectangle(double width, double height)`
- `double getArea()` — returns `width * height`
- `double getPerimeter()` — returns `2 * (width + height)`
- `boolean isSquare()` — returns `true` if width equals height
- `String toString()` — returns `"Rectangle(width=W, height=H)"` where W and H are the numeric values (e.g. `"Rectangle(width=3.0, height=4.0)"`)
