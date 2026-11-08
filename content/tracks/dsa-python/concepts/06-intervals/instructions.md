## What you build

You write three interval functions: `merge_intervals`, `insert_interval` and `min_arrows`. Two moves solve almost every interval problem: sort by start, then sweep and merge; or sort by end, then commit greedily. Before you write a comparison, check whether touching endpoints count as overlap. This lesson builds on **Hash Maps**.

## Key concepts

### Two closed intervals overlap when each starts before the other ends

An interval is a pair `[start, end]` with `start <= end`. In this concept, endpoints are inclusive (closed intervals). Two closed intervals overlap when `a_start <= b_end and b_start <= a_end`. Learn that test: every off-by-one in interval code is a corruption of it.

### Sort by start, sweep, merge

After a sort by start, all intervals that merge into one block are adjacent. Sweep left to right. Compare each interval with the last merged block, not with the previous input interval.

```python
# n is len(intervals).
intervals.sort(key=lambda iv: iv[0])
merged = [list(intervals[0])]
for start, end in intervals[1:]:
    last = merged[-1]
    if start <= last[1]:
        # Extend the block.
        last[1] = max(last[1], end)
    else:
        # Gap: start a new block.
        merged.append([start, end])
```

Two details carry all the correctness:
- `start <= last[1]` uses `<=`, so touching intervals such as `[1,4]` and `[4,5]` merge. Closed endpoints share the point 4.
- `max(last[1], end)` handles a later interval that sits inside the block, such as `[1,10]` then `[2,3]`. A plain `last[1] = end` shrinks the block.

### Insert without a sort: three phases

When the input is already in order and has no overlaps, an insert needs no sort. Walk the list in three phases.

```python
i, n = 0, len(intervals)
start, end = new_interval
result = []
# Phase 1: strictly before.
while i < n and intervals[i][1] < start:
    result.append(intervals[i])
    i += 1
# Phase 2: overlapping.
while i < n and intervals[i][0] <= end:
    start = min(start, intervals[i][0])
    end = max(end, intervals[i][1])
    i += 1
result.append([start, end])
# Phase 3: strictly after.
result.extend(intervals[i:])
```

The phase boundaries are the two halves of the overlap test. `intervals[i][1] < start` means "ends before the new one starts". `intervals[i][0] <= end` means "starts before the new one ends". The middle loop folds everything it absorbs into one interval.

### Sort by end, commit greedily

For "how many groups, arrows or removals" questions, sort by end and commit to each interval's end point. The interval that ends first constrains everyone. A point that serves it must be at most its end. Its exact end leaves the most room for intervals on the right; this is the standard exchange argument.

```python
points.sort(key=lambda p: p[1])
arrows = 1
arrow_x = points[0][1]
for start, end in points:
    # This balloon starts after the last
    # arrow: shoot a new arrow.
    if start > arrow_x:
        arrows += 1
        arrow_x = end
```

The same skeleton answers "largest count of non-overlapping intervals": each committed end starts a new selection. It also answers "fewest intervals to remove": n minus that largest count.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Merge Intervals | O(n log n) | O(n) output | sort by start + sweep |
| Insert Interval | O(n) | O(n) output | three-phase walk (already sorted) |
| Minimum Arrows | O(n log n) | O(1) extra | sort by end + greedy commit |

## Watch out

- Pass an explicit `key` to `sort`. The default list comparison works for numbers, but `key=lambda iv: iv[0]` states the intent.
- Compare with the merged block, not the previous input interval. In `[1,10],[2,3],[4,5]`, `[4,5]` overlaps the block `[1,10]`.
- Use `max` when you extend. Containment, such as `[1,10]` around `[2,3]`, breaks a plain `last[1] = end`.
- Know the touching rule for each problem. In Merge Intervals, `[1,4]` and `[4,5]` merge.
- In Arrows, one arrow at `x = 4` bursts `[1,4]` and `[4,6]`. So the new-arrow test is strictly `start > arrow_x`.
- Insert Interval is O(n). An append and a sort works, but it wastes the order the problem gives you. Interviewers ask about it.
- Take care with the caller's lists. An in-place sort of `intervals` is usually fine.
- If you append input references and then extend them, later edits corrupt the output. Copy an interval with `list(iv)` before you extend it.

## Problem walkthroughs

### Summary Ranges

**Problem.** Given an ordered list of unique integers, return the smallest list of range strings that covers exactly its values. Use `"a->b"` for a run from `a` to `b`, and `"a"` for a single value.

**Example.**

```text
[0,1,2,4,5,7]
  -> ["0->2", "4->5", "7"]
[0,2,3,4,6,8,9]
  -> ["0", "2->4", "6", "8->9"]
```

**Steps.**
1. Walk with index `i`. Record `start = nums[i]`.
2. Advance `i` while the next value continues the run: `nums[i + 1] == nums[i] + 1`.
3. Emit the range, then step past the run and repeat:

   ```python
   (f"{start}" if start == nums[i]
    else f"{start}->{nums[i]}")
   ```
4. The input is in order and unique, so one forward walk is enough. A run can only continue by exactly +1.

**Complexity.** O(n) time / O(1) extra space beyond the output.

### Merge Intervals ★

**Problem.** You get a list of intervals `[start, end]` in any order. Merge every set of overlapping intervals into one, and return the result in order of start. Touching intervals such as `[1,4]` and `[4,5]` overlap.

**Example.**

```text
[[1,3],[2,6],[8,10],[15,18]]
  -> [[1,6],[8,10],[15,18]]
[[1,4],[4,5]] -> [[1,5]]
```

**Steps.**
1. Sort by start with `key=lambda iv: iv[0]`.
2. Seed the output with a copy of the first interval.
3. For each next `[start, end]`, check whether `start <= last[1]`. If so, it overlaps or touches the last block: extend with `last[1] = max(last[1], end)`. Otherwise append `[start, end]` as a new block.
4. The sort gives the invariant that makes one pass enough. Every interval that can merge with the current block arrives before any interval that cannot.

**Complexity.** O(n log n) time, from the sort / O(n) for the output.

### Insert Interval ★

**Problem.** `intervals` is in order of start, and no two of them overlap. Insert `new_interval` and merge where necessary. Return a list that is again in order with no overlaps. Do it in one O(n) pass, without a sort.

**Example.**

```text
[[1,3],[6,9]], new [2,5]
  -> [[1,5],[6,9]]

[[1,2],[3,5],[6,7],[8,10],[12,16]]
new [4,8]
  -> [[1,2],[3,10],[12,16]]
```

**Steps.**
1. Phase 1: copy every interval that ends strictly before `new_interval` starts (`intervals[i][1] < start`).
2. Phase 2: while intervals start at or before the end of `new_interval` (`intervals[i][0] <= end`), absorb them. Set `start = min(start, intervals[i][0])` and `end = max(end, intervals[i][1])`.
3. Append the absorbed `[start, end]`.
4. Phase 3: copy the rest unchanged.
5. One comparison puts each input interval in exactly one phase. That is the O(n) argument.

**Complexity.** O(n) time / O(n) for the output.

### Minimum Number of Arrows to Burst Balloons ★

**Problem.** Balloons are horizontal spans `[xstart, xend]`. An arrow shot straight up at position `x` bursts every balloon with `xstart <= x <= xend`. Return the smallest number of arrows that bursts all balloons.

**Example.**

```text
[[10,16],[2,8],[1,6],[7,12]] -> 2
(x = 6 bursts [2,8] and [1,6];
 x = 11 bursts [10,16] and [7,12])
[[1,2],[3,4],[5,6]] -> 3
[[1,2],[2,3],[3,4],[4,5]] -> 2
(x = 2, then x = 4)
```

**Steps.**
1. Sort by `xend` with `key=lambda p: p[1]`.
2. Shoot the first arrow at the first balloon's end (`arrow_x = points[0][1]`). That is the latest position that still bursts it, so it catches the most balloons after it.
3. Sweep. A balloon with `start <= arrow_x` is already burst, because the spans are inclusive. A balloon with `start > arrow_x` needs a new arrow: increment the count and set `arrow_x` to its end.
4. Exchange argument: any optimal solution can move its first arrow to the first balloon's end and still burst every balloon. So a commit to ends is never worse.

**Complexity.** O(n log n) time / O(1) extra space.

## Interview follow-ups

- After **Merge Intervals**: "Intervals arrive as a stream; merge as they come?" Use an ordered structure or an interval tree. Each insert is an Insert Interval. "Total covered length instead of the merged list?" Sum `end - start` over the merged blocks.
- After **Insert Interval**: "Why not append and sort again?" It costs O(n log n) instead of O(n), and it ignores the precondition. Say both. "Delete an interval instead?" Use the same three phases. The middle phase can emit up to two clipped pieces.
- After **Minimum Arrows**: "Largest number of non-overlapping balloons?" The greedy is the same. Arrows and selections give the same count when touching counts as overlap. "Fewest intervals to remove so the rest do not overlap?" Use n minus the largest non-overlapping count.
- Anywhere: "What if endpoints were exclusive?" Every `<=` in the overlap tests becomes `<`. State the rule again before you code.

## The task

You write three interval functions. Every interval `[start, end]` includes both endpoints. Return new lists. The tests do not read your changes to the inputs.

1. `merge_intervals(intervals: list[list[int]]) -> list[list[int]]` takes intervals `[start, end]` with `start <= end`, in any order.
2. The input can hold overlapping, touching, nested or duplicate intervals.
3. Merge every group of overlapping intervals. Return the merged list in order of start. Use O(n log n) time.
4. Touching intervals merge: `[1,4]` and `[4,5]` become `[1,5]`.
5. `insert_interval(intervals, new_interval)` returns a `list[list[int]]`. `intervals` is in order of start, with no two overlapping.
6. Insert `new_interval`, also a closed `[start, end]`, and merge as needed.
7. Return a list in order of start with no overlaps. Use one O(n) pass; do not sort.
8. Touching merges here too: `[5,7]` inserted into `[[1,5]]` gives `[[1,7]]`.
9. `min_arrows(points: list[list[int]]) -> int` takes balloons, where `points[i] = [xstart, xend]` is an inclusive horizontal span.
10. One arrow at position `x` bursts every balloon with `xstart <= x <= xend`.
11. Return the smallest number of arrows that bursts all balloons. Return `0` for an empty list. Use O(n log n) time.
12. When one balloon ends where another starts, one arrow at that shared point bursts both.

Edge cases:

- `merge_intervals`: an empty input returns `[]`. Handle a single interval, an interval that contains others and duplicate intervals.
- `merge_intervals`: handle zero-width intervals such as `[5,5]`, unordered input and negative coordinates.
- `insert_interval`: handle an empty `intervals` and a `new_interval` before or after everything, with no merge.
- `insert_interval`: handle a `new_interval` that absorbs the whole list, one inside an existing interval and a touch at either endpoint.
- `min_arrows`: an empty list returns `0`, and one balloon returns `1`. Balloons that share one point need `1`.
- `min_arrows`: handle chains of touching balloons, nested balloons and negative or large coordinates. Sort numerically.

```python
merge_intervals([[1, 3], [2, 6],
                 [8, 10], [15, 18]])
# [[1, 6], [8, 10], [15, 18]]
merge_intervals([[1, 4], [4, 5]])
# [[1, 5]]
merge_intervals([[1, 10], [2, 3],
                 [4, 5]])
# [[1, 10]]
merge_intervals([])  # []

insert_interval([[1, 3], [6, 9]],
                [2, 5])
# [[1, 5], [6, 9]]
insert_interval([[1, 2], [3, 5], [6, 7],
                 [8, 10], [12, 16]],
                [4, 8])
# [[1, 2], [3, 10], [12, 16]]
insert_interval([], [5, 7])
# [[5, 7]]
insert_interval([[1, 5]], [2, 3])
# [[1, 5]] (fully contained)
insert_interval([[1, 5]], [5, 7])
# [[1, 7]]

min_arrows([[10, 16], [2, 8],
            [1, 6], [7, 12]])           # 2
min_arrows([[1, 2], [3, 4], [5, 6]])    # 3
min_arrows([[1, 2], [2, 3],
            [3, 4], [4, 5]])            # 2
min_arrows([])                          # 0
```
