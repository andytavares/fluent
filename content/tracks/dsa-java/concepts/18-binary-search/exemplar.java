class Solution {

    /**
     * Lower bound: first index with nums[i] >= target. Half-open interval
     * [left, right); right = mid keeps a candidate answer in range, left = mid + 1
     * discards indexes that are provably too small.
     * O(log n) time, O(1) space.
     */
    private static int lowerBound(int[] nums, int target) {
        int left = 0, right = nums.length;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

    /**
     * Returns the index of target in sorted, distinct nums, or its insertion
     * point. The lower bound answers both cases at once: if target exists, the
     * first index >= target IS its index.
     * O(log n) time, O(1) space.
     */
    public static int searchInsert(int[] nums, int target) {
        return lowerBound(nums, target);
    }

    /**
     * Returns the index of any peak. One neighbor comparison is the monotonic
     * predicate: a rising slope at mid guarantees a peak strictly to the right
     * (the array ends at a -Infinity wall), a falling slope keeps mid in play.
     * O(log n) time, O(1) space.
     */
    public static int findPeakElement(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2; // mid < right, so mid + 1 is in bounds
            if (nums[mid] < nums[mid + 1]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

    /**
     * Returns the index of target in a rotated sorted array of distinct values,
     * or -1. Split anywhere and at least one half is sorted; an O(1) range test
     * against the sorted half decides which side to keep.
     * O(log n) time, O(1) space.
     */
    public static int searchRotated(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                // Left half [left..mid] is sorted (<= handles the left == mid window).
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                // Right half [mid..right] is sorted.
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }

    /**
     * Returns [first, last] occurrence indexes of target, or [-1, -1]. Two lower
     * bounds: the first >= target, and the first >= target + 1 minus one — no
     * linear expansion, so all-duplicate arrays stay logarithmic.
     * O(log n) time, O(1) space.
     */
    public static int[] searchRange(int[] nums, int target) {
        int first = lowerBound(nums, target);
        if (first == nums.length || nums[first] != target) return new int[]{-1, -1};
        int last = lowerBound(nums, target + 1) - 1;
        return new int[]{first, last};
    }

    public static void main(String[] args) {
        System.out.println(searchInsert(new int[]{1, 3, 5, 6}, 5)); // 2
        System.out.println(searchInsert(new int[]{1, 3, 5, 6}, 2)); // 1
        System.out.println(findPeakElement(new int[]{1, 2, 3, 1})); // 2
        System.out.println(searchRotated(new int[]{4, 5, 6, 7, 0, 1, 2}, 0)); // 4
        System.out.println(java.util.Arrays.toString(searchRange(new int[]{5, 7, 7, 8, 8, 10}, 8))); // [3,4]
    }
}
