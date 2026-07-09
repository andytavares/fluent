import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    /**
     * Returns true if s is a palindrome, ignoring non-alphanumeric chars and case.
     * Skips junk characters with the pointers themselves - no cleaned copy.
     * O(n) time, O(1) space.
     */
    public static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left)))  left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    /**
     * Returns the 1-based indexes [i, j] of the pair summing to target.
     * Sorted input makes one comparison per step decisive: a too-small sum can
     * only be fixed by advancing left, a too-large one by retreating right.
     * O(n) time, O(1) space.
     */
    public static int[] twoSumII(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) return new int[]{left + 1, right + 1};
            if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[0]; // unreachable given the "exactly one solution" guarantee
    }

    /**
     * Returns the maximum water area between any two lines.
     * Move the shorter-line pointer inward - the shorter line caps the area of
     * every container it could form inside the current window.
     * O(n) time, O(1) space.
     */
    public static int containerWithMostWater(int[] heights) {
        int left = 0, right = heights.length - 1;
        int maxArea = 0;
        while (left < right) {
            int area = Math.min(heights[left], heights[right]) * (right - left);
            maxArea = Math.max(maxArea, area);
            if (heights[left] <= heights[right]) {
                left++;
            } else {
                right--;
            }
        }
        return maxArea;
    }

    /**
     * Returns all unique triplets of values that sum to zero.
     * Sort, fix a pivot, run converging pointers on the rest. Duplicate skips
     * at the pivot and both inner pointers guarantee uniqueness without a set.
     * O(n^2) time, O(1) auxiliary space (output excluded).
     */
    public static List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();

        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue; // skip duplicate pivots
            if (nums[i] > 0) break; // three positives can't sum to zero

            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(List.of(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }

        return result;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama")); // true
        System.out.println(Arrays.toString(twoSumII(new int[]{2, 7, 11, 15}, 9))); // [1, 2]
        System.out.println(containerWithMostWater(new int[]{1, 8, 6, 2, 5, 4, 8, 3, 7})); // 49
        System.out.println(threeSum(new int[]{-1, 0, 1, 2, -1, -4})); // [[-1,-1,2],[-1,0,1]]
    }
}
