// Compile: g++ -std=c++17 -o test raii_and_resource_management_test.cpp && ./test
#include <cstddef>
#include <algorithm>
#include <cstdio>
#include <type_traits>

class ScopedBuffer {
public:
    explicit ScopedBuffer(size_t size)
        : data_(size > 0 ? new int[size]{} : nullptr), size_(size) {}
    ~ScopedBuffer() { delete[] data_; }
    ScopedBuffer(const ScopedBuffer&) = delete;
    ScopedBuffer& operator=(const ScopedBuffer&) = delete;
    ScopedBuffer(ScopedBuffer&& o) noexcept : data_(o.data_), size_(o.size_) { o.data_ = nullptr; o.size_ = 0; }
    ScopedBuffer& operator=(ScopedBuffer&& o) noexcept {
        if (this != &o) { delete[] data_; data_ = o.data_; size_ = o.size_; o.data_ = nullptr; o.size_ = 0; }
        return *this;
    }
    size_t size() const { return size_; }
    int* data() { return data_; }
    int& operator[](size_t i) { return data_[i]; }
    const int& operator[](size_t i) const { return data_[i]; }
private:
    int* data_; size_t size_;
};

ScopedBuffer concat(ScopedBuffer a, ScopedBuffer b);

static int passed = 0, failed = 0;
#define CHECK(name, cond) \
    do { if (cond) { printf("  PASS: %s\n", name); passed++; } \
         else      { printf("  FAIL: %s\n", name); failed++; } } while(0)

int main() {
    // Non-copyable
    CHECK("ScopedBuffer: not copy-constructible",
          !std::is_copy_constructible<ScopedBuffer>::value);
    CHECK("ScopedBuffer: not copy-assignable",
          !std::is_copy_assignable<ScopedBuffer>::value);

    // Constructor + element access
    {
        ScopedBuffer b(5);
        CHECK("constructor: size", b.size() == 5);
        CHECK("constructor: zero-initialized", b[0] == 0 && b[4] == 0);
        b[0] = 7; b[4] = 42;
        CHECK("operator[]: write/read", b[0] == 7 && b[4] == 42);
        CHECK("data(): non-null", b.data() != nullptr);
    }

    // Empty buffer
    {
        ScopedBuffer empty(0);
        CHECK("empty buffer: size 0", empty.size() == 0);
    }

    // Move constructor
    {
        ScopedBuffer orig(3);
        orig[0] = 1; orig[1] = 2; orig[2] = 3;
        ScopedBuffer moved(std::move(orig));
        CHECK("move ctor: size", moved.size() == 3);
        CHECK("move ctor: values", moved[0] == 1 && moved[2] == 3);
        CHECK("move ctor: source zeroed", orig.size() == 0);
    }

    // Move assignment
    {
        ScopedBuffer a(2); a[0] = 5; a[1] = 6;
        ScopedBuffer b(1);
        b = std::move(a);
        CHECK("move assign: size", b.size() == 2);
        CHECK("move assign: values", b[0] == 5 && b[1] == 6);
        CHECK("move assign: source zeroed", a.size() == 0);
    }

    // concat
    {
        ScopedBuffer a(3); a[0] = 1; a[1] = 2; a[2] = 3;
        ScopedBuffer b(2); b[0] = 4; b[1] = 5;
        ScopedBuffer c = concat(std::move(a), std::move(b));
        CHECK("concat: size", c.size() == 5);
        CHECK("concat: first half", c[0] == 1 && c[2] == 3);
        CHECK("concat: second half", c[3] == 4 && c[4] == 5);
    }

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
