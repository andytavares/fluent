/*
 * Build: g++ -std=c++17 -o test stub.cpp templates_test.cpp && ./test
 * Guard the main() in stub.cpp with #ifndef TESTING before linking.
 */
#include <iostream>
#include <string>
#include <stdexcept>

template <typename T> T clamp(T value, T lo, T hi);
template <typename T> class Stack;

static int passed = 0, failed = 0;

void check(const std::string& name, bool condition) {
    if (condition) { std::cout << "  PASS: " << name << "\n"; ++passed; }
    else           { std::cout << "  FAIL: " << name << "\n"; ++failed; }
}

int main() {
    // clamp tests
    check("clamp int below lo",  clamp(  -5,  0, 10) ==  0);
    check("clamp int above hi",  clamp(  15,  0, 10) == 10);
    check("clamp int in range",  clamp(   5,  0, 10) ==  5);
    check("clamp double",        clamp(1.5, 0.0, 1.0) == 1.0);
    check("clamp char",          clamp('z', 'a', 'm') == 'm');

    // Stack<int> tests
    {
        Stack<int> s;
        check("empty stack is empty", s.empty());
        check("empty stack size 0",   s.size() == 0);

        s.push(10); s.push(20); s.push(30);
        check("size after 3 pushes", s.size() == 3);
        check("top after pushes",    s.top()  == 30);
        check("not empty",           !s.empty());

        check("pop returns top",     s.pop() == 30);
        check("size after pop",      s.size() == 2);
        check("new top after pop",   s.top()  == 20);

        s.pop(); s.pop();
        check("empty after all pops", s.empty());
    }

    // Stack<std::string> tests
    {
        Stack<std::string> s;
        s.push("hello");
        s.push("world");
        check("string top",    s.top() == "world");
        check("string pop",    s.pop() == "world");
        check("string size 1", s.size() == 1);
    }

    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed > 0 ? 1 : 0;
}
