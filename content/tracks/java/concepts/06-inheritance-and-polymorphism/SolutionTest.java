public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        Solution.Circle c = new Solution.Circle(5);
        Solution.Rectangle r = new Solution.Rectangle(3, 4);

        // area
        check("Circle.area: pi*r^2", Math.abs(c.area() - Math.PI * 25) < 1e-9);
        check("Rectangle.area: w*h", Math.abs(r.area() - 12.0) < 1e-9);

        // describe
        String expectedCircle = String.format("Shape with area %.2f", Math.PI * 25);
        String expectedRect   = String.format("Shape with area %.2f", 12.0);
        check("Circle.describe format",    expectedCircle.equals(c.describe()));
        check("Rectangle.describe format", expectedRect.equals(r.describe()));

        // polymorphic dispatch
        Solution.Shape s = new Solution.Circle(1);
        check("polymorphic dispatch",
              Math.abs(s.area() - Math.PI) < 1e-9);

        // totalArea
        Solution.Shape[] shapes = { c, r };
        double total = Solution.totalArea(shapes);
        check("totalArea: sum of both",
              Math.abs(total - (Math.PI * 25 + 12.0)) < 1e-9);

        check("totalArea: empty array", Solution.totalArea(new Solution.Shape[]{}) == 0.0);

        // classifyShape
        check("classifyShape: circle",    "circle".equals(Solution.classifyShape(c)));
        check("classifyShape: rectangle", "rectangle".equals(Solution.classifyShape(r)));

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
