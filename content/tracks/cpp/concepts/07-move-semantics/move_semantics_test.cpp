// Compile and run: g++ -std=c++17 -o test move_semantics_test.cpp && ./test
#include <cstddef>
#include <algorithm>
#include <cstdio>
#include <cstring>

// --- paste Buffer and merge from stub.cpp above main ---

class Buffer {
public:
    explicit Buffer(size_t size)
        : data_(size > 0 ? new double[size]{} : nullptr), size_(size) {}
    Buffer(const Buffer& other)
        : data_(other.size_ > 0 ? new double[other.size_] : nullptr), size_(other.size_) {
        std::copy(other.data_, other.data_ + size_, data_);
    }
    Buffer& operator=(const Buffer& other) {
        if (this == &other) return *this;
        delete[] data_; size_ = other.size_;
        data_ = size_ > 0 ? new double[size_] : nullptr;
        std::copy(other.data_, other.data_ + size_, data_);
        return *this;
    }
    Buffer(Buffer&& other) noexcept : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr; other.size_ = 0;
    }
    Buffer& operator=(Buffer&& other) noexcept {
        if (this == &other) return *this;
        delete[] data_; data_ = other.data_; size_ = other.size_;
        other.data_ = nullptr; other.size_ = 0; return *this;
    }
    ~Buffer() { delete[] data_; }
    size_t size() const { return size_; }
    double& operator[](size_t i) { return data_[i]; }
    const double& operator[](size_t i) const { return data_[i]; }
private:
    double* data_; size_t size_;
};

Buffer merge(Buffer a, Buffer b) {
    Buffer result(a.size() + b.size());
    for (size_t i = 0; i < a.size(); ++i) result[i] = a[i];
    for (size_t i = 0; i < b.size(); ++i) result[a.size() + i] = b[i];
    return result;
}

// --- test harness ---

static int passed = 0, failed = 0;

#define CHECK(name, cond) \
    do { \
        if (cond) { printf("  PASS: %s\n", name); passed++; } \
        else      { printf("  FAIL: %s\n", name); failed++; } \
    } while (0)

int main() {
    // Constructor
    {
        Buffer b(5);
        CHECK("constructor: size correct", b.size() == 5);
        CHECK("constructor: elements zero-initialized", b[0] == 0.0 && b[4] == 0.0);
    }

    // Element access
    {
        Buffer b(3);
        b[0] = 1.5; b[1] = 2.5; b[2] = 3.5;
        CHECK("operator[]: write and read back", b[0] == 1.5 && b[2] == 3.5);
    }

    // Copy constructor
    {
        Buffer orig(3);
        orig[0] = 10.0; orig[1] = 20.0; orig[2] = 30.0;
        Buffer copy(orig);
        CHECK("copy ctor: size", copy.size() == 3);
        CHECK("copy ctor: values match", copy[0] == 10.0 && copy[2] == 30.0);
        copy[0] = 99.0;
        CHECK("copy ctor: mutation does not affect original", orig[0] == 10.0);
    }

    // Copy assignment
    {
        Buffer a(2); a[0] = 1.0; a[1] = 2.0;
        Buffer b(3);
        b = a;
        CHECK("copy assign: size", b.size() == 2);
        CHECK("copy assign: values", b[0] == 1.0 && b[1] == 2.0);
        b[0] = 99.0;
        CHECK("copy assign: does not affect source", a[0] == 1.0);
        // self-assignment
        a = a;
        CHECK("copy assign: self-assign safe", a[0] == 1.0);
    }

    // Move constructor
    {
        Buffer orig(4);
        orig[0] = 7.0; orig[3] = 8.0;
        Buffer moved(std::move(orig));
        CHECK("move ctor: destination size", moved.size() == 4);
        CHECK("move ctor: destination values", moved[0] == 7.0 && moved[3] == 8.0);
        CHECK("move ctor: source size zeroed", orig.size() == 0);
    }

    // Move assignment
    {
        Buffer a(3); a[0] = 5.0;
        Buffer b(1);
        b = std::move(a);
        CHECK("move assign: destination size", b.size() == 3);
        CHECK("move assign: destination value", b[0] == 5.0);
        CHECK("move assign: source size zeroed", a.size() == 0);
    }

    // merge
    {
        Buffer a(3); a[0] = 1.0; a[1] = 2.0; a[2] = 3.0;
        Buffer b(2); b[0] = 4.0; b[1] = 5.0;
        Buffer m = merge(std::move(a), std::move(b));
        CHECK("merge: size", m.size() == 5);
        CHECK("merge: first half", m[0] == 1.0 && m[2] == 3.0);
        CHECK("merge: second half", m[3] == 4.0 && m[4] == 5.0);
    }

    // Empty buffer
    {
        Buffer empty(0);
        CHECK("empty buffer: size 0", empty.size() == 0);
    }

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
