#include <cstddef>
#include <algorithm>

class Buffer {
public:
    explicit Buffer(size_t size)
        : data_(size > 0 ? new double[size]{} : nullptr), size_(size) {}

    Buffer(const Buffer& other)
        : data_(other.size_ > 0 ? new double[other.size_] : nullptr),
          size_(other.size_) {
        std::copy(other.data_, other.data_ + size_, data_);
    }

    Buffer& operator=(const Buffer& other) {
        if (this == &other) return *this;
        delete[] data_;
        size_ = other.size_;
        data_ = size_ > 0 ? new double[size_] : nullptr;
        std::copy(other.data_, other.data_ + size_, data_);
        return *this;
    }

    Buffer(Buffer&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;
        other.size_ = 0;
    }

    Buffer& operator=(Buffer&& other) noexcept {
        if (this == &other) return *this;
        delete[] data_;
        data_ = other.data_;
        size_ = other.size_;
        other.data_ = nullptr;
        other.size_ = 0;
        return *this;
    }

    ~Buffer() { delete[] data_; }

    size_t size() const { return size_; }

    double& operator[](size_t i) { return data_[i]; }
    const double& operator[](size_t i) const { return data_[i]; }

private:
    double* data_;
    size_t  size_;
};

Buffer merge(Buffer a, Buffer b) {
    Buffer result(a.size() + b.size());
    for (size_t i = 0; i < a.size(); ++i) result[i] = a[i];
    for (size_t i = 0; i < b.size(); ++i) result[a.size() + i] = b[i];
    return result;
}

int main() {
    Buffer b(4);
    b[0] = 1.0;
    b[1] = 2.0;
    return 0;
}
