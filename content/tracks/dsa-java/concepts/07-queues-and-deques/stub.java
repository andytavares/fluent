import java.util.ArrayDeque;

class Solution {

    public static int[] slidingWindowMaximum(int[] nums, int k) {
        // TODO
        return new int[nums.length - k + 1];
    }

    static class RecentCounter {
        public RecentCounter() {
            // TODO
        }

        public int ping(int t) {
            // TODO
            return 0;
        }
    }

    public static int rottingOranges(int[][] grid) {
        // TODO
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.toString(
            slidingWindowMaximum(new int[]{1,3,-1,-3,5,3,6,7}, 3))); // [3,3,5,5,6,7]

        var rc = new RecentCounter();
        System.out.println(rc.ping(1));    // 1
        System.out.println(rc.ping(100));  // 2
        System.out.println(rc.ping(3001)); // 3
        System.out.println(rc.ping(3002)); // 3

        System.out.println(rottingOranges(new int[][]{{2,1,1},{1,1,0},{0,1,1}})); // 4
    }
}
