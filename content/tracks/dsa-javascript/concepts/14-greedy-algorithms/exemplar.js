// Run: node exemplar.js

/**
 * Returns true if you can reach the last index from index 0.
 * Greedy: track the furthest reachable index.
 * O(n) time, O(1) space.
 * @param {number[]} nums
 * @returns {boolean}
 */
function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // stuck before reaching index i
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}

/**
 * Merges all overlapping intervals. Returns sorted non-overlapping intervals.
 * Sort by start; extend current merged interval or start a new one.
 * O(n log n) time, O(n) space.
 * @param {number[][]} intervals
 * @returns {number[][]}
 */
function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0].slice()];
  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    const last = result.at(-1);
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end); // Math.max handles containment
    } else {
      result.push([start, end]);
    }
  }
  return result;
}

/**
 * Returns the minimum total intervals (including idle) to complete all tasks with cooldown n.
 * Formula: (maxFreq - 1) * (n + 1) + countOfMaxFreq
 * Math.max with tasks.length handles the case where tasks fill all idles naturally.
 * O(n) time, O(1) space.
 * @param {string[]} tasks
 * @param {number} n
 * @returns {number}
 */
function taskScheduler(tasks, n) {
  const freq = new Array(26).fill(0);
  for (const t of tasks) freq[t.charCodeAt(0) - 65]++;
  const maxFreq = Math.max(...freq);
  const countOfMaxFreq = freq.filter(f => f === maxFreq).length;
  return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + countOfMaxFreq);
}

module.exports = { canJump, mergeIntervals, taskScheduler };

function main() {
  console.log(canJump([2, 3, 1, 1, 4]));                                    // true
  console.log(canJump([3, 2, 1, 0, 4]));                                    // false
  console.log(JSON.stringify(mergeIntervals([[1,3],[2,6],[8,10],[15,18]]))); // [[1,6],[8,10],[15,18]]
  console.log(taskScheduler(["A","A","A","B","B","B"], 2));                  // 8
  console.log(taskScheduler(["A","A","A","B","B","B"], 0));                  // 6
}

main();
