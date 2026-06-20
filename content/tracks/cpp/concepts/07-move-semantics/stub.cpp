#include <cstddef>
#include <algorithm>

class Buffer {
public:
    // Allocates a zero-initialized array of size doubles.
    explicit Buffer(size_t size) : data_(nullptr), size_(0) {
        // TODO
    }

    // Copy constructor — deep copy.
    Buffer(const Buffer& other) : data_(nullptr), size_(0) {
        // TODO
    }

    // Copy assignment — deep copy, handle self-assignment.
    Buffer& operator=(const Buffer& other) {
        // TODO
        return *this;
    }

    // Move constructor — steal other's resources.
    Buffer(Buffer&& other) noexcept : data_(nullptr), size_(0) {
        // TODO
    }

    // Move assignment — steal other's resources.
    Buffer& operator=(Buffer&& other) noexcept {
        // TODO
        return *this;
    }

    ~Buffer() {
        // TODO
    }

    size_t size() const { return size_; }

    double& operator[](size_t i) { return data_[i]; }
    const double& operator[](size_t i) const { return data_[i]; }

private:
    double* data_;
    size_t  size_;
};

// merge returns a new Buffer with all elements of a followed by all elements of b.
Buffer merge(Buffer a, Buffer b) {
    // TODO
    return Buffer(0);
}

int main() {
    Buffer b(4);
    b[0] = 1.0;
    b[1] = 2.0;
    return 0;
}
