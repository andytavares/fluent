# Classes & Objects

## What you'll learn

Java is a class-based, object-oriented language. Every piece of code lives inside a class. A class defines fields (data) and methods (behavior). Access modifiers (`public`, `private`, `protected`) control what is visible from outside the class. This is the foundation the rest of the track builds on.

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

## Watch out

- **`==` on objects compares references, not content.** Two `Rectangle` instances with identical fields are `==`-unequal unless you override `equals()`. This task only compares primitive `double`s, so `==` is fine there — but remember the distinction the moment you work with objects.
- **Forgetting to override `toString()`** leaves you with Java's default: `Solution$Rectangle@1b6d3586` — the class name plus a hash code, useless for debugging.
- **Double formatting:** string-concatenating a `double` prints its full decimal form — `3.0`, not `3`. `"Rectangle(width=" + 3.0 + ")"` produces `"Rectangle(width=3.0)"`, not `"Rectangle(width=3)"`. Match this exactly when building strings from doubles.

## The task

You're modeling a 2D rectangle as a Java class inside `Solution.java`. Implement the nested class `Rectangle`:

**Constructor `Rectangle(double width, double height)`** — stores both dimensions.

**`double getArea()`** — returns `width * height`.

**`double getPerimeter()`** — returns `2 * (width + height)`.

**`boolean isSquare()`** — returns `true` when `width` equals `height`.

**`String toString()`** — returns `"Rectangle(width=W, height=H)"` where `W` and `H` are the numeric field values printed as Java prints a `double` (e.g. `3.0`, not `3`).

```java
Rectangle r1 = new Rectangle(3, 4);
r1.getArea();        // 12.0
r1.getPerimeter();    // 14.0
r1.isSquare();        // false
r1.toString();        // "Rectangle(width=3.0, height=4.0)"

Rectangle r2 = new Rectangle(5, 5);
r2.isSquare();        // true — equal dimensions
r2.toString();        // "Rectangle(width=5.0, height=5.0)"

Rectangle r3 = new Rectangle(0, 7);
r3.getArea();         // 0.0   — zero width is a valid edge case
r3.getPerimeter();    // 14.0
r3.isSquare();        // false
```
