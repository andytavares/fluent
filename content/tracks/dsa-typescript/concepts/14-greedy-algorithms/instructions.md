# Greedy Algorithms

## What you'll learn

How to recognize problems where a locally optimal choice at each step leads to a globally optimal solution, and how to argue correctness using the exchange argument. You'll implement three problems: jump game, merge intervals, and task scheduler.

## Key concepts

### Jump Game — track the farthest reachable index

At each position, greedily extend the farthest reachable index. If you ever arrive at a position you can't reach, no sequence of jumps could have helped.

```typescript
function canJump(nums: number[]): boolean {
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // i is unreachable
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}
// Time: O(n)  Space: O(1)
```

**Exchange argument**: suppose at position i we don't extend maxReach as far as possible, and instead take a shorter jump. Any future position that was reachable via the longer jump is still reachable via the shorter one OR becomes unreachable — never better.

### Merge Intervals — sort then sweep

After sorting by start time, the decision at each interval is binary: does it overlap the last merged interval (extend its end) or not (start a new one)?

```typescript
function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return [];
  intervals.sort(([a], [b]) => a - b);
  const merged: [number, number][] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]); // extend
    } else {
      merged.push([intervals[i][0], intervals[i][1]]); // new interval
    }
  }
  return merged;
}
// Time: O(n log n)  Space: O(n) output
```

**Why `<=`**: touching intervals like `[1,4]` and `[4,5]` should merge to `[1,5]`. The condition `start <= end` (not `<`) handles the touching case.

### Task Scheduler — greedy idle time calculation

Given task frequencies and cooldown n, the minimum time is governed by the most frequent task. The formula:

```
idleTime = (maxCount - 1) * n - (tasks with maxCount - 1)
totalTime = max(tasks.length, idleTime + tasks.length)
```

Or equivalently:
```
totalTime = max(tasks.length, (maxCount - 1) * (n + 1) + countOfMaxFreq)
```

```typescript
function taskScheduler(tasks: string[], n: number): number {
  const freq = new Map<string, number>();
  for (const t of tasks) freq.set(t, (freq.get(t) ?? 0) + 1);

  const maxCount = Math.max(...freq.values());
  // How many tasks share the maximum frequency?
  let countOfMax = 0;
  for (const v of freq.values()) if (v === maxCount) countOfMax++;

  // Frame size: one full cycle of (n+1) slots ending with the most frequent task
  const minTime = (maxCount - 1) * (n + 1) + countOfMax;
  return Math.max(tasks.length, minTime);
}
// Time: O(n)  Space: O(1) — at most 26 distinct tasks
```

**Intuition**: arrange the most frequent task as an "anchor" — each cycle has (n+1) slots. Fill remaining tasks into gaps. If tasks fill all the gaps, no idle time is needed and the answer is just `tasks.length`.

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `canJump` | O(n) | O(1) | Single pass, no extra storage |
| `mergeIntervals` | O(n log n) | O(n) | Sort dominates |
| `taskScheduler` | O(n) | O(1) | Frequency map bounded by 26 letters |

## Common variations

- **Jump Game II (minimum jumps)** — greedy BFS; track current reach and next reach; increment steps when current reach is exhausted
- **Non-overlapping intervals** — sort by end time; greedily pick intervals with the earliest end; count removals
- **Minimum number of arrows to burst balloons** — same as non-overlapping intervals (sort by end, count how many disjoint groups)
- **Gas station** — greedy: total gas ≥ total cost means a solution exists; start from the first net-positive position

## vs DP

Greedy is a special case of DP where you never need to reconsider earlier choices. `canJump` has an O(n²) DP solution; the greedy O(n) approach works here because the greedy choice property holds. When in doubt, think DP first, then look for greedy.

## Watch out

- **`intervals.sort` mutates in place**: if the original array must be preserved, copy first with `[...intervals].sort(...)`.
- **`mergeIntervals` with empty input**: `intervals[0]` would throw. Guard with `if (intervals.length === 0) return []`.
- **Touching intervals**: `[1,4],[4,5]` — check `<=` not `<`. Many candidates use `<` and miss this case.
- **`taskScheduler` when n=0**: no cooldown, so the answer is exactly `tasks.length`. The formula still works: `(maxCount-1)*1 + countOfMax ≤ tasks.length`.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you solve Jump Game II (minimum number of jumps)?" (Greedy BFS: track `curEnd` (end of current level) and `farthest` (max reach seen this level). When `i === curEnd`, increment jumps and set `curEnd = farthest`. O(n).)
> - "Why does greedy work for `taskScheduler` but not for 0/1 Knapsack?" (0/1 Knapsack lacks the greedy choice property — taking the locally best item can block you from a better global combination. `taskScheduler` has the frame structure that makes the formula exact.)
> - "What if tasks can have different execution times?" (More complex — becomes a scheduling problem solvable with priority queues, not a simple formula.)
> - "How do you count non-overlapping intervals to minimize removals?" (Sort by end time. Greedily keep intervals with the earliest end. Remove = total - kept.)

## The task

Implement three functions:

```typescript
// Return true if you can reach the last index.
// nums[i] is the maximum jump length from position i.
// [2,3,1,1,4] → true
// [3,2,1,0,4] → false
function canJump(nums: number[]): boolean

// Merge all overlapping intervals and return the merged list sorted by start.
// [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]
// [[1,4],[4,5]] → [[1,5]]  (touching intervals merge)
function mergeIntervals(intervals: [number, number][]): [number, number][]

// Given tasks (each a letter A-Z) and a cooldown n, return the minimum
// CPU intervals needed to finish all tasks. Same task must be at least n
// intervals apart; idle intervals may be inserted.
// tasks=["A","A","A","B","B","B"], n=2 → 8  (A→B→idle→A→B→idle→A→B)
// tasks=["A","A","A","B","B","B"], n=0 → 6
function taskScheduler(tasks: string[], n: number): number
```
