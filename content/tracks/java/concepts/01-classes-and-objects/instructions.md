## What you build

You write a `Rectangle` class with a constructor, three methods and a `toString()` override. Java is a class-based, object-oriented language, and all code lives inside a class.

## Key concepts

### A class holds fields and methods

Fields hold the data and methods hold the behavior. Access modifiers (`public`, `private`, `protected`) control what code outside the class can see.

```java
public class Circle {
    // Private; fixed after construction
    private final double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    public double area() {
        return Math.PI * radius * radius;
    }
}
```

### A constructor has the class name and no return type

When a parameter name shadows a field name, write `this.field = value` to set the field.

```java
public Circle(double radius) {
    this.radius = radius;
}
```

### A `final` field gets one assignment

You assign a `final` field once: at its declaration or in the constructor. Use `final` for properties of the object that do not change.

```java
private final double radius;
```

### `toString()` gives a readable form

Override `Object.toString()` to return a readable description of the object. It helps with logging and debugging.

```java
@Override
public String toString() {
    return "Circle(radius=" + radius + ")";
}
```

### Objects live on the heap

You reach every Java object through a reference, and Java has no syntax for objects on the stack. The garbage collector frees memory, so you never call `free` or `delete`.

```java
Circle c = new Circle(2.0);
// c holds a reference, not the object
```

## Watch out

- `==` on objects compares references, not content. Two equal-looking objects are not `==` unless they are the same object.
- This task compares only primitive `double` values, so `==` is correct there.
- Without a `toString()` override, Java prints the class name and a hash code, for example `Solution$Rectangle@1b6d3586`.
- String concatenation prints a `double` with its decimal part: `3.0`, not `3`.

## The task

Model a 2D rectangle. Write the nested class `Rectangle` inside the class `Solution`.

1. `Rectangle(double width, double height)` stores both dimensions.
2. `double getArea()` returns `width * height`.
3. `double getPerimeter()` returns `2 * (width + height)`.
4. `boolean isSquare()` returns `true` when `width` equals `height`.
5. `String toString()` returns `"Rectangle(width=W, height=H)"`.
6. `W` and `H` are the values as Java prints a `double`, for example `3.0`.

A zero width is valid and gives an area of `0.0`.

```java
Rectangle r1 = new Rectangle(3, 4);
r1.getArea();       // 12.0
r1.getPerimeter();  // 14.0
r1.isSquare();      // false
// "Rectangle(width=3.0, height=4.0)"
r1.toString();

Rectangle r2 = new Rectangle(5, 5);
r2.getArea();       // 25.0
r2.getPerimeter();  // 20.0
r2.isSquare();      // true
// "Rectangle(width=5.0, height=5.0)"
r2.toString();

Rectangle r3 = new Rectangle(0, 7);
r3.getArea();       // 0.0
r3.getPerimeter();  // 14.0
r3.isSquare();      // false
```
