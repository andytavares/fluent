## What you build

You write a `Rectangle` class with `area()`, `perimeter()` and `isSquare()` member functions. A class bundles data and the functions that use it, as in Java, C#, Python or Ruby.

## Key concepts

### A class holds member variables and member functions

Member variables hold the data. Member functions hold the behavior. A constructor sets up a new object.

```cpp
class Circle {
public:
    double radius;

    Circle(double r) : radius(r) {}

    double area() const {
        return 3.14159 * radius * radius;
    }
};
```

### C++ objects are values

An object can live on the stack: `Circle c(5.0);`. Assignment copies every member. C++ has no garbage collector. The destructor runs at the moment the object goes out of scope.

```cpp
Circle a(1.0);
// b is a full copy of a
Circle b = a;
b.radius = 2.0;
// a.radius is still 1.0
```

### The initializer list sets members directly

The list after the colon (`: radius(r)`) initializes each member directly. Assignment in the body first default-constructs the member, then assigns it. Use the list.

A reference member, a `const` member, a base class or a member with no default constructor must use the list.

```cpp
class Account {
    const int id_;
public:
    // id_ = id; in the body: compile error
    Account(int id) : id_(id) {}
};
```

### A `const` member function does not change the object

Mark each function that only reads state as `const`. You cannot call a function without `const` on a `const Circle&` or on a `const` object.

```cpp
void print(const Circle& c) {
    // Compiles only if area() is const
    std::cout << c.area();
}
```

### Keep data private and use `explicit`

Private data lets the class protect its rules. `explicit` on a constructor with one argument blocks implicit conversions. Without it, a function that takes a `Circle` accepts a bare `double`.

```cpp
class Circle {
private:
    double radius_;
public:
    explicit Circle(double r)
        : radius_(r) {}
    double radius() const {
        return radius_;
    }
    double area() const {
        return 3.14159 * radius_ * radius_;
    }
};
```

### `struct` and `class` differ only in default access

`struct` members are `public` by default. `class` members are `private` by default. Use `struct` for plain data and `class` when the type has rules to protect. C++ has no `interface` keyword; a class with only pure virtual functions does that job.

```cpp
struct Point {
    // public by default
    int x, y;
};

class Counter {
    // private by default
    int count_ = 0;
};
```

## Watch out

- Members initialize in declaration order, not in initializer-list order. `-Wreorder` warns, but the code still compiles.
- In `Rectangle(double w, double h) : height(h), width(w) {}`, `width` initializes first if the class declares it first.
- `class` defaults to `private`. Code ported from a C `struct` then fails with "member is private" errors.
- A read-only function without `const` breaks callers that take `const Type&`. Generic algorithms often take objects that way.

## The task

Write a `Rectangle` class in `stub.cpp`. It models a rectangle by its width and height.

1. `Rectangle(double width, double height)` stores both values in the public members `width` and `height`.
2. `double area() const` returns `width * height`.
3. `double perimeter() const` returns `2 * (width + height)`.
4. `bool isSquare() const` returns `true` only if `width` equals `height` exactly.

A width or height of zero is valid. A 1 × 0 rectangle has area 0 and perimeter 2.

```cpp
Rectangle r(3.0, 4.0);
r.area();       // 12.0
r.perimeter();  // 14.0
r.isSquare();   // false

Rectangle sq(5.0, 5.0);
sq.area();      // 25.0
sq.perimeter(); // 20.0
sq.isSquare();  // true

Rectangle d(1.0, 0.0);
d.area();       // 0.0
d.perimeter();  // 2.0
d.isSquare();   // false
```
