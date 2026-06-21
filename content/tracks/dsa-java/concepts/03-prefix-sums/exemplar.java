import java.util.HashMap;

class Solution {

    public static int[] buildPrefixSum(int[] nums) {
        int[] prefix = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }
        return prefix;
    }

    public static int rangeSum(int[] prefix, int i, int j) {
        return prefix[j + 1] - prefix[i];
    }

    public static int subarraySumEqualsK(int[] nums, int k) {
        var counts = new HashMap<Integer, Integer>();
        counts.put(0, 1);
        int sum = 0, result = 0;
        for (int n : nums) {
            sum += n;
            result += counts.getOrDefault(sum - k, 0);
            counts.merge(sum, 1, Integer::sum);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] prefix = buildPrefixSum(new int[]{1, 2, 3, 4, 5});
        System.out.println(rangeSum(prefix, 1, 3)); // 9 (2+3+4)
        System.out.println(subarraySumEqualsK(new int[]{1,1,1}, 2)); // 2
    }
}
