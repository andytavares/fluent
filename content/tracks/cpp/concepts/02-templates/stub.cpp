#include <iostream>
#include <vector>
#include <stdexcept>

// clamp returns value clamped to [lo, hi].
template <typename T>
T clamp(T value, T lo, T hi) {
    // TODO
    return value;
}

// Stack is a LIFO container backed by a dynamic array.
template <typename T>
class Stack {
public:
    // push adds value to the top.
    void push(T value) {
        // TODO
    }

    // pop removes and returns the top value.
    T pop() {
        // TODO
        return T{};
    }

    // top returns the top value without removing it.
    T top() const {
        // TODO
        return T{};
    }

    // empty returns true if the stack has no elements.
    bool empty() const {
        // TODO
        return true;
    }

    // size returns the number of elements.
    std::size_t size() const {
        // TODO
        return 0;
    }

private:
    std::vector<T> data_;
};

int main() {
    std::cout << clamp(15, 0, 10) << "\n";  // 10
    Stack<int> s;
    s.push(1); s.push(2); s.push(3);
    std::cout << s.pop() << "\n";  // 3
    std::cout << s.size() << "\n"; // 2
    return 0;
}
