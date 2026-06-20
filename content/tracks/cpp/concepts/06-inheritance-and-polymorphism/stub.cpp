// Demo: g++ -std=c++17 -DDEMO stub.cpp && ./a.out
#include <cmath>
#include <string>
#include <vector>

// Abstract base class — cannot be instantiated directly.
class Shape {
public:
    // TODO: declare pure virtual double area() const
    // TODO: declare pure virtual std::string name() const
    // TODO: declare virtual destructor
};

class Circle : public Shape {
public:
    // TODO: constructor(double radius)
    // TODO: double area() const override
    // TODO: std::string name() const override
};

class Rectangle : public Shape {
public:
    // TODO: constructor(double w, double h)
    // TODO: double area() const override
    // TODO: std::string name() const override
};

// Returns the sum of area() for every shape in the vector.
double totalArea(const std::vector<Shape*>& shapes) {
    // TODO
    return 0.0;
}

// Returns the name() of the shape with the greatest area().
// Assumes shapes is non-empty.
std::string largestName(const std::vector<Shape*>& shapes) {
    // TODO
    return "";
}

#ifdef DEMO
#include <iostream>
int main() {
    Circle    c(3.0);
    Rectangle r(4.0, 5.0);
    std::vector<Shape*> v = {&c, &r};
    std::cout << "totalArea:   " << totalArea(v)   << "\n";
    std::cout << "largestName: " << largestName(v) << "\n";
    return 0;
}
#endif
