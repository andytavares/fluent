public class Solution {

    public interface Shape {
        double area();
        double perimeter();
        String name();
    }

    public static class Circle implements Shape {
        private final double radius;

        public Circle(double radius) {
            this.radius = radius;
        }

        @Override
        public double area() {
            // TODO: Math.PI * radius * radius
            return 0;
        }

        @Override
        public double perimeter() {
            // TODO: 2 * Math.PI * radius
            return 0;
        }

        @Override
        public String name() {
            // TODO
            return "";
        }
    }

    public static class Rectangle implements Shape {
        private final double width;
        private final double height;

        public Rectangle(double width, double height) {
            this.width = width;
            this.height = height;
        }

        @Override
        public double area() {
            // TODO: width * height
            return 0;
        }

        @Override
        public double perimeter() {
            // TODO: 2 * (width + height)
            return 0;
        }

        @Override
        public String name() {
            // TODO
            return "";
        }
    }

    // larger returns whichever shape has the larger area (return a if equal).
    public static Shape larger(Shape a, Shape b) {
        // TODO
        return null;
    }

    public static void main(String[] args) {
        Shape c = new Circle(5);
        Shape r = new Rectangle(4, 6);
        System.out.printf("Circle area: %.4f%n", c.area());
        System.out.printf("Rectangle area: %.4f%n", r.area());
        System.out.println("Larger: " + larger(c, r).name());
    }
}
