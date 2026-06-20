#include <cstddef>
#include <algorithm>
#include <stdexcept>

class ScopedBuffer {
public:
    explicit ScopedBuffer(size_t size) : data_(nullptr), size_(0) {
        // TODO
    }

    ~ScopedBuffer() {
        // TODO
    }

    // Non-copyable
    ScopedBuffer(const ScopedBuffer&) = delete;
    ScopedBuffer& operator=(const ScopedBuffer&) = delete;

    // Movable
    ScopedBuffer(ScopedBuffer&& other) noexcept : data_(nullptr), size_(0) {
        // TODO
    }

    ScopedBuffer& operator=(ScopedBuffer&& other) noexcept {
        // TODO
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

// concat returns a new ScopedBuffer with all elements of a followed by b.
ScopedBuffer concat(ScopedBuffer a, ScopedBuffer b) {
    // TODO
    return ScopedBuffer(0);
}

int main() {
    ScopedBuffer buf(5);
    buf[0] = 1; buf[4] = 99;
    return 0;
}
