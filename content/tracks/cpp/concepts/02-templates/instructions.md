## What you build

You write a generic `clamp` function and a generic `Stack` class. Templates are compile-time generics: the compiler writes a concrete version for each type you use. This lesson builds on **Classes & Objects**.

## Key concepts

### A function template works for many types

The compiler deduces `T` from the arguments. It generates one concrete function for each distinct type. The result has zero runtime cost.

```cpp
template <typename T>
T largest(T a, T b) {
    return a > b ? a : b;
}

largest(3, 5);       // T = int
largest(3.14, 2.72); // T = double
largest('a', 'z');   // T = char
```

### A class template takes the type in angle brackets

You name the type when you create the object.

```cpp
template <typename T>
class Box {
public:
    explicit Box(T value)
        : value_(value) {}
    T get() const { return value_; }
private:
    T value_;
};

Box<int>    intBox(42);
Box<string> strBox("hello");
```

### A template can take more than one type

List each parameter, separated by commas.

```cpp
template <typename K, typename V>
struct Pair {
    K first;
    V second;
};
```

### `typename` and `class` mean the same here

In a template parameter list, both keywords declare a type parameter. Modern code uses `typename`. `class` looks like it requires a class type, but any type works, including `int` or `char`.

```cpp
// Both accept int, char or a class
template <typename T> T f(T x);
template <class T>    T g(T x);
```

### Errors appear on use, not on definition

The compiler checks a template body against a type only when it instantiates the template. The error then comes as a long template-instantiation backtrace.

```cpp
template <typename T>
T bad(T x) {
    return x.nonexistent_method();
}
// Compiles until a call:
// bad(5);  // error
```

### Template definitions must be visible where you use them

Java generics use type erasure. C++ compiles each instantiation separately, with no runtime `Class<T>` object. So the full template code goes in a header, or in one translation unit as here. Do not split it into a `.cpp` file with only declarations in the header.

```cpp
// stack.h: declaration and body
template <typename T>
class Stack { /* full body */ };
```

## Watch out

- A template compiles on its own even if its body is wrong for some types. The error appears at the first call.
- A template body in a separate `.cpp` file gives linker errors at each call.

## The task

Write two generic building blocks in `stub.cpp`.

1. `template<typename T> T clamp(T value, T lo, T hi)` limits `value` to the closed range `[lo, hi]`.
2. If `value < lo`, `clamp` returns `lo`. If `value > hi`, it returns `hi`. Otherwise it returns `value`.
3. `clamp` works for any type with `<` and `>`, such as `int`, `double` and `char`.

`template<typename T> class Stack` is a LIFO container: the last value in is the first value out.

4. `void push(T value)` puts a value on the top.
5. `T pop()` removes the top value and returns it.
6. `T top() const` returns the top value. It does not remove it.
7. `bool empty() const` returns `true` if the stack has no elements.
8. `std::size_t size() const` returns the number of elements.

`pop()` and `top()` on an empty stack throw `std::underflow_error`.

```cpp
clamp(-5, 0, 10);     // 0
clamp(15, 0, 10);     // 10
clamp(5, 0, 10);      // 5
clamp(1.5, 0.0, 1.0); // 1.0
clamp('z', 'a', 'm'); // 'm'

Stack<int> s;
s.empty();  // true
s.size();   // 0
s.push(10);
s.push(20);
s.push(30);
s.size();   // 3
s.top();    // 30
s.pop();    // 30
s.size();   // 2
s.top();    // 20
s.pop();
s.pop();
s.empty();  // true
s.pop();    // throws std::underflow_error
s.top();    // throws std::underflow_error

Stack<std::string> ss;
ss.push("hello");
ss.push("world");
ss.top();   // "world"
ss.pop();   // "world"
ss.size();  // 1
```
