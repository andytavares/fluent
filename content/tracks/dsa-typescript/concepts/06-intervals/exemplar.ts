// Run: tsx exemplar.ts

/**
 * Merges all overlapping (or touching) intervals; returns the merged list
 * sorted by start. After sorting by start, every interval that can merge
 * with the current block arrives before any interval that can't, so one
 * sweep against the last merged block suffices.
 * O(n log n) time, O(n) output space.
 * @param intervals [start, end] pairs, arbitrary order
 */
function mergeIntervals(intervals: number[][]): number[][] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [sorted[0].slice()];
  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const last = merged[merged.length - 1];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end); // extend — max handles containment
    } else {
      merged.push([start, end]); // gap — new block
    }
  }
  return merged;
}

/**
 * Inserts newInterval into a sorted, non-overlapping list in one pass.
 * Three phases: strictly-before intervals, overlapping intervals (absorbed
 * into newInterval), strictly-after intervals.
 * O(n) time, O(n) output space.
 * @param intervals sorted by start, pairwise non-overlapping
 * @param newInterval [start, end]
 */
function insertInterval(intervals: number[][], newInterval: number[]): number[][] {
  const result: number[][] = [];
  let [start, end] = newInterval;
  const n = intervals.length;
  let i = 0;

  while (i < n && intervals[i][1] < start) result.push(intervals[i++].slice());

  while (i < n && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);

  while (i < n) result.push(intervals[i++].slice());

  return result;
}

/**
 * Returns the minimum number of arrows needed to burst all balloons.
 * Sort by end and shoot each arrow at a balloon's end — the latest position
 * that still bursts it, so it catches the most balloons after it.
 * O(n log n) time, O(1) extra space.
 * @param points [xstart, xend] inclusive spans
 */
function minArrows(points: number[][]): number {
  if (points.length === 0) return 0;
  const sorted = [...points].sort((a, b) => a[1] - b[1]);
  let arrows = 1;
  let arrowX = sorted[0][1];
  for (const [start, end] of sorted) {
    if (start > arrowX) { // strictly after — touching balloons share the arrow
      arrows++;
      arrowX = end;
    }
  }
  return arrows;
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
