# Inheritance & Polymorphism

## What you'll learn

Building on classes (lesson 1): C++ inheritance wires a derived class to a base class with `:` syntax. Virtual functions enable dynamic dispatch — the method that actually runs is chosen at runtime based on the object's real type, not the type of the pointer or reference you're holding. This is the foundation of runtime polymorphism in C++, and the model every OOP language you already know shares in some form.

## Key concepts

**Basic inheritance:**
```cpp
class Animal {
public:
    virtual std::string speak() const = 0;  // pure virtual — abstract
    virtual ~Animal() = default;            // always virtual in a base class
};

class Dog : public Animal {
public:
    std::string speak() const override { return "Woof"; }
};
```

**`virtual` and `override`:** mark a function `virtual` in the base class to enable dynamic dispatch. Always add `override` in derived classes — the compiler then verifies the signature actually matches a virtual function in the base, catching typos (`Area()` vs `area()`) that would otherwise silently create an unrelated new method.

**Pure virtual (`= 0`) and abstract classes:** a class with at least one pure virtual function cannot be instantiated directly — `Shape s;` is a compile error if `Shape::area()` is pure virtual. It exists only to define an interface that concrete subclasses implement.

**`final`:** prevents further derivation (`class Foo final`) or further overriding (`void bar() final`).

**Virtual destructor:** without a virtual destructor, deleting a derived object through a base pointer (`Animal* a = new Dog(); delete a;`) is undefined behavior — the derived part of the destructor never runs, leaking any resources it owned. Rule: if a class has *any* virtual function, its destructor must also be virtual.

**Object slicing:** assigning a derived object to a base object *by value* copies only the base portion — the derived data and its overrides are gone:
```cpp
Dog d;
Animal a = d;    // sliced — a is a plain Animal now, not a Dog
Animal& ref = d; // fine — ref.speak() still dispatches to Dog::speak()
```
Always pass and store polymorphic types through pointers or references, never by value.

**`dynamic_cast`:** downcasts a base pointer/reference to a derived type at runtime. Returns `nullptr` for a pointer (or throws `std::bad_cast` for a reference) if the object isn't actually that derived type.

**vs C / Java:** C has no language support for this at all — you'd hand-roll a vtable with function pointers in a struct. Java makes every instance method virtual by default (you opt out with `final`); C++ requires the explicit `virtual` opt-in, and inherits the object-slicing hazard that Java's reference-only object model never has.

## Watch out

- **A missing virtual destructor is a silent resource leak**, not a compile error — `delete` through a base pointer runs, the program doesn't crash, but the derived destructor (and anything it would have cleaned up) simply never executes.
- **Object slicing compiles cleanly and produces wrong behavior**, not a crash. `Animal a = someDog;` is completely legal C++; it just silently discards everything that made `someDog` a `Dog`.
- **Forgetting `override`** on a derived method that doesn't actually match the base signature (wrong parameter types, missing `const`) creates a brand new, unrelated method instead of overriding — the base version keeps getting called through polymorphism, and there's no compiler error to warn you.

## The task

Implement a small shape hierarchy in `stub.cpp`.

**`class Shape`** — abstract base class with:
- pure virtual `double area() const`
- pure virtual `std::string name() const`
- a virtual destructor

**`class Circle : public Shape`** — constructed from `Circle(double radius)`. `area()` returns `M_PI * radius * radius`. `name()` returns `"Circle"`.

**`class Rectangle : public Shape`** — constructed from `Rectangle(double w, double h)`. `area()` returns `w * h`. `name()` returns `"Rectangle"`.

**`double totalArea(const std::vector<Shape*>& shapes)`** — sums `area()` across every shape in the vector via dynamic dispatch.

**`std::string largestName(const std::vector<Shape*>& shapes)`** — returns `name()` of the shape with the greatest `area()`. Assume `shapes` is non-empty.

```cpp
Circle    c(3.0);   // area = π·9 ≈ 28.274
Rectangle r(4.0, 5.0); // area = 20.0

c.name();          // "Circle"
r.name();          // "Rectangle"

std::vector<Shape*> shapes = {&c, &r};
totalArea(shapes);    // ≈ 48.274  (c.area() + r.area())
largestName(shapes);  // "Circle" — 28.274 > 20.0

// Dynamic dispatch through a base pointer:
Shape* s = new Circle(2.0);
s->area();   // π·4 ≈ 12.566 — calls Circle::area, not a generic Shape::area
s->name();   // "Circle"
delete s;    // ~Shape must be virtual, or ~Circle never runs
```
