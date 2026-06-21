// Run: node stub.js

/**
 * Returns the maximum value in each sliding window of size k.
 * @param {number[]} nums
 * @param {number} k
 * @returns {number[]}
 */
function slidingWindowMaximum(nums, k) {
  // TODO: monotonic deque of indices (decreasing values)
  // expire old indices from front (< i - k + 1)
  // remove dominated indices from back (nums[back] < nums[i])
  // push i; when i >= k-1 record nums[deque[0]]
  return [];
}

/**
 * Counts requests in the rolling 3000ms window.
 */
class RecentCounter {
  constructor() {
    // TODO: initialize a queue
  }

  /**
   * @param {number} t - strictly increasing timestamp in ms
   * @returns {number}
   */
  ping(t) {
    // TODO: push t, dequeue while front < t - 3000, return queue length
    return 0;
  }
}

/**
 * Returns minimum minutes for all fresh oranges to rot, or -1 if impossible.
 * @param {number[][]} grid
 * @returns {number}
 */
function rottingOranges(grid) {
  // TODO: multi-source BFS from all initially rotten oranges
  // count fresh oranges before BFS; each BFS level = 1 minute
  // after BFS: return fresh === 0 ? minutes : -1
  return 0;
}

module.exports = { slidingWindowMaximum, RecentCounter, rottingOranges };

function main() {
  console.log(slidingWindowMaximum([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3,3,5,5,6,7]
  const rc = new RecentCounter();
  console.log(rc.ping(1));    // 1
  console.log(rc.ping(100));  // 2
  console.log(rc.ping(3001)); // 3
  console.log(rc.ping(3002)); // 3
  console.log(rottingOranges([[2,1,1],[1,1,0],[0,1,1]])); // 4
}

main();
