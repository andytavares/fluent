class Solution {

    /**
     * Merges sorted nums2 into sorted nums1 in place.
     * nums1 has length m + n; its last n slots are placeholders.
     */
    public static void merge(int[] nums1, int m, int[] nums2, int n) {
        // TODO: three indexes from the back (i = m-1, j = n-1, k = m+n-1);
        // place the larger of nums1[i]/nums2[j] at k until nums2 is exhausted
    }

    /**
     * Removes duplicates from a sorted array in place.
     * Returns k — nums[0..k-1] holds the distinct values in order.
     */
    public static int removeDuplicates(int[] nums) {
        // TODO: write pointer; keep nums[read] when write == 0
        // or nums[read] != nums[write - 1]
        return 0;
    }

    /**
     * Returns the element appearing more than floor(n/2) times.
     * A majority element is guaranteed to exist.
     */
    public static int majorityElement(int[] nums) {
        // TODO: Boyer-Moore voting - adopt a candidate when count hits 0,
        // increment on match, decrement on mismatch
        return 0;
    }

    /**
     * Rotates the array right by k steps, in place.
     * k >= 0, may exceed nums.length.
     */
    public static void rotate(int[] nums, int k) {
        // TODO: k %= nums.length, then three reversals:
        // whole array, first k elements, remaining n - k elements
    }

    public static void main(String[] args) {
        int[] nums1 = {1, 2, 3, 0, 0, 0};
        merge(nums1, 3, new int[]{2, 5, 6}, 3);
        System.out.println(java.util.Arrays.toString(nums1)); // [1,2,2,3,5,6]

        int[] dedup = {0, 0, 1, 1, 1, 2, 2, 3, 3, 4};
        int k = removeDuplicates(dedup);
        System.out.println(k + " " + java.util.Arrays.toString(java.util.Arrays.copyOfRange(dedup, 0, k)));

        System.out.println(majorityElement(new int[]{2, 2, 1, 1, 1, 2, 2})); // 2

        int[] rot = {1, 2, 3, 4, 5, 6, 7};
        rotate(rot, 3);
        System.out.println(java.util.Arrays.toString(rot)); // [5,6,7,1,2,3,4]
    }
}
