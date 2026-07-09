class Solution {

    /**
     * Returns the largest sum of any contiguous non-empty subarray.
     */
    public static int maxSubArray(int[] nums) {
        // TODO: Kadane — endingHere = max(nums[i], endingHere + nums[i]);
        // fold into best each step. Seed BOTH with nums[0], not 0
        // (all-negative arrays!)
        return 0;
    }

    /**
     * Returns the largest sum of any non-empty subarray of the CIRCULAR array
     * (may wrap past the end; each element used at most once).
     */
    public static int maxSubarraySumCircular(int[] nums) {
        // TODO: one pass computing maxKadane, minKadane (same recurrence with
        // min), and total; wrap answer = total - minKadane.
        // Guard: if maxKadane < 0 (all negative) the wrap would be empty —
        // return maxKadane directly
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxSubArray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4})); // 6
        System.out.println(maxSubArray(new int[]{-3, -1, -2}));                    // -1

        System.out.println(maxSubarraySumCircular(new int[]{1, -2, 3, -2})); // 3
        System.out.println(maxSubarraySumCircular(new int[]{5, -3, 5}));     // 10
        System.out.println(maxSubarraySumCircular(new int[]{-3, -2, -3}));   // -2
    }
}
