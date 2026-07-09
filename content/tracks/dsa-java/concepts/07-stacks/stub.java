import java.util.ArrayDeque;

class Solution {

    public static boolean isValidParentheses(String s) {
        // TODO
        return false;
    }

    public static int[] dailyTemperatures(int[] temps) {
        // TODO
        return new int[temps.length];
    }

    public static int largestRectangleInHistogram(int[] heights) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(isValidParentheses("()[]{}")); // true
        System.out.println(isValidParentheses("([)]"));   // false
        System.out.println(java.util.Arrays.toString(dailyTemperatures(
            new int[]{73,74,75,71,69,72,76,73}))); // [1,1,4,2,1,1,0,0]
        System.out.println(largestRectangleInHistogram(new int[]{2,1,5,6,2,3})); // 10
    }
}
