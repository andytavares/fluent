import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    /** Returns true if s is a palindrome, ignoring non-alphanumeric chars and case. */
    public static boolean isPalindrome(String s) {
        // TODO: converging pointers; skip non-alphanumeric chars in place
        // (re-check left < right inside the skip loops)
        return false;
    }

    /**
     * Returns the 1-based indexes [i, j] (i < j) of the two elements that sum
     * to target. numbers is sorted ascending; exactly one solution exists.
     */
    public static int[] twoSumII(int[] numbers, int target) {
        // TODO: converging pointers; sum too small -> left++, too big -> right--
        // remember the +1 for 1-based indexes
        return new int[0];
    }

    /** Returns the maximum water area between any two lines. */
    public static int containerWithMostWater(int[] heights) {
        // TODO: converging pointers; always move the shorter-line pointer inward
        return 0;
    }

    /** Returns all unique triplets of values that sum to zero. */
    public static List<List<Integer>> threeSum(int[] nums) {
        // TODO: sort numerically, fix pivot i, then converging pointers for the pair
        // skip duplicate pivots (i > 0 && nums[i] == nums[i-1]) and inner duplicates
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama")); // true
        System.out.println(Arrays.toString(twoSumII(new int[]{2, 7, 11, 15}, 9))); // [1, 2]
        System.out.println(containerWithMostWater(new int[]{1, 8, 6, 2, 5, 4, 8, 3, 7})); // 49
        System.out.println(threeSum(new int[]{-1, 0, 1, 2, -1, -4})); // [[-1,-1,2],[-1,0,1]]
    }
}
