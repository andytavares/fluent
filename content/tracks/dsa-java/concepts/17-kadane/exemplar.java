class Solution {

    /**
     * Kadane's algorithm: endingHere is the best sum of a subarray ending
     * exactly at i — extend the previous run or start fresh, whichever is
     * larger (fresh wins exactly when the run went negative). best folds the
     * optimum over all endpoints. Seeding with nums[0] (not 0) keeps the
     * subarray non-empty on all-negative input.
     * O(n) time, O(1) space.
     */
    public static int maxSubArray(int[] nums) {
        int endingHere = nums[0];
        int best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            endingHere = Math.max(nums[i], endingHere + nums[i]);
            best = Math.max(best, endingHere);
        }
        return best;
    }

    /**
     * Circular variant: the answer either doesn't wrap (plain Kadane) or wraps —
     * and a wrapping subarray is the complement of a contiguous middle, so its
     * best sum is total - minKadane. All four quantities come from one pass.
     * Guard: if every element is negative (maxKadane < 0), the "wrap" would be
     * the empty subarray — return the plain Kadane answer.
     * O(n) time, O(1) space.
     */
    public static int maxSubarraySumCircular(int[] nums) {
        int maxEndingHere = nums[0];
        int maxKadane = nums[0];
        int minEndingHere = nums[0];
        int minKadane = nums[0];
        int total = nums[0];
        for (int i = 1; i < nums.length; i++) {
            maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
            maxKadane = Math.max(maxKadane, maxEndingHere);
            minEndingHere = Math.min(nums[i], minEndingHere + nums[i]);
            minKadane = Math.min(minKadane, minEndingHere);
            total += nums[i];
        }
        if (maxKadane < 0) return maxKadane; // all negative — a wrap would be empty
        return Math.max(maxKadane, total - minKadane);
    }

    public static void main(String[] args) {
        System.out.println(maxSubArray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4})); // 6
        System.out.println(maxSubArray(new int[]{-3, -1, -2}));                    // -1

        System.out.println(maxSubarraySumCircular(new int[]{1, -2, 3, -2})); // 3
        System.out.println(maxSubarraySumCircular(new int[]{5, -3, 5}));     // 10
        System.out.println(maxSubarraySumCircular(new int[]{-3, -2, -3}));   // -2
    }
}
