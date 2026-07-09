class Solution {

    /**
     * Returns the sum of two binary strings as a binary string.
     * Inputs may be hundreds of digits — numeric conversion loses precision.
     */
    public static String addBinary(String a, String b) {
        // TODO: walk both strings from the back with a carry;
        // digit = sum & 1, carry = sum >> 1; loop while i >= 0 || j >= 0 || carry != 0;
        // append to a StringBuilder and reverse at the end
        return "";
    }

    /**
     * Returns the number of set bits in the 32-bit representation of n.
     */
    public static int hammingWeight(int n) {
        // TODO: clear the lowest set bit with n & (n - 1) until n is 0,
        // counting iterations — no normalization needed for negative n
        return 0;
    }

    /**
     * Returns the element that appears exactly once (all others appear twice).
     * O(n) time, O(1) space — no HashMap/HashSet.
     */
    public static int singleNumber(int[] nums) {
        // TODO: XOR-fold the array — pairs cancel (x ^ x == 0), the singleton survives
        return 0;
    }

    /**
     * Returns the bitwise AND of every integer in [left, right].
     */
    public static int rangeBitwiseAnd(int left, int right) {
        // TODO: the answer is the common binary prefix — shift both right (>>>)
        // until left == right, counting shifts, then shift back left
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(addBinary("1010", "1011")); // 10101
        System.out.println(hammingWeight(11)); // 3
        System.out.println(hammingWeight(0x80000000)); // 1
        System.out.println(singleNumber(new int[]{4, 1, 2, 1, 2})); // 4
        System.out.println(rangeBitwiseAnd(5, 7)); // 4
    }
}
