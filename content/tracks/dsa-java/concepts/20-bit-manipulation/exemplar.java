class Solution {

    /**
     * Adds two binary strings column by column with a carry — grade-school
     * addition on characters, so 200-digit inputs are no problem (numeric
     * conversion would overflow int and long alike).
     * O(max(m, n)) time and space.
     */
    public static String addBinary(String a, String b) {
        StringBuilder digits = new StringBuilder();
        int carry = 0;
        int i = a.length() - 1;
        int j = b.length() - 1;
        while (i >= 0 || j >= 0 || carry != 0) {
            int sum = carry;
            if (i >= 0) sum += a.charAt(i--) - '0';
            if (j >= 0) sum += b.charAt(j--) - '0';
            digits.append((char) ('0' + (sum & 1)));
            carry = sum >> 1;
        }
        return digits.reverse().toString();
    }

    /**
     * Population count via n & (n - 1), which clears exactly the lowest set
     * bit per iteration — O(set bits), not O(32). Works unchanged for
     * negative n (Java's int is always a 32-bit two's-complement pattern,
     * so there's no sign normalization to do).
     */
    public static int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n = n & (n - 1);
            count++;
        }
        return count;
    }

    /**
     * XOR-fold: x ^ x == 0 and x ^ 0 == x, so every pair annihilates and
     * only the singleton survives. Negatives work unchanged — XOR sees only
     * the two's-complement bit pattern.
     * O(n) time, O(1) space.
     */
    public static int singleNumber(int[] nums) {
        int result = 0;
        for (int x : nums) result ^= x;
        return result;
    }

    /**
     * AND of [left, right] is the common binary prefix of the endpoints:
     * below the highest differing bit, every pattern occurs somewhere in the
     * range, so those bits all AND to zero. Shift to the prefix, shift back.
     * O(log n) time, O(1) space.
     */
    public static int rangeBitwiseAnd(int left, int right) {
        int shift = 0;
        while (left < right) {
            left >>>= 1;
            right >>>= 1;
            shift++;
        }
        return left << shift;
    }

    public static void main(String[] args) {
        System.out.println(addBinary("1010", "1011")); // 10101
        System.out.println(hammingWeight(11)); // 3
        System.out.println(hammingWeight(0x80000000)); // 1
        System.out.println(singleNumber(new int[]{4, 1, 2, 1, 2})); // 4
        System.out.println(rangeBitwiseAnd(5, 7)); // 4
    }
}
