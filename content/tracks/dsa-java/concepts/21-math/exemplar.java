class Solution {

    /**
     * Returns true if the integer x reads the same forwards and backwards.
     * Reverses only the back half: the loop stops once the reversed part has
     * at least as many digits as what's left, so nothing overflows and half
     * the work is skipped.
     * O(log10 x) time, O(1) space.
     */
    public static boolean isPalindromeNumber(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) return false;
        int rev = 0;
        while (x > rev) {
            rev = rev * 10 + (x % 10);
            x = x / 10;
        }
        // even digit count -> halves match; odd -> drop rev's middle digit
        return x == rev || x == rev / 10;
    }

    /**
     * Returns the digit array of the given big-endian digit array plus one.
     * Carry propagation from the back: the first non-9 digit absorbs the
     * carry; all-nines grows the array by one.
     * O(n) worst case, one digit touched in the common case.
     */
    public static int[] plusOne(int[] digits) {
        int[] result = digits.clone();
        for (int i = result.length - 1; i >= 0; i--) {
            if (result[i] < 9) {
                result[i]++;
                return result;
            }
            result[i] = 0;
        }
        int[] grown = new int[result.length + 1];
        grown[0] = 1;
        return grown;
    }

    /**
     * Returns the integer square root of x, rounded down.
     * Binary search on the answer space: mid*mid <= x is monotone in mid,
     * and hi lands on the last value that satisfies it. Done in long because
     * mid*mid overflows int near x = Integer.MAX_VALUE.
     * O(log x) time, O(1) space.
     */
    public static int mySqrt(int x) {
        if (x < 2) return x;
        long lo = 1, hi = x / 2;
        while (lo <= hi) {
            long mid = lo + (hi - lo) / 2;
            long sq = mid * mid;
            if (sq == x) return (int) mid;
            if (sq < x) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return (int) hi;
    }

    /**
     * Returns x raised to the integer power n by binary exponentiation.
     * One squaring per binary digit of n. The exponent is widened to long
     * before any sign flip because n == Integer.MIN_VALUE can't be negated
     * as an int without overflowing back to itself.
     * O(log |n|) time, O(1) space.
     */
    public static double myPow(double x, int n) {
        long exp = n; // widen before checking sign
        if (exp < 0) {
            x = 1 / x;
            exp = -exp;
        }
        double result = 1;
        while (exp > 0) {
            if (exp % 2 == 1) result *= x;
            x *= x;
            exp /= 2;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(isPalindromeNumber(121)); // true
        System.out.println(java.util.Arrays.toString(plusOne(new int[]{9, 9, 9}))); // [1,0,0,0]
        System.out.println(mySqrt(8)); // 2
        System.out.println(myPow(2, 10)); // 1024.0
    }
}
