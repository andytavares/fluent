// Compile: g++ -std=c++17 -o test exception_handling_test.cpp && ./test
#include <stdexcept>
#include <string>
#include <functional>
#include <cstdio>

class ValueError : public std::runtime_error {
public:
    explicit ValueError(const std::string& message, int code = 0)
        : std::runtime_error(message), code_(code) {}
    int code() const { return code_; }
private:
    int code_;
};

int parse_positive_int(const std::string& s);
double safe_divide(double a, double b);
std::string exception_message(std::function<void()> fn);

static int passed = 0, failed = 0;
#define CHECK(name, cond) \
    do { if (cond) { printf("  PASS: %s\n", name); passed++; } \
         else      { printf("  FAIL: %s\n", name); failed++; } } while(0)

static bool throws_value_error(std::function<void()> fn) {
    try { fn(); return false; }
    catch (const ValueError&) { return true; }
    catch (...) { return false; }
}

int main() {
    // parse_positive_int
    CHECK("parse_positive_int: 42", parse_positive_int("42") == 42);
    CHECK("parse_positive_int: 1",  parse_positive_int("1")  == 1);
    CHECK("parse_positive_int: throws on 'abc'",    throws_value_error([] { parse_positive_int("abc"); }));
    CHECK("parse_positive_int: throws on 0",         throws_value_error([] { parse_positive_int("0"); }));
    CHECK("parse_positive_int: throws on negative",  throws_value_error([] { parse_positive_int("-5"); }));
    CHECK("parse_positive_int: throws on float str", throws_value_error([] { parse_positive_int("3.14"); }));

    // safe_divide
    CHECK("safe_divide: 10/2 = 5", safe_divide(10, 2) == 5.0);
    CHECK("safe_divide: throws on zero", throws_value_error([] { safe_divide(1, 0); }));

    // exception_message
    CHECK("exception_message: no throw returns empty",
          exception_message([] {}) == "");
    std::string msg = exception_message([] { throw std::runtime_error("oops"); });
    CHECK("exception_message: captures what()", msg == "oops");
    std::string msg2 = exception_message([] { throw ValueError("bad value"); });
    CHECK("exception_message: catches ValueError", msg2 == "bad value");

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
