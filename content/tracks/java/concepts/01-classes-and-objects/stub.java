public class Solution {

    public static class Rectangle {
        private final double width;
        private final double height;

        public Rectangle(double width, double height) {
            this.width = width;
            this.height = height;
        }

        // getArea returns width * height.
        public double getArea() {
            // TODO
            return 0;
        }

        // getPerimeter returns 2 * (width + height).
        public double getPerimeter() {
            // TODO
            return 0;
        }

        // isSquare returns true if width equals height.
        public boolean isSquare() {
            // TODO
            return false;
        }

        @Override
        public String toString() {
            // TODO: return "Rectangle(width=W, height=H)"
            return "";
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
