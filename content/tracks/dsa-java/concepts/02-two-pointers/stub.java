import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    public static boolean isPalindrome(String s) {
        // TODO
        return false;
    }

    public static int containerWithMostWater(int[] heights) {
        // TODO
        return 0;
    }

    public static List<List<Integer>> threeSum(int[] nums) {
        // TODO
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama")); // true
        System.out.println(isPalindrome("race a car"));                      // false
        System.out.println(containerWithMostWater(new int[]{1,8,6,2,5,4,8,3,7})); // 49
        System.out.println(threeSum(new int[]{-1,0,1,2,-1,-4})); // [[-1,-1,2],[-1,0,1]]
    }
}
