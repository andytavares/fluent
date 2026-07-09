# Classes & Objects

## What you'll learn

C++ classes bundle data (member variables) and behavior (member functions) into a single unit, the same way classes work in Java, C#, Python, or Ruby. What's different is *where objects live*: C++ objects are value types by default — they can live on the stack, get copied on assignment, and are destroyed deterministically when they go out of scope. This lesson covers class syntax, access control, and constructor initialization; later lessons build on it for inheritance (06), move semantics (07), and RAII (10).

## Key concepts

**Defining a class:**
```cpp
class Circle {
public:
    double radius;

    Circle(double r) : radius(r) {}  // constructor with initializer list

    double area() const {
        return 3.14159 * radius * radius;
    }
};
```

**Constructor initializer list** (`: radius(r)`) is preferred over assignment in the body — it initializes the member directly rather than default-constructing it and then assigning. For members without default constructors (references, `const` fields, base classes), the initializer list is mandatory, not just a style preference.

**`const` member functions** promise not to modify the object. A method that only reads state should be `const` — otherwise you can't call it on a `const Circle&` or a `const` object at all.

**Encapsulation — prefer private data:**
```cpp
class Circle {
private:
    double radius_;
public:
    explicit Circle(double r) : radius_(r) {}
    double radius() const { return radius_; }
    double area()   const { return 3.14159 * radius_ * radius_; }
};
```

`explicit` on a single-argument constructor blocks implicit conversions — without it, a function expecting a `Circle` would silently accept a bare `double`.

**`struct` vs `class`:** Identical in C++ except for default access — `struct` members are `public` by default, `class` members are `private` by default. Convention: `struct` for plain data bags, `class` when you have invariants to protect.

**vs other languages:** Unlike Java/C#, C++ objects can live on the stack (`Circle c(5.0);`) and are copied by value by default — assigning one object to another copies every member. There's no garbage collector; an object's destructor runs the instant it goes out of scope. Also, C++ has no `interface` keyword — pure virtual classes serve that role (see lesson 06).

## Watch out

- **Members initialize in declaration order, not initializer-list order.** `Rectangle(double w, double h) : height(h), width(w) {}` still initializes `width` before `height` if `width` is declared first in the class body — regardless of how the initializer list is written. Compilers warn (`-Wreorder`) but still compile it that way.
- **Default access differs by keyword.** Forgetting that `class` defaults to `private` is a common source of "why can't I access this member" compile errors when translating a `struct`-heavy design from C.
- **Forgetting `const` on read-only methods** prevents callers from using your type through a `const Type&` parameter — a surprisingly common source of build breaks when a type is used in a generic algorithm that takes objects by `const` reference.

## The task

Implement a `Rectangle` class (in `stub.cpp`) that models a rectangle by its width and height.

**Constructor:** `Rectangle(double width, double height)` — stores both dimensions as public members `width` and `height`.

**`double area() const`** — returns `width * height`.

**`double perimeter() const`** — returns `2 * (width + height)`.

**`bool isSquare() const`** — returns `true` if `width` equals `height` exactly.

```cpp
Rectangle r(3.0, 4.0);
r.area();       // 12.0
r.perimeter();  // 14.0
r.isSquare();   // false

Rectangle sq(5.0, 5.0);
sq.area();      // 25.0
sq.isSquare();  // true

Rectangle degenerate(1.0, 0.0);
degenerate.area();      // 0.0
degenerate.perimeter(); // 2.0
degenerate.isSquare();  // false
```
