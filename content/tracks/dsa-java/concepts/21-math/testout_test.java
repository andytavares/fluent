public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static boolean close(double actual, double expected, double tolFactor) {
        double tol = tolFactor * Math.max(1, Math.abs(expected));
        return Math.abs(actual - expected) <= tol;
    }

    static boolean close(double actual, double expected) {
        return close(actual, expected, 1e-9);
    }

    static boolean twentyNinesPlusOne() {
        int[] twentyNines = new int[20];
        java.util.Arrays.fill(twentyNines, 9);
        int[] expected = new int[21];
        expected[0] = 1;
        return java.util.Arrays.equals(Solution.plusOne(twentyNines), expected);
    }

    static boolean fortyDigitMidArrayCarryStop() {
        int[] digits = new int[40];
        digits[0] = 5;
        for (int i = 1; i < 40; i++) digits[i] = 9;
        int[] expected = new int[40];
        expected[0] = 6;
        return java.util.Arrays.equals(Solution.plusOne(digits), expected);
    }

    static boolean sqrtExhaustiveSweep() {
        for (int x = 0; x <= 2000; x++) {
            int expected = (int) Math.floor(Math.sqrt((double) x));
            if (Solution.mySqrt(x) != expected) return false;
        }
        return true;
    }

    static boolean sqrtSquaresAndOffByOnes() {
        int[] roots = {1000, 4321, 46340};
        for (int r : roots) {
            if (Solution.mySqrt(r * r) != r) return false;
            if (Solution.mySqrt(r * r - 1) != r - 1) return false;
            if (Solution.mySqrt(r * r + 1) != r) return false;
        }
        return true;
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
        check("isPalindromeNumber: large even-length palindrome",
              Solution.isPalindromeNumber(2147447412) == true);
        check("isPalindromeNumber: large non-palindrome",
              Solution.isPalindromeNumber(1234567899) == false);
        check("isPalindromeNumber: negative single digit",
              Solution.isPalindromeNumber(-7) == false);

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
        check("plusOne: 40-digit number with a mid-array carry stop", fortyDigitMidArrayCarryStop());

        // mySqrt
        check("mySqrt: perfect square", Solution.mySqrt(4) == 2);
        check("mySqrt: rounds down", Solution.mySqrt(8) == 2);
        check("mySqrt: zero", Solution.mySqrt(0) == 0);
        check("mySqrt: one", Solution.mySqrt(1) == 1);
        check("mySqrt: two", Solution.mySqrt(2) == 1);
        check("mySqrt: one below a perfect square", Solution.mySqrt(15) == 3);
        check("mySqrt: exactly a perfect square boundary", Solution.mySqrt(16) == 4);
        check("mySqrt: large non-square near 2^31", Solution.mySqrt(2147395599) == 46339);
        check("mySqrt: max 32-bit int", Solution.mySqrt(2147483647) == 46340);
        check("mySqrt: exhaustive sweep 0..2000", sqrtExhaustiveSweep());
        check("mySqrt: squares and off-by-ones of large roots", sqrtSquaresAndOffByOnes());

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
        check("myPow: near-one base with a huge exponent (O(n) loops time out)",
              close(Solution.myPow(1.0000000001, 2147483647),
                    Math.pow(1.0000000001, 2147483647), 1e-6));
        check("myPow: fractional base, deep negative exponent",
              close(Solution.myPow(0.5, -10), 1024));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
