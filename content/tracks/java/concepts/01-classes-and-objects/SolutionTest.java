public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static void checkDouble(String name, double expected, double actual) {
        check(name, Math.abs(expected - actual) < 1e-9);
    }

    public static void main(String[] args) {
        Solution.Rectangle r1 = new Solution.Rectangle(3, 4);
        checkDouble("area 3×4",      12.0, r1.getArea());
        checkDouble("perimeter 3×4", 14.0, r1.getPerimeter());
        check("isSquare 3×4 → false", !r1.isSquare());
        check("toString 3×4", "Rectangle(width=3.0, height=4.0)".equals(r1.toString()));

        Solution.Rectangle r2 = new Solution.Rectangle(5, 5);
        checkDouble("area 5×5",      25.0, r2.getArea());
        checkDouble("perimeter 5×5", 20.0, r2.getPerimeter());
        check("isSquare 5×5 → true",  r2.isSquare());
        check("toString 5×5", "Rectangle(width=5.0, height=5.0)".equals(r2.toString()));

        Solution.Rectangle r3 = new Solution.Rectangle(0, 7);
        checkDouble("area 0×7",      0.0,  r3.getArea());
        checkDouble("perimeter 0×7", 14.0, r3.getPerimeter());
        check("isSquare 0×7 → false", !r3.isSquare());

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
