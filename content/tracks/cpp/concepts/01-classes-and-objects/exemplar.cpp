#include <iostream>

class Rectangle {
public:
    double width;
    double height;

    Rectangle(double w, double h) : width(w), height(h) {}

    double area() const {
        return width * height;
    }

    double perimeter() const {
        return 2.0 * (width + height);
    }

    bool isSquare() const {
        return width == height;
    }
};

int main() {
    Rectangle r(3.0, 4.0);
    std::cout << "area:      " << r.area()      << "\n";
    std::cout << "perimeter: " << r.perimeter() << "\n";
    std::cout << "isSquare:  " << r.isSquare()  << "\n";
    return 0;
}
