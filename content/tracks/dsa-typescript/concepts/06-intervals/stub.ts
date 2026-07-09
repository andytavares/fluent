// Run: tsx stub.ts

/**
 * Merges all overlapping (or touching) intervals; returns the merged list
 * sorted by start.
 * @param intervals [start, end] pairs, arbitrary order
 */
function mergeIntervals(intervals: number[][]): number[][] {
  // TODO: sort by start (numeric comparator!), then sweep — extend the last
  // merged block when start <= last[1] (Math.max the end), else push a new block
  return [];
}

/**
 * Inserts newInterval into a sorted, non-overlapping interval list, merging
 * where needed. One O(n) pass — no re-sorting.
 * @param intervals sorted by start, pairwise non-overlapping
 * @param newInterval [start, end]
 */
function insertInterval(intervals: number[][], newInterval: number[]): number[][] {
  // TODO: three phases — copy intervals ending before newInterval starts;
  // absorb every interval starting at or before its end (Math.min/Math.max);
  // push the absorbed interval, then copy the rest
  return [];
}

/**
 * Returns the minimum number of arrows needed to burst all balloons.
 * An arrow at x bursts every balloon with xstart <= x <= xend.
 * @param points [xstart, xend] inclusive spans
 */
function minArrows(points: number[][]): number {
  // TODO: sort by end; shoot at the first balloon's end; a balloon with
  // start > arrowX needs a new arrow at its own end
  return 0;
}

export { mergeIntervals, insertInterval, minArrows };

function main() {
  console.log(JSON.stringify(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]])));
  // [[1,6],[8,10],[15,18]]
  console.log(JSON.stringify(insertInterval([[1, 3], [6, 9]], [2, 5])));
  // [[1,5],[6,9]]
  console.log(minArrows([[10, 16], [2, 8], [1, 6], [7, 12]])); // 2
}

main();
