// Test runner — concatenated after stub.cpp (with main() stripped) into one
// translation unit.
// Build: g++ -std=c++17 -o test stub.cpp exception_handling_test.cpp && ./test
#include <stdexcept>
#include <string>
#include <functional>
#include <cstdio>

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
    // ValueError itself
    {
        ValueError e("bad input");
        CHECK("ValueError: what()", std::string(e.what()) == "bad input");
        CHECK("ValueError: default code is 0", e.code() == 0);
        ValueError coded("nope", 42);
        CHECK("ValueError: custom code", coded.code() == 42);
        CHECK("ValueError: is a std::runtime_error", dynamic_cast<const std::runtime_error*>(&e) != nullptr);
    }

    // parse_positive_int
    CHECK("parse_positive_int: 42", parse_positive_int("42") == 42);
    CHECK("parse_positive_int: 1",  parse_positive_int("1")  == 1);
    CHECK("parse_positive_int: throws on 'abc'",    throws_value_error([] { parse_positive_int("abc"); }));
    CHECK("parse_positive_int: throws on 0",         throws_value_error([] { parse_positive_int("0"); }));
    CHECK("parse_positive_int: throws on negative",  throws_value_error([] { parse_positive_int("-5"); }));
    CHECK("parse_positive_int: throws on float str", throws_value_error([] { parse_positive_int("3.14"); }));
    CHECK("parse_positive_int: throws on trailing junk", throws_value_error([] { parse_positive_int("42abc"); }));

    // safe_divide
    CHECK("safe_divide: 10/2 = 5", safe_divide(10, 2) == 5.0);
    CHECK("safe_divide: throws on zero", throws_value_error([] { safe_divide(1, 0); }));
    CHECK("safe_divide: negative operands ok", safe_divide(-10, 2) == -5.0);

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
