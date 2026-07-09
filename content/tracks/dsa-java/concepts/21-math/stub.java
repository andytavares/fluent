class Solution {

    /**
     * Returns true if the integer x reads the same forwards and backwards.
     * No string conversion — digit arithmetic only.
     */
    public static boolean isPalindromeNumber(int x) {
        // TODO: guard negatives and trailing zeros (except 0 itself), then
        // reverse the back half with rev = rev * 10 + x % 10 while x > rev
        return false;
    }

    /**
     * Returns the digit array of the given big-endian digit array plus one.
     */
    public static int[] plusOne(int[] digits) {
        // TODO: walk from the last digit; digit < 9 -> increment and return,
        // digit 9 -> set to 0 and carry on; all nines -> new array, 1 followed by zeros
        return new int[]{};
    }

    /**
     * Returns the integer square root of x, rounded down.
     * No Math.sqrt / Math.pow — binary-search the answer.
     */
    public static int mySqrt(int x) {
        // TODO: binary search [1, x/2] for the largest m with m * m <= x
        // (handle x < 2 first; compute the square in long to avoid overflow;
        // return hi after the loop)
        return 0;
    }

    /**
     * Returns x raised to the integer power n in O(log |n|).
     * No Math.pow — binary exponentiation.
     */
    public static double myPow(double x, int n) {
        // TODO: widen n to long BEFORE checking its sign (Integer.MIN_VALUE
        // can't be negated as an int); if negative, invert base and negate;
        // then square-and-multiply
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(isPalindromeNumber(121)); // true
        System.out.println(java.util.Arrays.toString(plusOne(new int[]{9, 9, 9}))); // [1,0,0,0]
        System.out.println(mySqrt(8)); // 2
        System.out.println(myPow(2, 10)); // 1024.0
    }
}
