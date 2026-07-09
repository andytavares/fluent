// Demo: g++ -std=c++17 stub.cpp && ./a.out
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
    // TODO: constructor(double radius) — store radius in radius_
    explicit Circle(double radius) {
    }

    // TODO: double area() const override — return M_PI * radius_ * radius_
    double area() const {
        return 0.0;
    }

    // TODO: std::string name() const override — return "Circle"
    std::string name() const {
        return "";
    }

private:
    double radius_ = 0.0;
};

class Rectangle : public Shape {
public:
    // TODO: constructor(double w, double h) — store both in w_ and h_
    Rectangle(double w, double h) {
    }

    // TODO: double area() const override — return w_ * h_
    double area() const {
        return 0.0;
    }

    // TODO: std::string name() const override — return "Rectangle"
    std::string name() const {
        return "";
    }

private:
    double w_ = 0.0, h_ = 0.0;
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

#include <iostream>
int main() {
    Circle    c(3.0);
    Rectangle r(4.0, 5.0);
    std::vector<Shape*> v = {&c, &r};
    std::cout << "totalArea:   " << totalArea(v)   << "\n";
    std::cout << "largestName: " << largestName(v) << "\n";
    return 0;
}
