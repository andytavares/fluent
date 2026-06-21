import java.util.ArrayList;
import java.util.Arrays;

class Solution {

    public static boolean canJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.max(maxReach, i + nums[i]);
        }
        return true;
    }

    public static int[][] mergeIntervals(int[][] intervals) {
        if (intervals == null || intervals.length == 0) return new int[0][];
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        var result = new ArrayList<int[]>();
        result.add(intervals[0]);
        for (int i = 1; i < intervals.length; i++) {
            int[] last = result.get(result.size() - 1);
            if (intervals[i][0] <= last[1]) {
                last[1] = Math.max(last[1], intervals[i][1]);
            } else {
                result.add(intervals[i]);
            }
        }
        return result.toArray(new int[0][]);
    }

    public static int taskScheduler(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char t : tasks) freq[t - 'A']++;
        Arrays.sort(freq);

        int maxFreq = freq[25];
        int idleSlots = (maxFreq - 1) * n;
        for (int i = 24; i >= 0 && idleSlots > 0; i--) {
            idleSlots -= Math.min(freq[i], maxFreq - 1);
        }
        return tasks.length + Math.max(0, idleSlots);
    }

    public static void main(String[] args) {
        System.out.println(canJump(new int[]{2,3,1,1,4})); // true
        System.out.println(canJump(new int[]{3,2,1,0,4})); // false
        System.out.println(Arrays.deepToString(
            mergeIntervals(new int[][]{{1,3},{2,6},{8,10},{15,18}}))); // [[1,6],[8,10],[15,18]]
        System.out.println(taskScheduler(new char[]{'A','A','A','B','B','B'}, 2)); // 8
    }
}
