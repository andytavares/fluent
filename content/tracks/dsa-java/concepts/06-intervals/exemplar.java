import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    /**
     * Merges all overlapping (or touching) intervals; returns the merged list
     * sorted by start. After sorting by start, every interval that can merge
     * with the current block arrives before any interval that can't, so one
     * sweep against the last merged block suffices.
     * O(n log n) time, O(n) output space.
     */
    public static int[][] mergeIntervals(int[][] intervals) {
        if (intervals.length == 0) return new int[0][];
        int[][] sorted = intervals.clone();
        Arrays.sort(sorted, (a, b) -> Integer.compare(a[0], b[0]));

        List<int[]> merged = new ArrayList<>();
        merged.add(sorted[0].clone());
        for (int i = 1; i < sorted.length; i++) {
            int start = sorted[i][0], end = sorted[i][1];
            int[] last = merged.get(merged.size() - 1);
            if (start <= last[1]) {
                last[1] = Math.max(last[1], end); // extend — max handles containment
            } else {
                merged.add(new int[]{start, end}); // gap — new block
            }
        }
        return merged.toArray(new int[0][]);
    }

    /**
     * Inserts newInterval into a sorted, non-overlapping list in one pass.
     * Three phases: strictly-before intervals, overlapping intervals (absorbed
     * into newInterval), strictly-after intervals.
     * O(n) time, O(n) output space.
     */
    public static int[][] insertInterval(int[][] intervals, int[] newInterval) {
        List<int[]> result = new ArrayList<>();
        int start = newInterval[0], end = newInterval[1];
        int n = intervals.length;
        int i = 0;

        while (i < n && intervals[i][1] < start) result.add(intervals[i++].clone());

        while (i < n && intervals[i][0] <= end) {
            start = Math.min(start, intervals[i][0]);
            end = Math.max(end, intervals[i][1]);
            i++;
        }
        result.add(new int[]{start, end});

        while (i < n) result.add(intervals[i++].clone());

        return result.toArray(new int[0][]);
    }

    /**
     * Returns the minimum number of arrows needed to burst all balloons.
     * Sort by end and shoot each arrow at a balloon's end — the latest position
     * that still bursts it, so it catches the most balloons after it.
     * O(n log n) time, O(1) extra space.
     */
    public static int minArrows(int[][] points) {
        if (points.length == 0) return 0;
        int[][] sorted = points.clone();
        Arrays.sort(sorted, (a, b) -> Integer.compare(a[1], b[1]));

        int arrows = 1;
        int arrowX = sorted[0][1];
        for (int[] p : sorted) {
            if (p[0] > arrowX) { // strictly after — touching balloons share the arrow
                arrows++;
                arrowX = p[1];
            }
        }
        return arrows;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.deepToString(
            mergeIntervals(new int[][]{{1, 3}, {2, 6}, {8, 10}, {15, 18}})));
        // [[1,6],[8,10],[15,18]]
        System.out.println(Arrays.deepToString(
            insertInterval(new int[][]{{1, 3}, {6, 9}}, new int[]{2, 5})));
        // [[1,5],[6,9]]
        System.out.println(minArrows(new int[][]{{10, 16}, {2, 8}, {1, 6}, {7, 12}})); // 2
    }
}
