# Exception Handling

## What you'll learn

C++ exceptions provide a structured way to propagate errors up the call stack without threading error codes through every function return value. They work best for truly exceptional conditions — bugs, resource exhaustion, invalid states — not for routine control flow.

## Key concepts

**throw, try, catch:**
```cpp
#include <stdexcept>

double divide(double a, double b) {
    if (b == 0.0) throw std::invalid_argument("division by zero");
    return a / b;
}

try {
    double result = divide(10, 0);
} catch (const std::invalid_argument& e) {
    std::cerr << "Error: " << e.what() << "\n";
} catch (const std::exception& e) {
    // catches any std::exception not caught above
} catch (...) {
    // catches anything — use sparingly
}
```

**The standard exception hierarchy:**
- `std::exception` — base class, has `what()` returning a `const char*`
- `std::runtime_error` — errors detectable only at runtime
- `std::logic_error` — programming errors (invalid_argument, out_of_range, etc.)
- `std::bad_alloc` — thrown by `new` when allocation fails

**Custom exceptions:**
```cpp
class ParseError : public std::runtime_error {
public:
    explicit ParseError(const std::string& msg, int line)
        : std::runtime_error(msg), line_(line) {}
    int line() const { return line_; }
private:
    int line_;
};
```

**`noexcept`:** Mark functions that never throw. The compiler can optimize them better, and move constructors should always be `noexcept`. If a `noexcept` function throws, `std::terminate` is called.

**RAII and exceptions:** Because destructors run during stack unwinding, RAII-managed resources (smart pointers, lock guards) are automatically released even when an exception is thrown. This is the right way to handle cleanup — not `catch` blocks.

**vs other languages:** Java checked exceptions force callers to handle or declare them — C++ has no checked exceptions. Go avoids exceptions entirely (errors are values). Python and JavaScript use exceptions similarly to C++ but with reference-counted GC, so stack unwinding is simpler. C has no exceptions at all — `errno` and return codes are the idiom.

## The task

Implement the following in `stub.cpp`:

- `class ValueError : public std::runtime_error` — constructor takes a `std::string` message; forward to `std::runtime_error`
- `int parse_positive_int(const std::string& s)` — parse `s` as an integer; throw `ValueError` if the string is not a valid integer or if the value is ≤ 0; return the parsed value
- `double safe_divide(double a, double b)` — throw `ValueError("division by zero")` if b is 0; otherwise return a/b
- `std::string exception_message(std::function<void()> fn)` — call fn inside a try/catch; if it throws a `std::exception`, return its `what()` string; if nothing throws, return `""`
