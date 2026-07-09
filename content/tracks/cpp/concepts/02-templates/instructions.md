# Templates

## What you'll learn

Building on the `Rectangle` class from lesson 1: templates are C++'s compile-time generics. A function or class template is parameterized over one or more type parameters, and the compiler generates a concrete instantiation for each distinct type you actually use — zero runtime cost, unlike Java's type-erased generics or Python's duck typing.

## Key concepts

**Function template:**
```cpp
template <typename T>
T largest(T a, T b) {
    return a > b ? a : b;
}

largest(3, 5);         // T = int
largest(3.14, 2.72);   // T = double
largest('a', 'z');     // T = char
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

**`typename` vs `class`** in a template parameter list are interchangeable for type parameters. `typename` is preferred in modern code — `class` can be misread as requiring a class type, when any type (including `int` or `char`) works.

**Errors on use, not definition:** A template's body isn't checked against a specific type until it's instantiated. `template<typename T> T bad(T x) { return x.nonexistent_method(); }` compiles fine on its own — the error only appears (as a wall of template-instantiation backtrace) when someone calls `bad(5)`.

**vs other languages:** Unlike Java generics, C++ templates are compiled separately for each type — there is no type erasure and no runtime `Class<T>` object. This means maximum performance but also that template definitions must be visible at the point of instantiation — in practice, template code lives in headers (or, as here, a single translation unit), not split into a `.cpp` with only declarations.

## The task

Implement two generic building blocks in `stub.cpp`.

**`template<typename T> T clamp(T value, T lo, T hi)`** — returns `value` restricted to the closed range `[lo, hi]`: if `value < lo`, return `lo`; if `value > hi`, return `hi`; otherwise return `value` unchanged. Works for any type supporting `<` and `>` (`int`, `double`, `char`, ...).

```cpp
clamp(15, 0, 10);       // 10  — above hi
clamp(-5, 0, 10);       // 0   — below lo
clamp(5, 0, 10);        // 5   — already in range
clamp(1.5, 0.0, 1.0);   // 1.0
clamp('z', 'a', 'm');   // 'm'
```

**`template<typename T> class Stack`** — a LIFO (last-in, first-out) container:

- `void push(T value)` — pushes a value onto the top.
- `T pop()` — removes and returns the top value. Throws `std::underflow_error` if the stack is empty.
- `T top() const` — returns the top value without removing it. Throws `std::underflow_error` if the stack is empty.
- `bool empty() const` — returns `true` if the stack has no elements.
- `std::size_t size() const` — returns the number of elements currently stored.

```cpp
Stack<int> s;
s.empty();       // true
s.push(1);
s.push(2);
s.push(3);
s.size();        // 3
s.top();         // 3   — top does not remove
s.pop();         // 3   — pop removes and returns
s.size();        // 2
s.pop(); s.pop();
s.empty();       // true
s.pop();         // throws std::underflow_error — nothing left

Stack<std::string> ss;
ss.push("hello");
ss.push("world");
ss.top();        // "world"
```
