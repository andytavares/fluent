## What you build

You write an abstract `Shape` class with two subclasses, a method that adds their areas and a method that names their type. Inheritance shares an implementation, and interfaces share a contract. This lesson builds on **Interfaces**.

## Key concepts

### A class extends one parent

Java has single-class inheritance: a class extends exactly one parent. Inheritance, method overriding and runtime dispatch are the base of Java's classical OOP model.

```java
public class Animal {
    private final String name;

    public Animal(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String speak() { return "..."; }
}
```

### `super(...)` calls the parent constructor

Before Java 25, `super(...)` must be the first statement in the constructor. Java 25 allows statements before it that do not use `this`. When you leave out `super(...)` and the parent has no no-argument constructor, the code does not compile.

```java
public class Dog extends Animal {
    private final String breed;

    public Dog(String name, String breed) {
        super(name);
        this.breed = breed;
    }

    @Override
    public String speak() {
        return "Woof";
    }
}
```

### Always write `@Override`

Without the annotation, a typo in the method name creates a new method and overrides nothing. With `@Override`, the compiler reports the error.

```java
// Compile error: no speek() to override
@Override
public String speek() { return "Woof"; }
```

### An abstract class shares code and forces gaps

You cannot create an instance of an abstract class. Subclasses must implement each abstract method and inherit each concrete method as it is.

```java
public abstract class Shape {
    // Subclasses must implement
    public abstract double area();

    // Inherited as it is
    public String describe() {
        return "Shape with area "
            + area();
    }
}
```

### The runtime type picks the method

The runtime type decides which method runs. The reference type decides which methods the compiler lets you call. An upcast to a parent type is always safe.

```java
// Upcast
Animal a = new Dog("Rex", "Lab");
// Runs Dog.speak()
a.speak();

// Pattern matching, Java 16+
if (a instanceof Dog d) {
    System.out.println(d.getBreed());
}
```

### Java methods are virtual by default

C++ needs `virtual` for runtime dispatch, Python has no compiler check on overrides and Go has no inheritance, only embedding and interfaces. In Java, every method that is not `static`, `final` or `private` uses runtime dispatch.

```java
Animal a = new Dog("Rex", "Lab");
a.speak();  // "Woof"
```

## Watch out

- Do not call an overridable method from a constructor.
- If `Animal`'s constructor calls `speak()`, `Dog`'s override runs before `Dog` sets its own fields.
- That override then sees default values such as `0` and `null`.
- `instanceof` pattern matching narrows the type only inside the `if` block.
- It also narrows after a `return` or `continue` that ends the negative branch. Elsewhere, the original type applies.
- A class can extend one abstract class but implement many interfaces.
- Use an abstract class only when subclasses share fields or method code, not only a signature.

## The task

Model shapes with a shared abstract base class, because they share a concrete `describe()` method. Write these types and methods inside the class `Solution`.

1. Abstract class `Shape` has an abstract `double area()`.
2. `Shape` has a concrete `String describe()` that returns `"Shape with area <area>"`.
3. `describe()` formats `<area>` with exactly 2 decimal places, for example `"Shape with area 12.00"`.
4. `Circle extends Shape` has the constructor `Circle(double radius)`.
5. `Circle.area()` returns `Math.PI * radius * radius`.
6. `Rectangle extends Shape` has the constructor `Rectangle(double width, double height)`.
7. `Rectangle.area()` returns `width * height`.
8. `static double totalArea(Shape[] shapes)` returns the sum of `area()` over the array.
9. `static String classifyShape(Shape s)` uses `instanceof` pattern matching.
10. `classifyShape` returns `"circle"` for a `Circle` and `"rectangle"` for a `Rectangle`.
11. For any other `Shape`, `classifyShape` returns `"unknown"`.

An empty array gives a total area of `0.0`.

```java
Shape c = new Circle(5);
Shape r = new Rectangle(3, 4);

c.area();      // ~78.5398
// "Shape with area 78.54"
c.describe();

r.area();      // 12.0
// "Shape with area 12.00"
r.describe();

// Polymorphic dispatch: ~3.14159
new Circle(1).area();

// ~90.5398
totalArea(new Shape[]{ c, r });
// 0.0
totalArea(new Shape[]{});

classifyShape(c);  // "circle"
classifyShape(r);  // "rectangle"
```
