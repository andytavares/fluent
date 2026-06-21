// Run: tsx stub.ts

// Return the maximum value in each sliding window of size k.
export function slidingWindowMaximum(nums: number[], k: number): number[] {
  // TODO: monotonic decreasing deque of indices;
  // remove indices outside window from front, smaller elements from back
  return [];
}

// Count requests within a 3000ms sliding window.
export class RecentCounter {
  // TODO: maintain a queue of timestamps; purge entries older than t - 3000 on each ping
  ping(t: number): number {
    return 0;
  }
}

// Return the minimum minutes until no fresh orange remains, or -1 if impossible.
// Grid: 0 = empty, 1 = fresh orange, 2 = rotten orange.
export function rottingOranges(grid: number[][]): number {
  // TODO: multi-source BFS starting from all rotten oranges simultaneously;
  // count fresh oranges; return -1 if any fresh remain after BFS
  return 0;
}

// Usage examples (uncomment to test manually):
// console.log(slidingWindowMaximum([1,3,-1,-3,5,3,6,7], 3)); // [3,3,5,5,6,7]
// const rc = new RecentCounter();
// console.log(rc.ping(1));    // 1
// console.log(rc.ping(3002)); // 2
// console.log(rottingOranges([[2,1,1],[1,1,0],[0,1,1]])); // 4
