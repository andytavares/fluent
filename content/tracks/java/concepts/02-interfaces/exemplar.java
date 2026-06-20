public class Solution {

    public interface Shape {
        double area();
        double perimeter();
        String name();
    }

    public static class Circle implements Shape {
        private final double radius;

        public Circle(double radius) { this.radius = radius; }

        @Override public double area()      { return Math.PI * radius * radius; }
        @Override public double perimeter() { return 2 * Math.PI * radius; }
        @Override public String name()      { return "Circle"; }
    }

    public static class Rectangle implements Shape {
        private final double width;
        private final double height;

        public Rectangle(double width, double height) {
            this.width = width;
            this.height = height;
        }

        @Override public double area()      { return width * height; }
        @Override public double perimeter() { return 2 * (width + height); }
        @Override public String name()      { return "Rectangle"; }
    }

    public static Shape larger(Shape a, Shape b) {
        return a.area() >= b.area() ? a : b;
    }

    public static void main(String[] args) {
        Shape c = new Circle(5);
        Shape r = new Rectangle(4, 6);
        System.out.printf("Circle area: %.4f%n", c.area());
        System.out.printf("Rectangle area: %.4f%n", r.area());
        System.out.println("Larger: " + larger(c, r).name());
    }
}
