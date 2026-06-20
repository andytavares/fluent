# Classes & Objects

## What you'll learn

C++ classes bundle data (member variables) and behavior (member functions) into a single unit. Access specifiers control visibility: `public` members are accessible from anywhere; `private` members only from within the class.

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

**Constructor initializer list** (`: radius(r)`) is preferred over assignment in the body — it initializes directly rather than default-constructing then assigning.

**`const` member functions** promise not to modify the object. Prefer `const` for any method that only reads state.

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

**vs other languages:** Unlike Java/C#, C++ objects can live on the stack (`Circle c(5.0);`) and are copied by value by default. No garbage collector — RAII governs lifetime (more on that in the smart-pointers concept).

## The task

Implement the `Rectangle` class with:
- A constructor `Rectangle(double width, double height)`
- `double area() const` — returns `width * height`
- `double perimeter() const` — returns `2 * (width + height)`
- `bool isSquare() const` — returns `true` if width equals height
