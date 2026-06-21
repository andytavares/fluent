// Run: node stub.js

/**
 * Returns true if you can reach the last index from index 0.
 * @param {number[]} nums
 * @returns {boolean}
 */
function canJump(nums) {
  // TODO: track maxReach; if i > maxReach return false; update maxReach = max(maxReach, i+nums[i])
  return false;
}

/**
 * Merges all overlapping intervals. Returns sorted non-overlapping intervals.
 * @param {number[][]} intervals
 * @returns {number[][]}
 */
function mergeIntervals(intervals) {
  // TODO: sort by start; extend last[1] if start <= last[1]; else push new interval
  return [];
}

/**
 * Returns minimum intervals (including idle) needed to schedule all tasks.
 * @param {string[]} tasks
 * @param {number} n
 * @returns {number}
 */
function taskScheduler(tasks, n) {
  // TODO: count frequencies; maxFreq = max freq; countOfMaxFreq = how many tasks share it
  // return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + countOfMaxFreq)
  return 0;
}

module.exports = { canJump, mergeIntervals, taskScheduler };

function main() {
  console.log(canJump([2, 3, 1, 1, 4]));                                    // true
  console.log(mergeIntervals([[1,3],[2,6],[8,10],[15,18]]));                 // [[1,6],[8,10],[15,18]]
  console.log(taskScheduler(["A","A","A","B","B","B"], 2));                  // 8
}

main();
