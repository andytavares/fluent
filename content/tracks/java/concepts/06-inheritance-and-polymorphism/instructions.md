# Inheritance & Polymorphism

## What you'll learn

Building on interfaces (concept 2): Java supports single-class inheritance — one class extends exactly one parent. Interfaces handle multiple-type contracts; inheritance handles shared implementation. The combination of inheritance, method overriding, and runtime dispatch is the backbone of Java's classical OOP model.

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
Always annotate overridden methods. Without it, a typo silently creates a new overload instead of overriding — the annotation makes the compiler catch that.

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

## Watch out

- **Calling an overridable method from a constructor is a footgun.** If `Animal`'s constructor calls `speak()` and `Dog` overrides it, `Dog`'s override runs *before* `Dog`'s own fields are initialized — you can observe default values (`0`, `null`) for fields you'd expect to be set.
- **`instanceof` pattern matching narrows the type only inside the `if` block** (or after a `return`/`continue` that makes the negative branch unreachable) — outside that scope the variable reverts to the original static type.
- **Abstract classes vs interfaces:** a class can extend only one abstract class but can implement many interfaces. Reach for an abstract class only when subclasses genuinely share field state or method implementation, not just a method signature.

## The task

You're modeling shapes with a shared abstract base class instead of an interface, because they share a concrete `describe()` implementation. Implement the following inside `Solution.java`:

**Abstract class `Shape`** — abstract `double area()`; concrete `String describe()` returning `"Shape with area <area>"` where `<area>` is formatted to exactly 2 decimal places (e.g. `"Shape with area 12.00"`).

**`Circle extends Shape`** — constructor `Circle(double radius)`; overrides `area()` returning `Math.PI * radius * radius`.

**`Rectangle extends Shape`** — constructor `Rectangle(double width, double height)`; overrides `area()` returning `width * height`.

**`static double totalArea(Shape[] shapes)`** — sums `area()` across every element of the array; an empty array returns `0.0`.

**`static String classifyShape(Shape s)`** — uses `instanceof` pattern matching to return `"circle"` for a `Circle`, `"rectangle"` for a `Rectangle`, or `"unknown"` for any other `Shape`.

```java
Shape c = new Circle(5);
Shape r = new Rectangle(3, 4);

c.area();       // ~78.5398
c.describe();   // "Shape with area 78.54"

r.area();       // 12.0
r.describe();   // "Shape with area 12.00"

totalArea(new Shape[]{ c, r });  // ~90.5398
totalArea(new Shape[]{});        // 0.0

classifyShape(c);  // "circle"
classifyShape(r);  // "rectangle"
```
