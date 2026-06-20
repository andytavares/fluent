public class Solution {

    public static abstract class Shape {
        // area returns the area of this shape.
        public abstract double area();

        // describe returns "Shape with area <area>" formatted to 2 decimal places.
        public String describe() {
            // TODO
            return "";
        }
    }

    public static class Circle extends Shape {
        private final double radius;

        public Circle(double radius) {
            this.radius = radius;
        }

        @Override
        public double area() {
            // TODO
            return 0;
        }
    }

    public static class Rectangle extends Shape {
        private final double width;
        private final double height;

        public Rectangle(double width, double height) {
            this.width = width;
            this.height = height;
        }

        @Override
        public double area() {
            // TODO
            return 0;
        }
    }

    // totalArea returns the sum of area() for every shape in the array.
    public static double totalArea(Shape[] shapes) {
        // TODO
        return 0;
    }

    // classifyShape returns "circle", "rectangle", or "unknown".
    public static String classifyShape(Shape s) {
        // TODO
        return "";
    }

    public static void main(String[] args) {
        Shape c = new Circle(5);
        Shape r = new Rectangle(3, 4);
        System.out.println(c.describe());
        System.out.println(r.describe());
        System.out.println(totalArea(new Shape[]{c, r}));
        System.out.println(classifyShape(c));
        System.out.println(classifyShape(r));
    }
}
