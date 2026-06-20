#include <iostream>
#include <vector>
#include <stdexcept>

template <typename T>
T clamp(T value, T lo, T hi) {
    if (value < lo) return lo;
    if (value > hi) return hi;
    return value;
}

template <typename T>
class Stack {
public:
    void push(T value) {
        data_.push_back(std::move(value));
    }

    T pop() {
        if (data_.empty()) throw std::underflow_error("pop from empty stack");
        T val = std::move(data_.back());
        data_.pop_back();
        return val;
    }

    T top() const {
        if (data_.empty()) throw std::underflow_error("top of empty stack");
        return data_.back();
    }

    bool empty() const { return data_.empty(); }

    std::size_t size() const { return data_.size(); }

private:
    std::vector<T> data_;
};

int main() {
    std::cout << clamp(15, 0, 10) << "\n";
    Stack<int> s;
    s.push(1); s.push(2); s.push(3);
    std::cout << s.pop() << "\n";
    std::cout << s.size() << "\n";
    return 0;
}
