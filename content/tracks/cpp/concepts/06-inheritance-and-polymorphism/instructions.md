# Inheritance & Polymorphism

## What you'll learn

C++ inheritance wires derived classes to base classes with the `:` syntax. Virtual functions enable dynamic dispatch — the right method is selected at runtime based on the actual object type, not the pointer type. This is the foundation of runtime polymorphism in C++.

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

**`virtual` and `override`:** Mark a function `virtual` in the base class to enable dynamic dispatch. Always use `override` in derived classes — it catches typos and signature mismatches at compile time.

**Pure virtual (`= 0`) and abstract classes:** A class with at least one pure virtual function cannot be instantiated directly. It exists only to define an interface.

**`final`:** Prevents further derivation (`class Foo final`) or overriding (`void bar() final`).

**Virtual destructor:** Without a virtual destructor, deleting a derived object through a base pointer is undefined behavior — the derived destructor never runs. Rule: if a class has any virtual function, its destructor must also be virtual.

**Object slicing:** Assigning a derived object to a base object *by value* loses the derived data. Always use pointers or references for polymorphism:
```cpp
Dog d;
Animal a = d;  // sliced — speak() now calls... nothing useful
Animal& ref = d;  // fine — ref.speak() dispatches correctly
```

**`dynamic_cast`:** Downcasts a base pointer/reference to a derived type at runtime. Returns `nullptr` (pointer) or throws `std::bad_cast` (reference) on failure.

**vs C / Java:** C requires function pointers in structs to simulate vtables manually. Java makes all instance methods virtual by default; C++ requires an explicit `virtual` keyword. C++ also adds the object-slicing hazard that Java (reference semantics throughout) never has.

## The task

Implement the following hierarchy:

- Abstract base class `Shape` with a pure virtual `double area() const` and a pure virtual `std::string name() const`. Give it a virtual destructor.
- `Circle` derived from `Shape`: constructor takes `double radius`; `area()` returns `M_PI * r * r`; `name()` returns `"Circle"`.
- `Rectangle` derived from `Shape`: constructor takes `double w, double h`; `area()` returns `w * h`; `name()` returns `"Rectangle"`.
- Free function `double totalArea(const std::vector<Shape*>& shapes)` that sums `area()` across all shapes via dynamic dispatch.
- Free function `std::string largestName(const std::vector<Shape*>& shapes)` that returns the `name()` of the shape with the greatest `area()`. Assume the vector is non-empty.
