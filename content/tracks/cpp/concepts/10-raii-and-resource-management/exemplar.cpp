#include <cstddef>
#include <algorithm>
#include <stdexcept>

class ScopedBuffer {
public:
    explicit ScopedBuffer(size_t size)
        : data_(size > 0 ? new int[size]{} : nullptr), size_(size) {}

    ~ScopedBuffer() { delete[] data_; }

    ScopedBuffer(const ScopedBuffer&) = delete;
    ScopedBuffer& operator=(const ScopedBuffer&) = delete;

    ScopedBuffer(ScopedBuffer&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;
        other.size_ = 0;
    }

    ScopedBuffer& operator=(ScopedBuffer&& other) noexcept {
        if (this != &other) {
            delete[] data_;
            data_ = other.data_;
            size_ = other.size_;
            other.data_ = nullptr;
            other.size_ = 0;
        }
        return *this;
    }

    size_t size() const { return size_; }
    int* data() { return data_; }
    int& operator[](size_t i) { return data_[i]; }
    const int& operator[](size_t i) const { return data_[i]; }

private:
    int* data_;
    size_t size_;
};

ScopedBuffer concat(ScopedBuffer a, ScopedBuffer b) {
    ScopedBuffer result(a.size() + b.size());
    for (size_t i = 0; i < a.size(); ++i) result[i] = a[i];
    for (size_t i = 0; i < b.size(); ++i) result[a.size() + i] = b[i];
    return result;
}

int main() {
    ScopedBuffer buf(5);
    buf[0] = 1; buf[4] = 99;
    return 0;
}
