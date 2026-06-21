import java.util.ArrayDeque;
import java.util.Arrays;

class Solution {

    public static int[] slidingWindowMaximum(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        var dq = new ArrayDeque<Integer>(); // indices; front = index of max in window

        for (int i = 0; i < n; i++) {
            if (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();
            dq.offerLast(i);
            if (i >= k - 1) result[i - k + 1] = nums[dq.peekFirst()];
        }
        return result;
    }

    static class RecentCounter {
        private final ArrayDeque<Integer> queue = new ArrayDeque<>();

        public RecentCounter() {}

        public int ping(int t) {
            queue.offer(t);
            while (queue.peek() < t - 3000) queue.poll();
            return queue.size();
        }
    }

    public static int rottingOranges(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        var queue = new ArrayDeque<int[]>();
        int fresh = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if      (grid[r][c] == 2) queue.offer(new int[]{r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        }

        int minutes = 0;
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        while (!queue.isEmpty() && fresh > 0) {
            minutes++;
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                int[] cell = queue.poll();
                for (int[] d : dirs) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;
                        fresh--;
                        queue.offer(new int[]{nr, nc});
                    }
                }
            }
        }
        return fresh == 0 ? minutes : -1;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(
            slidingWindowMaximum(new int[]{1,3,-1,-3,5,3,6,7}, 3))); // [3,3,5,5,6,7]

        var rc = new RecentCounter();
        System.out.println(rc.ping(1));    // 1
        System.out.println(rc.ping(100));  // 2
        System.out.println(rc.ping(3001)); // 3
        System.out.println(rc.ping(3002)); // 3

        System.out.println(rottingOranges(new int[][]{{2,1,1},{1,1,0},{0,1,1}})); // 4
    }
}
