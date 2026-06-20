public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static void checkDouble(String name, double expected, double actual, double eps) {
        check(name, Math.abs(expected - actual) < eps);
    }

    public static void main(String[] args) {
        Solution.Circle c = new Solution.Circle(5);
        checkDouble("circle area r=5",      Math.PI * 25, c.area(),      1e-9);
        checkDouble("circle perimeter r=5", 10 * Math.PI, c.perimeter(), 1e-9);
        check("circle name", "Circle".equals(c.name()));

        Solution.Rectangle r = new Solution.Rectangle(4, 6);
        checkDouble("rect area 4×6",      24.0, r.area(),      1e-9);
        checkDouble("rect perimeter 4×6", 20.0, r.perimeter(), 1e-9);
        check("rect name", "Rectangle".equals(r.name()));

        // larger
        Solution.Shape big   = new Solution.Circle(10);
        Solution.Shape small = new Solution.Rectangle(1, 1);
        check("larger returns circle",     "Circle".equals(Solution.larger(big, small).name()));
        check("larger returns rect",       "Rectangle".equals(Solution.larger(small, big).name()));
        check("larger equal areas → a",    Solution.larger(small, small) == small);

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
