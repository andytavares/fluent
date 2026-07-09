# RAII & Resource Management

## What you'll learn

RAII — Resource Acquisition Is Initialization — is C++'s central resource management idiom. You wrap a resource (memory, file handle, mutex lock, socket) in a class whose constructor acquires it and whose destructor releases it. Because destructors run deterministically when the object goes out of scope (or when an exception unwinds the stack), resources are never leaked.

## Key concepts

**The pattern:**
```cpp
class FileHandle {
public:
    explicit FileHandle(const char* path, const char* mode)
        : file_(std::fopen(path, mode)) {
        if (!file_) throw std::runtime_error("failed to open file");
    }

    ~FileHandle() {
        if (file_) std::fclose(file_);
    }

    FILE* get() const { return file_; }

    // Delete copy — a file handle shouldn't be duplicated
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;

private:
    FILE* file_;
};
```

**Standard RAII wrappers:**
- `std::unique_ptr<T>` — sole owner; releases on destruction; non-copyable, movable
- `std::shared_ptr<T>` — shared ownership via reference count; last owner releases
- `std::lock_guard<Mutex>` — acquires mutex in constructor, releases in destructor
- `std::ifstream` / `std::ofstream` — close file on destruction

**`= delete` for non-copyable types:** Copying a resource handle is usually wrong. Explicitly deleting the copy constructor and copy assignment operator makes attempts to copy a compile error, not a silent bug.

**Move semantics and RAII:** When a type manages a unique resource, implement move constructor + move assignment (stealing the resource, nulling the source) alongside the deleted copy operations. This is the rule of five applied to RAII types.

**vs other languages:** Java's `try-with-resources` and Python's `with` statement are close equivalents — but they require explicit syntax at every use site. C++ RAII is automatic: any object going out of scope cleans up, even inside called functions, even when exceptions are thrown. Go's `defer` is similar but per-function, not per-scope.

## Watch out

- **Deleting the copy operations is a design decision, not boilerplate.** A `ScopedBuffer` represents exclusive ownership of one heap array — allowing copies would mean two objects both believe they own (and will `delete[]`) the same memory, a double free waiting to happen. `= delete` turns an accidental `ScopedBuffer b2 = b1;` into a compile error instead of a runtime crash.
- **Self-move-assignment (`b = std::move(b);`)** must leave the object intact — guard with `if (this != &other)` just as in copy assignment, and note that skipping the guard causes the buffer to `delete[]` its own data before "stealing" it from itself.
- **A moved-from `ScopedBuffer` must still be safely destructible.** Null out the source's pointer in the move constructor/assignment — otherwise both the moved-from and moved-to objects hold the same pointer, and the destructor runs `delete[]` on it twice when both go out of scope.

## The task

Implement `class ScopedBuffer` in `stub.cpp` — an RAII wrapper around a heap-allocated `int` array:

- `explicit ScopedBuffer(size_t size)` — allocate `size` ints with `new int[size]{}` (zero-initialized)
- `~ScopedBuffer()` — `delete[]` the array
- Copy constructor and copy assignment: **deleted** (already written in the stub — don't remove the `= delete`)
- `ScopedBuffer(ScopedBuffer&& other) noexcept` — move constructor: steal pointer and size, null out source
- `ScopedBuffer& operator=(ScopedBuffer&& other) noexcept` — move assignment (guard against self-move-assignment)
- `size_t size() const`
- `int& operator[](size_t i)` and `const int& operator[](size_t i) const`
- `int* data()` — return the raw pointer (for interop with C APIs)

Free function:
- `ScopedBuffer concat(ScopedBuffer a, ScopedBuffer b)` — return a new `ScopedBuffer` with all elements of `a` followed by all elements of `b` (takes both parameters by value, so moves happen at the call site — callers must pass `std::move(x)`)

```cpp
ScopedBuffer b(5);
b.size();     // 5
b[0];         // 0 — zero-initialized
b[0] = 7; b[4] = 42;
b.data() != nullptr;  // true

ScopedBuffer orig(3);
orig[0] = 1; orig[1] = 2; orig[2] = 3;
ScopedBuffer moved(std::move(orig));
moved.size();  // 3
orig.size();   // 0 — moved-from, safely empty (destructor still runs fine on orig)

ScopedBuffer a(3); a[0] = 1; a[1] = 2; a[2] = 3;
ScopedBuffer c(2); c[0] = 4; c[1] = 5;
ScopedBuffer result = concat(std::move(a), std::move(c));
result.size();  // 5
result[0];      // 1
result[3];      // 4

// This does not compile — copying is deleted:
// ScopedBuffer dup = b;
```
