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

## Watch out

- **Throwing by value, catching by `const&`.** `throw ValueError("...")` copies the exception object onto a side channel the runtime manages; catch it as `catch (const ValueError& e)` to avoid an extra copy and to preserve polymorphism (catching a base-class reference still lets virtual `what()` resolve to the derived override).
- **`catch (...)` swallows everything**, including logic errors you'd want to know about during development. Prefer catching specific types, and only reach for `catch (...)` at a true top-level boundary (e.g. a server's request handler) where any exception must not crash the process.
- **A `noexcept` function that throws calls `std::terminate` immediately** — it doesn't propagate the exception to the caller. Never mark a function `noexcept` unless you're certain nothing it calls can throw.

## The task

Implement the following in `stub.cpp`:

**`class ValueError : public std::runtime_error`** — constructor `ValueError(const std::string& message, int code = 0)`; forwards `message` to `std::runtime_error` (so `.what()` returns it) and stores `code` (default `0`, retrievable via `int code() const`).

```cpp
ValueError e("bad input");
e.what();  // "bad input"
e.code();  // 0

ValueError coded("not found", 404);
coded.code();  // 404
```

**`int parse_positive_int(const std::string& s)`** — parses `s` as an integer and returns it. Throws `ValueError` if `s` isn't a valid integer (including trailing non-numeric characters, or a floating-point string like `"3.14"`) or if the parsed value is `<= 0`.

```cpp
parse_positive_int("42");    // 42
parse_positive_int("1");     // 1
parse_positive_int("abc");   // throws ValueError
parse_positive_int("0");     // throws ValueError — not positive
parse_positive_int("-5");    // throws ValueError — not positive
parse_positive_int("3.14");  // throws ValueError — not an integer
parse_positive_int("42abc"); // throws ValueError — trailing junk
```

**`double safe_divide(double a, double b)`** — returns `a / b`. Throws `ValueError("division by zero")` if `b == 0`.

```cpp
safe_divide(10, 2);   // 5.0
safe_divide(-10, 2);  // -5.0
safe_divide(1, 0);    // throws ValueError
```

**`std::string exception_message(std::function<void()> fn)`** — calls `fn()` inside a try/catch. If `fn` throws any `std::exception`, returns `e.what()`. If `fn` returns normally (no throw), returns `""`.

```cpp
exception_message([] {});                                  // ""
exception_message([] { throw std::runtime_error("oops"); }); // "oops"
exception_message([] { throw ValueError("bad value"); });    // "bad value"
```
