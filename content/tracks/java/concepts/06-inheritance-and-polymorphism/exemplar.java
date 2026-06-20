public class Solution {

    public static abstract class Shape {
        public abstract double area();

        public String describe() {
            return String.format("Shape with area %.2f", area());
        }
    }

    public static class Circle extends Shape {
        private final double radius;

        public Circle(double radius) {
            this.radius = radius;
        }

        @Override
        public double area() {
            return Math.PI * radius * radius;
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
            return width * height;
        }
    }

    public static double totalArea(Shape[] shapes) {
        double sum = 0;
        for (Shape s : shapes) {
            sum += s.area();
        }
        return sum;
    }

    public static String classifyShape(Shape s) {
        if (s instanceof Circle c) {
            return "circle";
        } else if (s instanceof Rectangle r) {
            return "rectangle";
        }
        return "unknown";
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
