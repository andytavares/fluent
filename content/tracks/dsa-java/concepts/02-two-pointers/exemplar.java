import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

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

    public static int containerWithMostWater(int[] heights) {
        int left = 0, right = heights.length - 1, maxWater = 0;
        while (left < right) {
            int water = Math.min(heights[left], heights[right]) * (right - left);
            maxWater = Math.max(maxWater, water);
            if (heights[left] < heights[right]) left++;
            else right--;
        }
        return maxWater;
    }

    public static List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(List.of(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left]  == nums[left  + 1]) left++;
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
        System.out.println(isPalindrome("race a car"));                      // false
        System.out.println(containerWithMostWater(new int[]{1,8,6,2,5,4,8,3,7})); // 49
        System.out.println(threeSum(new int[]{-1,0,1,2,-1,-4})); // [[-1,-1,2],[-1,0,1]]
    }
}
