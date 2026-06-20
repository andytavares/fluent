#include <iostream>

class Rectangle {
public:
    double width;
    double height;

    Rectangle(double w, double h) : width(w), height(h) {}

    // area returns width * height.
    double area() const {
        // TODO
        return 0.0;
    }

    // perimeter returns 2 * (width + height).
    double perimeter() const {
        // TODO
        return 0.0;
    }

    // isSquare returns true if width == height.
    bool isSquare() const {
        // TODO
        return false;
    }
};

int main() {
    Rectangle r(3.0, 4.0);
    std::cout << "area:      " << r.area()      << "\n";
    std::cout << "perimeter: " << r.perimeter() << "\n";
    std::cout << "isSquare:  " << r.isSquare()  << "\n";
    return 0;
}
