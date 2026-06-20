public class Solution {

    public static class Rectangle {
        private final double width;
        private final double height;

        public Rectangle(double width, double height) {
            this.width = width;
            this.height = height;
        }

        public double getArea() {
            return width * height;
        }

        public double getPerimeter() {
            return 2 * (width + height);
        }

        public boolean isSquare() {
            return width == height;
        }

        @Override
        public String toString() {
            return "Rectangle(width=" + width + ", height=" + height + ")";
        }
    }

    public static void main(String[] args) {
        Rectangle r = new Rectangle(3, 4);
        System.out.println(r.getArea());
        System.out.println(r.getPerimeter());
        System.out.println(r.isSquare());
        System.out.println(r);
    }
}
