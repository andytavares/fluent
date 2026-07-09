class Solution {

    /**
     * Merges sorted nums2 into sorted nums1 in place, filling from the back so
     * writes never clobber unread nums1 values (k stays >= i).
     * O(m + n) time, O(1) space.
     */
    public static void merge(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1;
        int j = n - 1;
        int k = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) {
                nums1[k--] = nums1[i--];
            } else {
                nums1[k--] = nums2[j--];
            }
        }
        // Remaining nums1 prefix (if any) is already sorted and in place.
    }

    /**
     * Removes duplicates from a sorted array in place with a write pointer.
     * Duplicates are adjacent in sorted input, so comparing against the last
     * kept value is sufficient.
     * O(n) time, O(1) space.
     */
    public static int removeDuplicates(int[] nums) {
        int write = 0;
        for (int read = 0; read < nums.length; read++) {
            if (write == 0 || nums[read] != nums[write - 1]) {
                nums[write++] = nums[read];
            }
        }
        return write;
    }

    /**
     * Boyer-Moore voting: pair each candidate occurrence against a
     * non-candidate occurrence and cancel; the true majority (> n/2) can never
     * be fully cancelled, so it is the final candidate.
     * O(n) time, O(1) space.
     */
    public static int majorityElement(int[] nums) {
        int candidate = nums[0];
        int count = 0;
        for (int x : nums) {
            if (count == 0) {
                candidate = x;
                count = 1;
            } else if (x == candidate) {
                count++;
            } else {
                count--;
            }
        }
        return candidate;
    }

    /** Reverses nums[lo..hi] in place. */
    private static void reverseRange(int[] nums, int lo, int hi) {
        while (lo < hi) {
            int tmp = nums[lo];
            nums[lo++] = nums[hi];
            nums[hi--] = tmp;
        }
    }

    /**
     * Rotates right by k via three reversals: a right-rotation moves the last
     * k elements to the front as a block; reversing everything puts the block
     * in front backwards, then two partial reversals fix each block's order.
     * O(n) time, O(1) space.
     */
    public static void rotate(int[] nums, int k) {
        int n = nums.length;
        if (n == 0) return;
        k %= n;
        if (k == 0) return;
        reverseRange(nums, 0, n - 1);
        reverseRange(nums, 0, k - 1);
        reverseRange(nums, k, n - 1);
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
