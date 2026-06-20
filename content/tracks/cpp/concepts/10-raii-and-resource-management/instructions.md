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

## The task

Implement `class ScopedBuffer` in `stub.cpp` — an RAII wrapper around a heap-allocated `int` array:

- `explicit ScopedBuffer(size_t size)` — allocate `size` ints with `new int[size]{}` (zero-initialized)
- `~ScopedBuffer()` — `delete[]` the array
- Copy constructor and copy assignment: **deleted**
- `ScopedBuffer(ScopedBuffer&& other) noexcept` — move constructor: steal pointer and size, null out source
- `ScopedBuffer& operator=(ScopedBuffer&& other) noexcept` — move assignment
- `size_t size() const`
- `int& operator[](size_t i)` and `const int& operator[](size_t i) const`
- `int* data()` — return the raw pointer (for interop with C APIs)

Free function:
- `ScopedBuffer concat(ScopedBuffer a, ScopedBuffer b)` — return a new ScopedBuffer with all elements of `a` followed by `b` (takes by value to trigger moves at call sites)
