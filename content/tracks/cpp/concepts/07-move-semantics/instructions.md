# Move Semantics

## What you'll learn

C++11 introduced move semantics: a way to transfer ownership of resources from one object to another without copying them. It's the mechanism that makes returning large objects from functions cheap, and the reason `std::vector` can grow without unnecessary copies.

## Key concepts

**Lvalues and rvalues:** An lvalue has a name and a persistent address. An rvalue is a temporary — it has no name and won't exist after the expression. Move semantics apply to rvalues.

```cpp
std::string a = "hello";      // a is an lvalue
std::string b = a;            // copy — a still valid
std::string c = std::move(a); // move — a is now in a valid-but-unspecified state
```

`std::move` doesn't move anything — it casts to an rvalue reference (`&&`), enabling the move constructor or move assignment operator to be selected.

**The rule of five:** If you define any of destructor, copy constructor, copy assignment, move constructor, or move assignment, you should define all five:

```cpp
class Buffer {
public:
    Buffer(Buffer&& other) noexcept       // move constructor
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;
        other.size_ = 0;
    }

    Buffer& operator=(Buffer&& other) noexcept {  // move assignment
        if (this != &other) {
            delete[] data_;
            data_ = other.data_;
            size_ = other.size_;
            other.data_ = nullptr;
            other.size_ = 0;
        }
        return *this;
    }
};
```

**`noexcept` on move operations:** Mark move constructors and move assignment operators `noexcept`. Standard containers (like `std::vector`) will only use your move constructor during reallocation if it's `noexcept`; otherwise they fall back to copying.

**When the compiler generates moves:** The compiler auto-generates move operations if you don't declare a destructor, copy constructor, or copy assignment. Once you declare any of them, you must define the rest yourself.

**vs other languages:** Java, JavaScript, Python, and Go have no concept of move semantics — the garbage collector handles lifetime, and assignment is always reference-based (or value-based for primitives). C++ move semantics exist because C++ has value semantics with deterministic destruction: when a `Buffer` goes out of scope, its destructor runs immediately. Move lets you cheaply hand off ownership before that happens.

## Watch out

- **Self-move-assignment (`b = std::move(b);`)** must not corrupt the object — always guard move assignment with `if (this == &other) return *this;`, the same way you'd guard copy assignment. It's rare in hand-written code but happens routinely inside generic algorithms (e.g. certain `std::swap` implementations, or self-referential container operations).
- **A moved-from object must remain destructible and assignable** — "valid but unspecified state" doesn't mean "any state." `~Buffer()` still runs `delete[] data_` on a moved-from `Buffer`; if you don't null out `data_` in the move constructor/assignment, that `delete[]` double-frees the memory the new owner now holds.
- **`noexcept` isn't just documentation.** If you omit `noexcept` from a move constructor, `std::vector<Buffer>` silently falls back to *copying* elements during reallocation instead of moving them (to preserve the strong exception guarantee), quietly erasing the performance benefit you wrote the move constructor for.

## The task

Implement the `Buffer` class in `stub.cpp`. It wraps a heap-allocated `double[]` array:

- `Buffer(size_t size)` — allocate a zero-initialized array of `size` doubles
- `Buffer(const Buffer& other)` — deep copy
- `Buffer& operator=(const Buffer& other)` — copy assignment (handle self-assignment)
- `Buffer(Buffer&& other) noexcept` — move constructor: steal pointer and size, null out source
- `Buffer& operator=(Buffer&& other) noexcept` — move assignment: same steal pattern (handle self-move-assignment)
- `~Buffer()` — `delete[]` the array
- `size_t size() const` — return number of elements
- `double& operator[](size_t i)` — element access
- `const double& operator[](size_t i) const` — const element access

Free function:
- `Buffer merge(Buffer a, Buffer b)` — return a new Buffer containing all elements of `a` followed by all elements of `b` (takes by value — moves happen at the call site)

```cpp
Buffer b(5);
b.size();     // 5
b[0];         // 0.0 — zero-initialized

Buffer orig(3);
orig[0] = 10.0;
Buffer copy(orig);        // deep copy
copy[0] = 99.0;
orig[0];                  // 10.0 — copy didn't touch orig

Buffer moved(std::move(orig));
moved.size();             // 3 — moved took orig's data
orig.size();              // 0 — orig was left empty, not destroyed

Buffer a(3); a[0] = 1.0; a[1] = 2.0; a[2] = 3.0;
Buffer bb(2); bb[0] = 4.0; bb[1] = 5.0;
Buffer m = merge(std::move(a), std::move(bb));
m.size();  // 5
m[0];      // 1.0
m[3];      // 4.0
```
