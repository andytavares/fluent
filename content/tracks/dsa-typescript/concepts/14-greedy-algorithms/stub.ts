// Run: tsx stub.ts

// Return true if you can reach the last index.
// nums[i] is the maximum jump length from position i.
export function canJump(nums: number[]): boolean {
  // TODO: track maxReach; if current index ever exceeds maxReach, return false
  return false;
}

// Merge all overlapping intervals and return the merged list sorted by start.
export function mergeIntervals(intervals: [number, number][]): [number, number][] {
  // TODO: sort by start; sweep and extend last or push new
  return [];
}

// Return minimum CPU intervals to complete all tasks with cooldown n.
export function taskScheduler(tasks: string[], n: number): number {
  // TODO: count task frequencies; apply formula:
  // max(tasks.length, (maxCount - 1) * (n + 1) + countOfMaxFreq)
  return 0;
}

// Usage examples (uncomment to test manually):
// console.log(canJump([2,3,1,1,4]));                                    // true
// console.log(mergeIntervals([[1,3],[2,6],[8,10],[15,18]]));             // [[1,6],[8,10],[15,18]]
// console.log(taskScheduler(["A","A","A","B","B","B"], 2));              // 8
