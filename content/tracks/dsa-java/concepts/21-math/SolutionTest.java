public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static boolean close(double actual, double expected) {
        double tol = 1e-9 * Math.max(1, Math.abs(expected));
        return Math.abs(actual - expected) <= tol;
    }

    static boolean twentyNinesPlusOne() {
        int[] twentyNines = new int[20];
        java.util.Arrays.fill(twentyNines, 9);
        int[] expected = new int[21];
        expected[0] = 1;
        return java.util.Arrays.equals(Solution.plusOne(twentyNines), expected);
    }

    public static void main(String[] args) {
        // isPalindromeNumber
        check("isPalindromeNumber: classic palindrome",
              Solution.isPalindromeNumber(121) == true);
        check("isPalindromeNumber: negative is never a palindrome",
              Solution.isPalindromeNumber(-121) == false);
        check("isPalindromeNumber: trailing zero",
              Solution.isPalindromeNumber(10) == false);
        check("isPalindromeNumber: zero",
              Solution.isPalindromeNumber(0) == true);
        check("isPalindromeNumber: single digit",
              Solution.isPalindromeNumber(7) == true);
        check("isPalindromeNumber: even digit count",
              Solution.isPalindromeNumber(1221) == true);
        check("isPalindromeNumber: odd digit count",
              Solution.isPalindromeNumber(12321) == true);
        check("isPalindromeNumber: not a palindrome",
              Solution.isPalindromeNumber(123) == false);
        check("isPalindromeNumber: near-palindrome with inner zeros",
              Solution.isPalindromeNumber(1000021) == false);
        check("isPalindromeNumber: 10-digit palindrome",
              Solution.isPalindromeNumber(1000000001) == true);

        // plusOne
        check("plusOne: no carry",
              java.util.Arrays.equals(Solution.plusOne(new int[]{1, 2, 3}), new int[]{1, 2, 4}));
        check("plusOne: last digit below nine",
              java.util.Arrays.equals(Solution.plusOne(new int[]{4, 3, 2, 1}), new int[]{4, 3, 2, 2}));
        check("plusOne: single nine grows",
              java.util.Arrays.equals(Solution.plusOne(new int[]{9}), new int[]{1, 0}));
        check("plusOne: all nines grow by one digit",
              java.util.Arrays.equals(Solution.plusOne(new int[]{9, 9, 9}), new int[]{1, 0, 0, 0}));
        check("plusOne: zero",
              java.util.Arrays.equals(Solution.plusOne(new int[]{0}), new int[]{1}));
        check("plusOne: carry through trailing nines",
              java.util.Arrays.equals(Solution.plusOne(new int[]{8, 9, 9}), new int[]{9, 0, 0}));
        check("plusOne: carry stops after one digit",
              java.util.Arrays.equals(Solution.plusOne(new int[]{1, 9}), new int[]{2, 0}));
        check("plusOne: 20 digits — past a typical numeric round trip", twentyNinesPlusOne());

        // mySqrt
        check("mySqrt: perfect square", Solution.mySqrt(4) == 2);
        check("mySqrt: rounds down", Solution.mySqrt(8) == 2);
        check("mySqrt: zero", Solution.mySqrt(0) == 0);
        check("mySqrt: one", Solution.mySqrt(1) == 1);
        check("mySqrt: two", Solution.mySqrt(2) == 1);
        check("mySqrt: one below a perfect square", Solution.mySqrt(15) == 3);
        check("mySqrt: exactly a perfect square boundary", Solution.mySqrt(16) == 4);
        check("mySqrt: hundred", Solution.mySqrt(100) == 10);
        check("mySqrt: large non-square near 2^31", Solution.mySqrt(2147395599) == 46339);
        check("mySqrt: max 32-bit int", Solution.mySqrt(2147483647) == 46340);

        // myPow
        check("myPow: integer base, positive exponent", close(Solution.myPow(2, 10), 1024));
        check("myPow: another exact power", close(Solution.myPow(3, 4), 81));
        check("myPow: float base", close(Solution.myPow(2.1, 3), 9.261));
        check("myPow: negative exponent", close(Solution.myPow(2, -2), 0.25));
        check("myPow: exponent zero", close(Solution.myPow(5, 0), 1));
        check("myPow: zero to the zero is one by convention", close(Solution.myPow(0, 0), 1));
        check("myPow: zero base, positive exponent", close(Solution.myPow(0, 5), 0));
        check("myPow: negative base, odd exponent", close(Solution.myPow(-2, 3), -8));
        check("myPow: negative base, even exponent", close(Solution.myPow(-2, 4), 16));
        check("myPow: base one with a huge exponent (must be O(log n))",
              close(Solution.myPow(1, 2147483647), 1));
        check("myPow: huge negative exponent underflows to zero",
              close(Solution.myPow(2, Integer.MIN_VALUE), 0));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
