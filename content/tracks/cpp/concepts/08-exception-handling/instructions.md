## What you build

You write a custom `ValueError` exception and three functions that throw or catch it. Exceptions send an error up the call stack without an error code in every return value. This lesson builds on **Move Semantics**.

## Key concepts

### Exceptions are for exceptional conditions

Use them for bugs, resource exhaustion and invalid states. Do not use them for routine control flow.

```cpp
// Good: the caller broke a rule
if (b == 0.0) {
    throw std::invalid_argument(
        "division by zero");
}
```

### `throw`, `try` and `catch`

`throw` sends an exception. The first `catch` block whose type matches receives it. `catch (...)` matches anything.

```cpp
#include <stdexcept>

double divide(double a, double b) {
    if (b == 0.0)
        throw std::invalid_argument(
            "division by zero");
    return a / b;
}

try {
    double result = divide(10, 0);
} catch (const std::invalid_argument& e) {
    std::cerr << "Error: " << e.what();
} catch (const std::exception& e) {
    // Any other std::exception
} catch (...) {
    // Anything: use rarely
}
```

### The standard exception hierarchy

- `std::exception` is the base class. Its `what()` returns a `const char*`.
- `std::runtime_error` is for errors that you can detect only at runtime.
- `std::logic_error` is for programming errors, such as `invalid_argument` and `out_of_range`.
- `std::bad_alloc` is what `new` throws when an allocation fails.

```cpp
try {
    std::vector<int> v(3);
    v.at(10);
} catch (const std::out_of_range& e) {
    // out_of_range is a logic_error
}
```

### A custom exception derives from a standard one

Pass the message to the base constructor, so `what()` returns it. Add your own members for extra data.

```cpp
class ParseError
    : public std::runtime_error {
public:
    ParseError(const std::string& msg,
               int line)
        : std::runtime_error(msg),
          line_(line) {}
    int line() const { return line_; }
private:
    int line_;
};
```

### `noexcept` marks a function that never throws

The compiler can optimize a `noexcept` function better. Mark move constructors `noexcept`: `std::vector` moves its elements on growth only when the move constructor is `noexcept`, and copies them otherwise. If a `noexcept` function throws, the program calls `std::terminate`.

```cpp
int size() const noexcept {
    return size_;
}
```

### Destructors clean up during stack unwinding

Destructors run while the exception travels up the stack. So RAII objects, such as smart pointers and lock guards, release their resources. Do cleanup with RAII, not in `catch` blocks.

```cpp
void work() {
    auto p = std::make_unique<int>(1);
    // ~unique_ptr runs, then the
    // exception leaves work()
    throw std::runtime_error("fail");
}
```

### Other languages handle errors differently

Java has checked exceptions that callers must handle or declare; C++ has none. Go has no exceptions: errors are values. C uses `errno` and return codes.

```cpp
// No "throws" clause in C++
int parse(const std::string& s);
```

## Watch out

- Throw by value and catch by `const&`. A catch by value makes an extra copy.
- A catch by value of a base class also slices the object. A virtual `what()` then loses the derived override.
- `catch (...)` also catches the logic errors you want to see during development. Catch specific types.
- Use `catch (...)` only at a top-level boundary, such as a request handler that must not crash the process.
- A `noexcept` function that throws calls `std::terminate`. The caller never sees the exception.
- Mark a function `noexcept` only if nothing it calls can throw.

## The task

Write a custom exception and three functions in `stub.cpp`.

1. `class ValueError : public std::runtime_error` has the constructor `ValueError(const std::string& message, int code = 0)`.
2. The constructor passes `message` to `std::runtime_error`, so `what()` returns it.
3. The constructor stores `code`. `int code() const` returns it. The default code is `0`.
4. `int parse_positive_int(const std::string& s)` parses `s` as an integer and returns it.
5. `parse_positive_int` throws `ValueError` if `s` is not a valid integer.
6. Trailing characters that are not digits make `s` invalid. So does a decimal number such as `"3.14"`.
7. `parse_positive_int` throws `ValueError` if the value is `0` or less.
8. `double safe_divide(double a, double b)` returns `a / b`.
9. If `b == 0`, `safe_divide` throws `ValueError("division by zero")`.
10. `std::string exception_message(std::function<void()> fn)` calls `fn()` inside a `try` block.
11. If `fn` throws a `std::exception`, `exception_message` returns its `what()`. If `fn` returns normally, it returns `""`.

```cpp
ValueError e("bad input");
e.what();  // "bad input"
e.code();  // 0
ValueError coded("nope", 42);
coded.code();  // 42

parse_positive_int("42");   // 42
parse_positive_int("1");    // 1
// Each of these throws ValueError
parse_positive_int("abc");
parse_positive_int("0");
parse_positive_int("-5");
parse_positive_int("3.14");
parse_positive_int("42abc");

safe_divide(10, 2);   // 5.0
safe_divide(-10, 2);  // -5.0
// Throws ValueError
safe_divide(1, 0);

exception_message([] {});  // ""
// Returns "oops"
exception_message([] {
    throw std::runtime_error("oops");
});
// Returns "bad value"
exception_message([] {
    throw ValueError("bad value");
});
```
