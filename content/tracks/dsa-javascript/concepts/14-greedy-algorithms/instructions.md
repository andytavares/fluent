# Greedy Algorithms

## What you'll learn

Three greedy patterns: linear-scan reach tracking for jump game, sort-then-sweep for interval merging, and frequency-driven slot calculation for task scheduling.

## Key concepts

A greedy algorithm makes the locally optimal choice at each step. It's correct when the "greedy choice property" holds: a local optimum never prevents a global optimum. Always justify greedy before coding.

### Jump game — track maximum reach

Scan left to right. Track the farthest reachable index. If the current index exceeds it, you're stuck.

```js
function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;      // stuck before reaching here
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}
```

Greedy justification: reaching index `i` means you can reach any index `j <= i`. Always extend as far as possible — there's no benefit to holding back.

### Merge intervals — sort by start, sweep

Sort by start time. An interval overlaps if `start <= last.end`. Extend the merged interval's end or start a new one.

```js
function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (const [start, end] of intervals.slice(1)) {
    const last = merged.at(-1);
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
```

### Task scheduler — max frequency determines frame size

The most frequent task forces a "frame" structure: one execution of each top-frequency task, padded with `n` idle/other slots between frames.

```js
function taskScheduler(tasks, n) {
  const freq = new Array(26).fill(0);
  for (const t of tasks) freq[t.charCodeAt(0) - 65]++;
  const maxFreq = Math.max(...freq);
  const countOfMaxFreq = freq.filter(f => f === maxFreq).length;
  // Formula: fill frames with maxFreq tasks; each frame is (n+1) slots
  // Last frame has countOfMaxFreq tasks (no trailing idle needed)
  return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + countOfMaxFreq);
}
```

`Math.max(tasks.length, formula)`: if tasks are dense enough to fill all idle slots, the answer is just `tasks.length`.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| canJump | O(n) | O(1) |
| mergeIntervals | O(n log n) | O(n) |
| taskScheduler | O(n) | O(1) |

## Common variations

- **Jump Game II** (LC 45) — minimum jumps; BFS levels greedy; O(n)
- **Insert interval** (LC 57) — one-pass insert + merge without re-sorting
- **Non-overlapping intervals** (LC 435) — count minimum removals; sort by end time
- **Gas station** (LC 134) — if total gas ≥ total cost, a solution exists; track running surplus

## vs other languages

Nothing language-specific. JavaScript's `Array.sort` requires an explicit comparator for numeric arrays — `(a, b) => a[0] - b[0]` for sorting by interval start.

## FAANG follow-up questions

After canJump:
- "Can you find the minimum number of jumps?" (Jump Game II — greedy by tracking the current level boundary; O(n))
- "What if jumps have a cost?" (greedy is insufficient — use DP)

After mergeIntervals:
- "What if you need to insert a new interval into an already-sorted merged list?" (binary search for position, then merge overlapping neighbors — O(n) one-pass)
- "How do you count the minimum number of intervals to remove to make the rest non-overlapping?" (sort by end time; greedily keep intervals with earliest end — similar to activity selection)

After taskScheduler:
- "Why is `tasks.length` a lower bound?" (you must execute every task at least once; idle time only gets added on top)
- "What if n = 0?" (no cooldown; answer = total tasks)
- "Why `(n + 1)` not `n` in the formula?" (each frame is: 1 execution slot + n cooldown slots = n+1 total)

## Watch out

- **canJump condition**: `i > maxReach` not `i >= maxReach` — you can stand at `maxReach` and jump from there.
- **mergeIntervals empty input**: guard against `intervals.length === 0` before accessing `intervals[0]`.
- **mergeIntervals containment**: `if (start <= last[1]) last[1] = Math.max(last[1], end)` — use `Math.max` because the new interval might end before the last one (containment case).
- **taskScheduler**: `countOfMaxFreq` is the number of task types with maximum frequency, not just 1.

## The task

### `canJump(nums)`

Each element is the maximum jump length from that position. Return `true` if you can reach the last index.

```js
canJump([2, 3, 1, 1, 4]) // true
canJump([3, 2, 1, 0, 4]) // false
canJump([0])             // true
```

### `mergeIntervals(intervals)`

Return a list of merged non-overlapping intervals covering the same range.

```js
mergeIntervals([[1,3],[2,6],[8,10],[15,18]]) // [[1,6],[8,10],[15,18]]
mergeIntervals([[1,4],[4,5]])                // [[1,5]]
mergeIntervals([[1,4]])                      // [[1,4]]
```

### `taskScheduler(tasks, n)`

Given tasks (uppercase letters) and a cooldown `n` (same task needs at least `n` gaps between executions), return the minimum total intervals to complete all tasks.

```js
taskScheduler(["A","A","A","B","B","B"], 2)                            // 8
taskScheduler(["A","A","A","B","B","B"], 0)                            // 6
taskScheduler(["A","A","A","A","A","A","B","C","D","E","F","G"], 2)   // 16
```
