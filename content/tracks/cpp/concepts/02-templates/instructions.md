# Templates

## What you'll learn

Templates are C++'s compile-time generics. A function or class template is parameterized over one or more type parameters. The compiler generates a concrete instantiation for each distinct type you use — zero runtime cost.

## Key concepts

**Function template:**
```cpp
template <typename T>
T max(T a, T b) {
    return a > b ? a : b;
}

max(3, 5);         // T = int
max(3.14, 2.72);   // T = double
max('a', 'z');     // T = char
```

**Class template:**
```cpp
template <typename T>
class Box {
public:
    explicit Box(T value) : value_(value) {}
    T get() const { return value_; }
private:
    T value_;
};

Box<int>    intBox(42);
Box<string> strBox("hello");
```

**Template with multiple parameters:**
```cpp
template <typename K, typename V>
struct Pair {
    K first;
    V second;
};
```

**`typename` vs `class`** in template parameter lists are interchangeable for type parameters. `typename` is preferred in modern code — `class` can be confused with requiring a class type.

**vs other languages:** Unlike Java generics, C++ templates are truly compiled for each type — there is no type erasure. This means you get maximum performance but also that all template code must be visible at the point of instantiation (usually in headers, not .cpp files).

## The task

Implement:
- `template<typename T> T clamp(T value, T lo, T hi)` — return value clamped to `[lo, hi]`
- `template<typename T> class Stack` with:
  - `void push(T value)` — pushes a value onto the top
  - `T pop()` — removes and returns the top value
  - `T top() const` — returns the top value without removing it
  - `bool empty() const` — returns true if the stack has no elements
  - `std::size_t size() const` — returns the number of elements
