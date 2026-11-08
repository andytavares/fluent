## What you build

You write `ScopedBuffer`, a class that owns a heap array, and a `concat` function. RAII (Resource Acquisition Is Initialization) is the central C++ idiom for resource management. This lesson builds on **Concurrency**.

## Key concepts

### The constructor acquires; the destructor releases

Wrap a resource in a class: memory, a file handle, a mutex lock or a socket. Destructors run at the end of scope, and also when an exception unwinds the stack. So the resource never leaks.

```cpp
class FileHandle {
public:
    FileHandle(const char* path,
               const char* mode)
        : file_(std::fopen(path, mode)) {
        if (!file_)
            throw std::runtime_error(
                "failed to open file");
    }

    ~FileHandle() {
        if (file_) std::fclose(file_);
    }

    FILE* get() const { return file_; }

    // Do not duplicate a file handle
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(
        const FileHandle&) = delete;

private:
    FILE* file_;
};
```

### The standard library has RAII wrappers

- `std::unique_ptr<T>` is the only owner. It releases on destruction. You can move it but not copy it.
- `std::shared_ptr<T>` shares ownership through a reference count. The last owner releases.
- `std::lock_guard<Mutex>` locks the mutex in its constructor and unlocks it in its destructor.
- `std::ifstream` and `std::ofstream` close the file on destruction.

```cpp
{
    std::ofstream out("log.txt");
    out << "done\n";
}
// The file is closed here
```

### `= delete` makes a type non-copyable

Copying a resource handle is usually wrong. Delete the copy constructor and the copy assignment. A copy is then a compile error, not a hidden bug.

```cpp
ScopedBuffer a(3);
// Compile error: copy is deleted
ScopedBuffer b = a;
```

### A unique resource needs move operations

Write a move constructor and a move assignment next to the deleted copy operations. Each one takes the resource and nulls the source. This is the rule of five for an RAII type.

```cpp
ScopedBuffer a(3);
// a gives its array to b
ScopedBuffer b = std::move(a);
```

### RAII cleans up with no code at the call site

Java `try-with-resources` and Python `with` do the same job, but each use needs explicit syntax. Go `defer` runs at the end of the function, not the scope.

```cpp
void use() {
    ScopedBuffer buf(100);
    risky();
}
// ~ScopedBuffer runs on return
// and when risky() throws
```

## Watch out

- Deleting the copy operations is a design decision. A `ScopedBuffer` owns one heap array alone.
- With copies, two objects own the same array. Both run `delete[]` on it: a double free.
- `= delete` turns `ScopedBuffer b2 = b1;` into a compile error instead of a crash.
- `b = std::move(b);` must leave `b` intact. Guard move assignment with `if (this != &other)`.
- Without the guard, the buffer frees its own data before it takes the data from itself.
- A moved-from `ScopedBuffer` must stay safe to destroy. Null the pointer of the source in each move.
- Without that, two objects hold the same pointer. The destructors run `delete[]` on it twice.

## The task

Write `class ScopedBuffer` in `stub.cpp`. It is an RAII wrapper around a heap array of `int`.

1. `explicit ScopedBuffer(size_t size)` allocates `size` ints with `new int[size]{}`. All elements start at 0.
2. `~ScopedBuffer()` frees the array with `delete[]`.
3. The stub deletes the copy constructor and the copy assignment. Keep the `= delete`.
4. `ScopedBuffer(ScopedBuffer&& other) noexcept` takes the pointer and size of `other`. It sets `other` to null pointer and size 0.
5. `ScopedBuffer& operator=(ScopedBuffer&& other) noexcept` takes the resources the same way.
6. `b = std::move(b)` leaves `b` unchanged.
7. `size_t size() const` returns the number of elements.
8. `int& operator[](size_t i)` and `const int& operator[](size_t i) const` give access to element `i`.
9. `int* data()` returns the raw pointer, for C APIs.

Write one free function too:

10. `ScopedBuffer concat(ScopedBuffer a, ScopedBuffer b)` returns a new `ScopedBuffer` with the elements of `a`, then those of `b`.

`concat` takes both arguments by value. Callers pass `std::move(x)`. A buffer of size 0 is valid.

```cpp
ScopedBuffer b(5);
b.size();  // 5
b[0];      // 0
b[0] = 7; b[4] = 42;
b[4];      // 42
b.data() != nullptr;  // true

ScopedBuffer empty(0);
empty.size();  // 0

ScopedBuffer orig(3);
orig[0] = 1; orig[1] = 2; orig[2] = 3;
ScopedBuffer moved(std::move(orig));
moved.size();  // 3
moved[2];      // 3
orig.size();   // 0
orig.data();   // nullptr

ScopedBuffer x(2); x[0] = 5; x[1] = 6;
ScopedBuffer y(1);
y = std::move(x);
y.size();  // 2
x.size();  // 0
y = std::move(y);
y[0];      // 5

ScopedBuffer a(3);
a[0] = 1; a[1] = 2; a[2] = 3;
ScopedBuffer c(2); c[0] = 4; c[1] = 5;
ScopedBuffer r = concat(std::move(a),
                        std::move(c));
r.size();  // 5
r[2];      // 3
r[3];      // 4

ScopedBuffer none(0);
ScopedBuffer two(2);
two[0] = 9; two[1] = 10;
ScopedBuffer t = concat(
    std::move(none), std::move(two));
t.size();  // 2
t[1];      // 10

// Compile error: copy is deleted
// ScopedBuffer dup = b;
```
