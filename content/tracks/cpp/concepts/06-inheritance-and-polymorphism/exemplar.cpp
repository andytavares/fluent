// Demo: g++ -std=c++17 -DDEMO exemplar.cpp && ./a.out
#include <cmath>
#include <string>
#include <vector>

class Shape {
public:
    virtual double      area() const = 0;
    virtual std::string name() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    explicit Circle(double radius) : radius_(radius) {}

    double      area() const override { return M_PI * radius_ * radius_; }
    std::string name() const override { return "Circle"; }

private:
    double radius_;
};

class Rectangle : public Shape {
public:
    Rectangle(double w, double h) : w_(w), h_(h) {}

    double      area() const override { return w_ * h_; }
    std::string name() const override { return "Rectangle"; }

private:
    double w_, h_;
};

double totalArea(const std::vector<Shape*>& shapes) {
    double sum = 0.0;
    for (const Shape* s : shapes) sum += s->area();
    return sum;
}

std::string largestName(const std::vector<Shape*>& shapes) {
    const Shape* best = shapes[0];
    for (const Shape* s : shapes) {
        if (s->area() > best->area()) best = s;
    }
    return best->name();
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
