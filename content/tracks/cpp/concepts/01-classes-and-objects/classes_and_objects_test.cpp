/*
 * Test runner — compiled together with the learner's class definition.
 * Remove `main` from stub.cpp before linking, or guard it with #ifndef TESTING.
 * Build: g++ -std=c++17 -o test stub.cpp classes_and_objects_test.cpp && ./test
 */
#include <iostream>
#include <cmath>
#include <string>

/* Forward declaration — learner's class is compiled in from stub.cpp. */
class Rectangle;

static int passed = 0, failed = 0;

void check(const std::string& name, bool condition) {
    if (condition) { std::cout << "  PASS: " << name << "\n"; ++passed; }
    else           { std::cout << "  FAIL: " << name << "\n"; ++failed; }
}

void checkDouble(const std::string& name, double expected, double actual, double eps = 1e-9) {
    check(name, std::abs(expected - actual) < eps);
}

int main() {
    {
        Rectangle r(3.0, 4.0);
        checkDouble("area 3×4",       12.0, r.area());
        checkDouble("perimeter 3×4",  14.0, r.perimeter());
        check("isSquare 3×4 → false", !r.isSquare());
    }
    {
        Rectangle r(5.0, 5.0);
        checkDouble("area 5×5",       25.0, r.area());
        checkDouble("perimeter 5×5",  20.0, r.perimeter());
        check("isSquare 5×5 → true",  r.isSquare());
    }
    {
        Rectangle r(1.0, 0.0);
        checkDouble("area 1×0",      0.0, r.area());
        checkDouble("perimeter 1×0", 2.0, r.perimeter());
        check("isSquare 1×0 → false", !r.isSquare());
    }

    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed > 0 ? 1 : 0;
}
