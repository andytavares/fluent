import java.util.ArrayList;
import java.util.Arrays;

class Solution {

    public static boolean canJump(int[] nums) {
        // TODO
        return false;
    }

    public static int[][] mergeIntervals(int[][] intervals) {
        // TODO
        return new int[0][];
    }

    public static int taskScheduler(char[] tasks, int n) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(canJump(new int[]{2,3,1,1,4})); // true
        System.out.println(canJump(new int[]{3,2,1,0,4})); // false
        System.out.println(Arrays.deepToString(
            mergeIntervals(new int[][]{{1,3},{2,6},{8,10},{15,18}}))); // [[1,6],[8,10],[15,18]]
        System.out.println(taskScheduler(new char[]{'A','A','A','B','B','B'}, 2)); // 8
    }
}
