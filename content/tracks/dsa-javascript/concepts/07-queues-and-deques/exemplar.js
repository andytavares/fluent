// Run: node exemplar.js

/**
 * Returns the maximum value in each sliding window of size k.
 * Monotonic deque of indices (decreasing value order); front = current max.
 * Each index pushed/popped at most once — O(n) time, O(k) space.
 * @param {number[]} nums
 * @param {number} k
 * @returns {number[]}
 */
function slidingWindowMaximum(nums, k) {
  const result = [];
  const deque = []; // indices; nums[deque[0]] >= nums[deque[1]] >= ...

  for (let i = 0; i < nums.length; i++) {
    // Remove indices that have slid out of the window
    if (deque.length && deque[0] < i - k + 1) deque.shift();
    // Remove indices from back that can never be the max (smaller than nums[i])
    while (deque.length && nums[deque.at(-1)] < nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }

  return result;
}

/**
 * Counts requests in the rolling 3000ms window.
 * Queue stores timestamps; dequeue anything older than t-3000.
 * O(1) amortized per ping.
 */
class RecentCounter {
  constructor() {
    this.q = [];
  }

  /**
   * @param {number} t - strictly increasing timestamp in ms
   * @returns {number}
   */
  ping(t) {
    this.q.push(t);
    while (this.q[0] < t - 3000) this.q.shift();
    return this.q.length;
  }
}

/**
 * Returns minimum minutes for all fresh oranges to rot via 4-directional spread.
 * Multi-source BFS: enqueue all initially rotten oranges; BFS level = 1 minute.
 * O(m*n) time and space.
 * @param {number[][]} grid
 * @returns {number}
 */
function rottingOranges(grid) {
  const rows = grid.length, cols = grid[0].length;
  const queue = [];
  let fresh = 0;

  // Find all initially rotten oranges and count fresh ones
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }

  if (fresh === 0) return 0; // no fresh oranges to begin with

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let minutes = 0;

  while (queue.length && fresh > 0) {
    minutes++;
    // Process one full level (one minute) at a time
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return fresh === 0 ? minutes : -1;
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
  console.log(rottingOranges([[2,1,1],[0,1,1],[1,0,1]])); // -1
}

main();
