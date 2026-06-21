import java.util.HashMap;

class Solution {

    public static int[] buildPrefixSum(int[] nums) {
        // TODO
        return new int[0];
    }

    public static int rangeSum(int[] prefix, int i, int j) {
        // TODO
        return 0;
    }

    public static int subarraySumEqualsK(int[] nums, int k) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        int[] prefix = buildPrefixSum(new int[]{1, 2, 3, 4, 5});
        System.out.println(rangeSum(prefix, 1, 3)); // 9 (2+3+4)
        System.out.println(subarraySumEqualsK(new int[]{1,1,1}, 2)); // 2
    }
}
