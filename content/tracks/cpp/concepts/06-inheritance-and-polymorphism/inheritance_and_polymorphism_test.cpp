/*
 * Build: g++ -std=c++17 -o test stub.cpp inheritance_and_polymorphism_test.cpp && ./test
 */
#include <iostream>
#include <cmath>
#include <string>
#include <vector>

// Forward declarations — learner's types compiled in from stub.cpp.
class Shape;
class Circle;
class Rectangle;
double      totalArea(const std::vector<Shape*>& shapes);
std::string largestName(const std::vector<Shape*>& shapes);

static int passed = 0, failed = 0;

void check(const std::string& name, bool condition) {
    if (condition) { std::cout << "  PASS: " << name << "\n"; ++passed; }
    else           { std::cout << "  FAIL: " << name << "\n"; ++failed; }
}

void checkClose(const std::string& name, double expected, double actual, double eps = 1e-6) {
    check(name, std::abs(expected - actual) < eps);
}

int main() {
    // Circle area and name
    {
        Circle c(1.0);
        checkClose("Circle area r=1",  M_PI,       c.area());
        checkClose("Circle area r=3",  M_PI * 9.0, Circle(3.0).area());
        check("Circle name",           c.name() == "Circle");
    }

    // Rectangle area and name
    {
        Rectangle r(4.0, 5.0);
        checkClose("Rectangle area 4x5", 20.0, r.area());
        checkClose("Rectangle area 1x1",  1.0, Rectangle(1.0, 1.0).area());
        check("Rectangle name", r.name() == "Rectangle");
    }

    // totalArea — single element
    {
        Circle c(2.0);
        std::vector<Shape*> v = {&c};
        checkClose("totalArea single Circle", M_PI * 4.0, totalArea(v));
    }

    // totalArea — mixed shapes
    {
        Circle    c(1.0);
        Rectangle r(3.0, 3.0);
        std::vector<Shape*> v = {&c, &r};
        checkClose("totalArea Circle + Rectangle", M_PI + 9.0, totalArea(v));
    }

    // largestName — Rectangle wins
    {
        Circle    c(1.0);
        Rectangle r(10.0, 10.0);
        std::vector<Shape*> v = {&c, &r};
        check("largestName Rectangle wins", largestName(v) == "Rectangle");
    }

    // largestName — Circle wins
    {
        Circle    c(10.0);
        Rectangle r(1.0, 1.0);
        std::vector<Shape*> v = {&c, &r};
        check("largestName Circle wins", largestName(v) == "Circle");
    }

    // Dynamic dispatch through base pointer
    {
        Shape* s = new Circle(2.0);
        checkClose("dynamic dispatch Circle area", M_PI * 4.0, s->area());
        check("dynamic dispatch Circle name", s->name() == "Circle");
        delete s;
    }

    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed > 0 ? 1 : 0;
}
