## What you build

You write a shape hierarchy: an abstract `Shape`, a `Circle`, a `Rectangle`, and two functions that work on any shape. Virtual functions pick the method at runtime from the real type of the object. This lesson builds on **Lambda Expressions**.

## Key concepts

### A derived class inherits with `:`

`class Dog : public Animal` makes `Dog` a kind of `Animal`. A base class with virtual functions needs a virtual destructor.

```cpp
class Animal {
public:
    // Pure virtual: Animal is abstract
    virtual std::string speak() const = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    std::string speak() const override {
        return "Woof";
    }
};
```

### `virtual` enables dynamic dispatch

The function that runs depends on the real type of the object. The type of the pointer or reference does not decide it. Java makes every instance method virtual by default; C++ requires the explicit `virtual` keyword.

```cpp
Dog d;
Animal& a = d;
a.speak();  // "Woof": Dog::speak runs
```

### `override` makes the compiler check the signature

Add `override` to each function in a derived class that replaces a base function. The compiler then checks that a matching virtual function exists in the base. It catches typos such as `Area()` for `area()`.

```cpp
class Square : public Shape {
    // Compile error: no virtual Area()
    double Area() const override;
};
```

### A pure virtual function makes a class abstract

`= 0` declares a pure virtual function. You cannot create an object of a class with at least one. The class only defines an interface that concrete subclasses implement.

```cpp
// Compile error if Shape::area() is
// pure virtual
Shape s;
```

### `final` stops further derivation

`class Foo final` blocks derived classes. `void bar() final` blocks further overrides of `bar`.

```cpp
class Leaf final : public Shape { };
// Compile error
class Sub : public Leaf { };
```

### A base class with virtual functions needs a virtual destructor

Without it, `delete` through a base pointer is undefined behavior. The derived destructor never runs, and its resources leak. If a class has any virtual function, make its destructor virtual.

```cpp
Animal* a = new Dog();
// Runs ~Dog only if ~Animal is virtual
delete a;
```

### Copying by value slices the object

Assigning a derived object to a base object by value copies only the base part. The derived data and its overrides are gone. Pass and store polymorphic types through pointers or references. Java has no slicing, because Java objects are always references.

```cpp
Dog d;
// Sliced: a is a plain Animal
Animal a = d;
// Fine: ref.speak() calls Dog::speak()
Animal& ref = d;
```

### `dynamic_cast` checks a downcast at runtime

`dynamic_cast` converts a base pointer or reference to a derived type. If the object is not that type, a pointer cast returns `nullptr`. A reference cast throws `std::bad_cast`.

```cpp
Animal* a = new Dog();
if (Dog* d = dynamic_cast<Dog*>(a)) {
    d->speak();
}
```

C has no language support for any of this. In C, you write a table of function pointers in a struct by hand.

## Watch out

- A missing virtual destructor is not a compile error. The program runs, but the derived destructor never runs.
- `Animal a = someDog;` compiles. It discards everything that made `someDog` a `Dog`.
- A derived function with a different signature creates a new, unrelated function. Wrong parameter types or a missing `const` cause this.
- Without `override`, the compiler gives no error for that mistake. Calls through the base keep the base version.

## The task

Write a small shape hierarchy in `stub.cpp`. `M_PI` from `<cmath>` is π.

1. `class Shape` is an abstract base class. It declares the pure virtual functions `double area() const` and `std::string name() const`.
2. `Shape` has a virtual destructor.
3. `class Circle : public Shape` has the constructor `Circle(double radius)`.
4. `Circle::area()` returns `M_PI * radius * radius`. `Circle::name()` returns `"Circle"`.
5. `class Rectangle : public Shape` has the constructor `Rectangle(double w, double h)`.
6. `Rectangle::area()` returns `w * h`. `Rectangle::name()` returns `"Rectangle"`.
7. `double totalArea(const std::vector<Shape*>& shapes)` returns the sum of `area()` over all shapes.
8. `std::string largestName(const std::vector<Shape*>& shapes)` returns `name()` of the shape with the largest `area()`.

`shapes` is never empty for `largestName`.

```cpp
Circle(1.0).area();          // π
Circle(3.0).area();          // 9π
Circle(1.0).name();          // "Circle"
Rectangle(4.0, 5.0).area();  // 20.0
Rectangle(1.0, 1.0).area();  // 1.0
Rectangle(4.0, 5.0).name();  // "Rectangle"

Circle c2(2.0);
totalArea({&c2});            // 4π

Circle c(1.0);
Rectangle r(3.0, 3.0);
totalArea({&c, &r});         // π + 9.0

Rectangle big(10.0, 10.0);
largestName({&c, &big});     // "Rectangle"
Circle huge(10.0);
Rectangle one(1.0, 1.0);
largestName({&huge, &one});  // "Circle"

Shape* s = new Circle(2.0);
s->area();  // 4π: Circle::area runs
s->name();  // "Circle"
// ~Circle runs: ~Shape is virtual
delete s;
```
