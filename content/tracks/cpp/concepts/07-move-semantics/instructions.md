## What you build

You write a `Buffer` class that owns a heap array, with copy and move operations, and a `merge` function. Move semantics, added in C++11, transfer resources from one object to another without a copy. This lesson builds on **Inheritance & Polymorphism**.

## Key concepts

### A move hands off resources instead of copying them

Moves make it cheap to return a large object from a function. They also let `std::vector` grow without extra copies.

```cpp
std::vector<std::string> load() {
    std::vector<std::string> lines;
    // ... fill lines ...
    // Moved out, not copied
    return lines;
}
```

### Lvalues have names; rvalues are temporaries

An lvalue has a name and a persistent address. An rvalue is a temporary with no name, and it ends with the expression. Move semantics apply to rvalues.

```cpp
// a is an lvalue
std::string a = "hello";
// Copy: a is still valid
std::string b = a;
// Move: a is valid but unspecified
std::string c = std::move(a);
```

### `std::move` does not move anything

`std::move` casts its argument to an rvalue reference (`&&`). The cast lets the compiler select the move constructor or the move assignment operator.

```cpp
std::string s = "data";
// Same effect as std::move(s)
std::string t =
    static_cast<std::string&&>(s);
```

### The rule of five

If you define one of these five, define all five: destructor, copy constructor, copy assignment, move constructor and move assignment.

```cpp
class Buffer {
public:
    // Move constructor
    Buffer(Buffer&& other) noexcept
        : data_(other.data_),
          size_(other.size_) {
        other.data_ = nullptr;
        other.size_ = 0;
    }

    // Move assignment
    Buffer& operator=(
            Buffer&& other) noexcept {
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

### Mark move operations `noexcept`

Standard containers such as `std::vector` use your move constructor during reallocation only if it is `noexcept`. Otherwise they copy.

```cpp
Buffer(Buffer&& other) noexcept;
Buffer& operator=(
    Buffer&& other) noexcept;
```

### The compiler generates moves only in some cases

The compiler generates the move operations if you declare no destructor, copy constructor or copy assignment. If you declare one of them, it does not generate the moves. Write them yourself.

```cpp
struct Plain {
    // Moves are generated
    std::string name;
};
struct Custom {
    // No generated moves
    ~Custom();
    std::string name;
};
```

### Moves exist because C++ destroys values deterministically

Java, JavaScript, Python and Go have no move semantics: a garbage collector handles lifetime. In C++, a `Buffer` destructor runs the moment the `Buffer` goes out of scope. A move hands off ownership cheaply before that happens.

```cpp
{
    Buffer a(1000);
    Buffer b(std::move(a));
}
// ~b frees the array; ~a frees nothing
```

## Watch out

- `b = std::move(b);` must not corrupt the object. Start move assignment with `if (this == &other) return *this;`.
- Self-move is rare in hand-written code. It happens in generic algorithms, for example in some `std::swap` implementations.
- A moved-from object must stay destructible and assignable. "Valid but unspecified" does not mean "any state".
- `~Buffer()` runs `delete[] data_` on a moved-from `Buffer` too. If the move does not null `data_`, that is a double free.
- Without `noexcept`, `std::vector<Buffer>` copies elements during reallocation instead of moving them. You lose the speed of the move.
- The vector copies to keep the strong exception guarantee. It gives no warning.

## The task

Write the `Buffer` class in `stub.cpp`. It wraps an array of `double` on the heap.

1. `Buffer(size_t size)` allocates an array of `size` doubles. All elements start at `0.0`.
2. `Buffer(const Buffer& other)` makes a deep copy. Changes to the copy do not change `other`.
3. `Buffer& operator=(const Buffer& other)` makes a deep copy. `a = a` leaves `a` unchanged.
4. `Buffer(Buffer&& other) noexcept` takes the pointer and size of `other`. It sets `other` to null pointer and size 0.
5. `Buffer& operator=(Buffer&& other) noexcept` takes the resources the same way. `b = std::move(b)` leaves `b` unchanged.
6. `~Buffer()` frees the array with `delete[]`.
7. `size_t size() const` returns the number of elements.
8. `double& operator[](size_t i)` and `const double& operator[](size_t i) const` give access to element `i`.

Write one free function too:

9. `Buffer merge(Buffer a, Buffer b)` returns a new `Buffer` with the elements of `a`, then the elements of `b`.

`merge` takes its arguments by value, so moves happen at the call site. A `Buffer` of size 0 is valid, and you can copy it.

```cpp
Buffer b(5);
b.size();  // 5
b[0];      // 0.0
b[4];      // 0.0

Buffer orig(3);
orig[0] = 10.0; orig[1] = 20.0;
orig[2] = 30.0;
Buffer copy(orig);
copy[2];         // 30.0
copy[0] = 99.0;
orig[0];         // 10.0

Buffer x(2); x[0] = 1.0; x[1] = 2.0;
Buffer y(3);
y = x;
y.size();  // 2
y[1];      // 2.0
x = x;
x[0];      // 1.0

Buffer src(4);
src[0] = 7.0; src[3] = 8.0;
Buffer moved(std::move(src));
moved.size();  // 4
moved[3];      // 8.0
src.size();    // 0

Buffer p(3); p[0] = 5.0;
Buffer q(1);
q = std::move(p);
q.size();  // 3
p.size();  // 0
q = std::move(q);
q[0];      // 5.0

Buffer a(3);
a[0] = 1.0; a[1] = 2.0; a[2] = 3.0;
Buffer c(2); c[0] = 4.0; c[1] = 5.0;
Buffer m = merge(std::move(a),
                 std::move(c));
m.size();  // 5
m[2];      // 3.0
m[3];      // 4.0

Buffer empty(0);
empty.size();         // 0
Buffer(empty).size(); // 0
```
