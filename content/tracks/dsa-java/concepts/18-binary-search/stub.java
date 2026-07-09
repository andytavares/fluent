class Solution {

    /**
     * Returns the index of target in sorted, distinct nums, or the index where
     * it would be inserted to keep nums sorted.
     */
    public static int searchInsert(int[] nums, int target) {
        // TODO: lower bound — left = 0, right = nums.length, loop while left < right;
        // nums[mid] < target -> left = mid + 1, else right = mid; return left
        return 0;
    }

    /**
     * Returns the index of any peak (strictly greater than both neighbors;
     * outside the array counts as -Infinity).
     */
    public static int findPeakElement(int[] nums) {
        // TODO: while left < right, compare nums[mid] with nums[mid + 1];
        // rising slope -> left = mid + 1, falling -> right = mid; return left
        return 0;
    }

    /**
     * Returns the index of target in a rotated sorted array of distinct values,
     * or -1 if absent.
     */
    public static int searchRotated(int[] nums, int target) {
        // TODO: exact-match template; nums[left] <= nums[mid] tells you which half
        // is sorted, then range-check target against that half to pick a side
        return -1;
    }

    /**
     * Returns [first, last] indexes of target in a sorted array with duplicates,
     * or [-1, -1] if absent.
     */
    public static int[] searchRange(int[] nums, int target) {
        // TODO: lowerBound(target) gives first (verify it actually holds target);
        // lowerBound(target + 1) - 1 gives last
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        System.out.println(searchInsert(new int[]{1, 3, 5, 6}, 5)); // 2
        System.out.println(searchInsert(new int[]{1, 3, 5, 6}, 2)); // 1
        System.out.println(findPeakElement(new int[]{1, 2, 3, 1})); // 2
        System.out.println(searchRotated(new int[]{4, 5, 6, 7, 0, 1, 2}, 0)); // 4
        System.out.println(java.util.Arrays.toString(searchRange(new int[]{5, 7, 7, 8, 8, 10}, 8))); // [3,4]
    }
}
