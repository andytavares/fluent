# Inheritance & Polymorphism

## What you'll learn

Java supports single-class inheritance: one class extends exactly one parent. Interfaces handle multiple-type contracts (covered in concept 02). The combination of inheritance, method overriding, and runtime dispatch is the backbone of Java's classical OOP model.

## Key concepts

**extends and constructor chaining:**
```java
public class Animal {
    private final String name;
    public Animal(String name) { this.name = name; }
    public String getName() { return name; }
    public String speak() { return "..."; }
}

public class Dog extends Animal {
    private final String breed;
    public Dog(String name, String breed) {
        super(name);        // must be first statement in constructor
        this.breed = breed;
    }

    @Override
    public String speak() { return "Woof"; }
}
```

`super(...)` invokes the parent constructor. If you omit it and the parent has no no-arg constructor, the code won't compile.

**@Override:**
Always annotate overridden methods. Without it, a typo silently creates a new method instead of overriding — the annotation makes the compiler catch that.

**Abstract classes:**
```java
public abstract class Shape {
    public abstract double area();           // subclasses must implement
    public String describe() {               // concrete method — inherited as-is
        return "Shape with area " + area();
    }
}
```
An abstract class cannot be instantiated directly. Use it when you want to share implementation across subclasses while forcing them to fill in specific behavior.

**Polymorphism and casting:**
```java
Animal a = new Dog("Rex", "Lab");  // upcast — always safe
a.speak();                          // calls Dog.speak() at runtime

if (a instanceof Dog d) {           // pattern matching (Java 16+)
    System.out.println(d.getBreed());
}
```
The runtime type governs which method runs. The reference type governs what the compiler allows you to call.

**vs other languages:** C++ requires `virtual` to opt into runtime dispatch — non-virtual methods are resolved at compile time. Java methods are virtual by default. Python has no formal syntax for overriding; `super()` works similarly but without compiler enforcement. Go does not have inheritance at all — it uses embedding and interface satisfaction instead.

## The task

Implement the following inside `Solution.java`:

- Abstract class `Shape` with abstract `double area()` and concrete `String describe()` returning `"Shape with area <area>"` (formatted to 2 decimal places)
- Class `Circle extends Shape` — constructor `Circle(double radius)`, overrides `area()` returning `Math.PI * radius * radius`
- Class `Rectangle extends Shape` — constructor `Rectangle(double width, double height)`, overrides `area()` returning `width * height`
- Static method `double totalArea(Shape[] shapes)` — sums the area of all shapes in the array
- Static method `String classifyShape(Shape s)` — uses `instanceof` pattern matching to return `"circle"`, `"rectangle"`, or `"unknown"`
