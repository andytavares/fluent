#include <stdexcept>
#include <string>
#include <functional>
#include <stdexcept>

class ValueError : public std::runtime_error {
public:
    explicit ValueError(const std::string& message, int code = 0)
        : std::runtime_error(message), code_(code) {}
    int code() const { return code_; }
private:
    int code_;
};

int parse_positive_int(const std::string& s) {
    size_t pos = 0;
    int value = 0;
    try {
        value = std::stoi(s, &pos);
    } catch (...) {
        throw ValueError("not a valid integer: " + s);
    }
    if (pos != s.size()) throw ValueError("not a valid integer: " + s);
    if (value <= 0) throw ValueError("value must be positive");
    return value;
}

double safe_divide(double a, double b) {
    if (b == 0.0) throw ValueError("division by zero");
    return a / b;
}

std::string exception_message(std::function<void()> fn) {
    try {
        fn();
        return "";
    } catch (const std::exception& e) {
        return e.what();
    }
}

int main() {
    try {
        int n = parse_positive_int("42");
        (void)n;
    } catch (const ValueError& e) {
        // shouldn't happen
    }
    return 0;
}
