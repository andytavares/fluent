// Run: tsx exemplar.ts

export function canJump(nums: number[]): boolean {
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // position i is unreachable
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}

export function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return [];

  intervals.sort(([a], [b]) => a - b);
  const merged: [number, number][] = [[intervals[0][0], intervals[0][1]]];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      // Overlap (including touching): extend the end
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      merged.push([intervals[i][0], intervals[i][1]]);
    }
  }
  return merged;
}

export function taskScheduler(tasks: string[], n: number): number {
  const freq = new Map<string, number>();
  for (const t of tasks) freq.set(t, (freq.get(t) ?? 0) + 1);

  const maxCount = Math.max(...freq.values());

  // Count how many tasks share the maximum frequency
  let countOfMax = 0;
  for (const v of freq.values()) {
    if (v === maxCount) countOfMax++;
  }

  // Minimum time: arrange maxCount-1 full frames of (n+1) tasks each,
  // then a final partial frame with countOfMax tasks.
  // If tasks are plentiful enough to fill all gaps, answer is tasks.length.
  const minTime = (maxCount - 1) * (n + 1) + countOfMax;
  return Math.max(tasks.length, minTime);
}
