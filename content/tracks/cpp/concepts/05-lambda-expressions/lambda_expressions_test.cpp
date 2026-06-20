/*
 * Build: g++ -std=c++17 -o test stub.cpp lambda_expressions_test.cpp && ./test
 */
#include <iostream>
#include <functional>
#include <vector>
#include <string>

std::function<int()> make_counter(int start);
std::vector<int> transform_if(std::vector<int>, std::function<bool(int)>, std::function<int(int)>);
std::function<int(int)> compose(std::function<int(int)>, std::function<int(int)>);

static int passed = 0, failed = 0;

void check(const std::string& name, bool condition) {
    if (condition) { std::cout << "  PASS: " << name << "\n"; ++passed; }
    else           { std::cout << "  FAIL: " << name << "\n"; ++failed; }
}

int main() {
    // make_counter
    {
        auto c = make_counter(0);
        check("counter: first call",  c() == 0);
        check("counter: second call", c() == 1);
        check("counter: third call",  c() == 2);

        auto c2 = make_counter(10);
        check("counter start=10",      c2() == 10);
        check("counter start=10 next", c2() == 11);
        check("counters independent",  c() == 3);  // c1 continues
    }

    // transform_if
    {
        auto evens_doubled = transform_if(
            {1, 2, 3, 4, 5},
            [](int n) { return n % 2 == 0; },
            [](int n) { return n * 2; });
        check("transform_if: size",     evens_doubled.size() == 2);
        check("transform_if: value[0]", evens_doubled[0] == 4);
        check("transform_if: value[1]", evens_doubled[1] == 8);

        auto none = transform_if({1, 3, 5}, [](int n){ return n%2==0; }, [](int n){ return n; });
        check("transform_if: none match", none.empty());
    }

    // compose
    {
        auto double_then_inc = compose([](int x){ return x+1; }, [](int x){ return x*2; });
        check("compose(inc, double)(3)", double_then_inc(3) == 7);
        check("compose(inc, double)(0)", double_then_inc(0) == 1);

        auto inc_then_double = compose([](int x){ return x*2; }, [](int x){ return x+1; });
        check("compose(double, inc)(3)", inc_then_double(3) == 8);
    }

    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed > 0 ? 1 : 0;
}
