import java.util.ArrayList;
import java.util.List;

class Solution {

    /**
     * Merges all overlapping (or touching) intervals; returns the merged list
     * sorted by start.
     */
    public static int[][] mergeIntervals(int[][] intervals) {
        // TODO: sort by start (Integer.compare, never bare subtraction on
        // extreme values), then sweep - extend the last merged block when
        // start <= last[1] (Math.max the end), else start a new block
        return new int[0][];
    }

    /**
     * Inserts newInterval into a sorted, non-overlapping interval list, merging
     * where needed. One O(n) pass - no re-sorting.
     */
    public static int[][] insertInterval(int[][] intervals, int[] newInterval) {
        // TODO: three phases - copy intervals ending before newInterval starts;
        // absorb every interval starting at or before its end (Math.min/Math.max);
        // add the absorbed interval, then copy the rest
        return new int[0][];
    }

    /**
     * Returns the minimum number of arrows needed to burst all balloons.
     * An arrow at x bursts every balloon with xstart <= x <= xend.
     */
    public static int minArrows(int[][] points) {
        // TODO: sort by end; shoot at the first balloon's end; a balloon with
        // start > arrowX needs a new arrow at its own end
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.deepToString(
            mergeIntervals(new int[][]{{1, 3}, {2, 6}, {8, 10}, {15, 18}})));
        // [[1,6],[8,10],[15,18]]
        System.out.println(java.util.Arrays.deepToString(
            insertInterval(new int[][]{{1, 3}, {6, 9}}, new int[]{2, 5})));
        // [[1,5],[6,9]]
        System.out.println(minArrows(new int[][]{{10, 16}, {2, 8}, {1, 6}, {7, 12}})); // 2
    }
}
