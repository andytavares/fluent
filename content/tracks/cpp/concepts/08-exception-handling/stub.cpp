#include <stdexcept>
#include <string>
#include <functional>

// ValueError is a runtime exception with an HTTP-style numeric code.
class ValueError : public std::runtime_error {
public:
    explicit ValueError(const std::string& message) : std::runtime_error(message) {
        // TODO: store code
    }
    // TODO: add constructor that accepts code
    int code() const {
        // TODO
        return 0;
    }
};

// parse_positive_int parses s as a positive integer.
// Throws ValueError if not parseable or value <= 0.
int parse_positive_int(const std::string& s) {
    // TODO
    return 0;
}

// safe_divide returns a / b.
// Throws ValueError("division by zero") if b == 0.
double safe_divide(double a, double b) {
    // TODO
    return 0.0;
}

// exception_message calls fn; returns what() if a std::exception is thrown, "" otherwise.
std::string exception_message(std::function<void()> fn) {
    // TODO
    return "";
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
