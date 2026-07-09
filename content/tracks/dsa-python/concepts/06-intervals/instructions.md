# Intervals

## What you'll learn

The two moves that solve virtually every interval problem: **sort by start, then sweep and merge** (Summary Ranges, Merge Intervals, Insert Interval) and **sort by end, then commit greedily** (Minimum Arrows, and every "maximum non-overlapping intervals" variant). You'll also learn to read each problem's overlap convention — whether touching endpoints count — before writing a single comparison.

## Key concepts

An interval is a pair `[start, end]` with `start <= end`, and in this concept endpoints are **inclusive** (closed intervals). Two closed intervals overlap when `a_start <= b_end and b_start <= a_end` — memorize that test; every off-by-one in interval code is a corruption of it.

### Sort by start, sweep, merge

Once intervals are sorted by start, all the intervals that should merge into one block are adjacent. Sweep left to right, comparing each interval against the **last merged block** (not the previous input interval):

```python
intervals.sort(key=lambda iv: iv[0])
merged = [list(intervals[0])]
for start, end in intervals[1:]:
    last = merged[-1]
    if start <= last[1]:
        last[1] = max(last[1], end)  # extend the block
    else:
        merged.append([start, end])  # gap — start a new block
```

Two details carry all the correctness:
- `start <= last[1]` uses `<=`, so touching intervals (`[1,4]` and `[4,5]`) merge — closed endpoints share the point 4.
- `max(last[1], end)` — a later interval can be entirely *inside* the block (`[1,10]` then `[2,3]`); blindly assigning `end` would shrink it.

### Insert without re-sorting — three phases

When the input is already sorted and non-overlapping, inserting one interval doesn't need a sort. Walk the list in three phases:

```python
i, n = 0, len(intervals)
start, end = new_interval
result = []
while i < n and intervals[i][1] < start:      # strictly before
    result.append(intervals[i])
    i += 1
while i < n and intervals[i][0] <= end:        # overlapping
    start = min(start, intervals[i][0])
    end = max(end, intervals[i][1])
    i += 1
result.append([start, end])
while i < n:                                   # strictly after
    result.append(intervals[i])
    i += 1
```

Phase boundaries are the overlap test split in half: `intervals[i][1] < start` means "ends before the new one begins"; `intervals[i][0] <= end` means "begins before the new one ends". Everything the middle loop swallows gets folded into one interval.

### Sort by end, commit greedily

For "how many groups/arrows/removals" questions, sort by **end** and greedily commit to each interval's end point. The interval that ends first constrains everyone: any point that serves it must be at most its end, and choosing exactly its end keeps the most room for intervals to the right — the standard exchange argument.

```python
points.sort(key=lambda p: p[1])
arrows, arrow_x = 1, points[0][1]
for start, end in points:
    if start > arrow_x:   # this balloon starts after the last arrow — new arrow
        arrows += 1
        arrow_x = end
```

The same skeleton answers "maximum count of non-overlapping intervals" (each committed end starts a new selection) and "minimum intervals to remove" (n minus that maximum).

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Merge Intervals | O(n log n) | O(n) output | sort by start + sweep |
| Insert Interval | O(n) | O(n) output | three-phase walk (already sorted) |
| Minimum Arrows | O(n log n) | O(1) extra | sort by end + greedy commit |

## Watch out

- **Numeric key, always**: sorting a list of lists with the default comparator works correctly in Python for numeric elements (unlike JavaScript's string-based default), but always pass an explicit `key=lambda iv: iv[0]` anyway — it documents intent and protects you if the element type changes.
- **Compare against the merged block, not the previous input interval.** `[1,10],[2,3],[4,5]`: interval `[4,5]` overlaps the *block* `[1,10]` even though it doesn't touch `[2,3]`.
- **`max()` when extending** — containment (`[1,10]` swallowing `[2,3]`) is the case that breaks naive `last[1] = end`.
- **Know the touching convention per problem.** Merge Intervals: `[1,4]` and `[4,5]` merge (closed intervals share a point). Arrows: an arrow at `x = 4` bursts both `[1,4]` and `[4,6]` — so the "new arrow" test is strictly `start > arrow_x`.
- **Insert Interval is O(n) — don't append-and-sort.** Re-sorting works but throws away the sortedness the problem hands you; interviewers ask about it.
- **Don't mutate the caller's lists casually.** Sorting `intervals` in place is usually accepted, but appending the same list *references* into your output means later edits corrupt it — copy (`list(iv)`) when you extend or merge.

## Problem walkthroughs

### Summary Ranges

**Problem.** Given a sorted list of unique integers, return the smallest list of range strings covering exactly its values: `"a->b"` for a run from `a` to `b`, `"a"` for a lone value.

**Example.**

    [0,1,2,4,5,7] → ["0->2", "4->5", "7"]
    [0,2,3,4,6,8,9] → ["0", "2->4", "6", "8->9"]

**Steps.**
1. Walk with index `i`. Record `start = nums[i]`.
2. Advance `i` while the next value continues the run: `nums[i + 1] == nums[i] + 1`.
3. Emit `str(start)` if `start == nums[i]` else `f"{start}->{nums[i]}"`, then step past the run and repeat.
4. Sorted-and-unique input is what makes a single forward walk sufficient — a run can only ever continue by exactly +1.

**Complexity.** O(n) time / O(1) extra space beyond the output.

### Merge Intervals ★

**Problem.** Given a list of intervals `[start, end]` in arbitrary order, merge every set of overlapping intervals into one and return the result sorted by start. Touching intervals (`[1,4]`, `[4,5]`) count as overlapping.

**Example.**

    [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]
    [[1,4],[4,5]]                → [[1,5]]

**Steps.**
1. Sort by start with `key=lambda iv: iv[0]`.
2. Seed the output with a copy of the first interval.
3. For each subsequent `[start, end]`: if `start <= last[1]` (overlaps or touches the last merged block), extend with `last[1] = max(last[1], end)`; otherwise append `[start, end]` as a new block.
4. Sorting guarantees the invariant that makes one pass enough: every interval that could merge with the current block arrives before any interval that can't.

**Complexity.** O(n log n) time (the sort dominates) / O(n) for the output.

### Insert Interval ★

**Problem.** `intervals` is sorted by start and pairwise non-overlapping. Insert `new_interval`, merging where necessary, and return a list that is again sorted and non-overlapping. Do it in one O(n) pass — no re-sorting.

**Example.**

    intervals = [[1,3],[6,9]], new_interval = [2,5]
    → [[1,5],[6,9]]

    intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], new_interval = [4,8]
    → [[1,2],[3,10],[12,16]]

**Steps.**
1. Phase 1 — copy every interval that ends strictly before `new_interval` starts (`intervals[i][1] < start`).
2. Phase 2 — while intervals still begin at or before `new_interval`'s end (`intervals[i][0] <= end`), absorb them: `start = min(start, intervals[i][0])`, `end = max(end, intervals[i][1])`.
3. Append the absorbed `[start, end]`.
4. Phase 3 — copy the rest untouched.
5. Each input interval lands in exactly one phase, decided by one comparison — that's the O(n) argument.

**Complexity.** O(n) time / O(n) for the output.

### Minimum Number of Arrows to Burst Balloons ★

**Problem.** Balloons are horizontal spans `[xstart, xend]`. An arrow shot straight up at position `x` bursts every balloon with `xstart <= x <= xend`. Return the minimum number of arrows that bursts all balloons.

**Example.**

    [[10,16],[2,8],[1,6],[7,12]] → 2   (x = 6 bursts [2,8] and [1,6]; x = 11 bursts [10,16] and [7,12])
    [[1,2],[3,4],[5,6]]          → 3
    [[1,2],[2,3],[3,4],[4,5]]    → 2   (x = 2, then x = 4)

**Steps.**
1. Sort by `xend` with `key=lambda p: p[1]`.
2. Shoot the first arrow at the first balloon's end (`arrow_x = points[0][1]`) — the latest position that still bursts it, so it catches the most balloons after it.
3. Sweep: any balloon with `start <= arrow_x` is already burst (touching counts — inclusive spans). When a balloon has `start > arrow_x`, it needs a new arrow: increment the count and set `arrow_x` to *its* end.
4. Greedy exchange argument: any optimal solution can move its first arrow to the first balloon's end without un-bursting anything, so committing to ends is never worse.

**Complexity.** O(n log n) time / O(1) extra space.

## Interview follow-ups

- After **Merge Intervals**: "Intervals arrive as a stream — merge incrementally?" (an ordered structure / interval tree; each insert is Insert Interval). "Total covered length instead of the merged list?" (sum `end - start` over merged blocks.)
- After **Insert Interval**: "Why not append and re-sort?" (O(n log n) versus O(n), and it ignores the precondition — say both.) "Delete an interval instead?" (same three phases; the middle phase may emit up to two clipped pieces.)
- After **Minimum Arrows**: "Maximum number of non-overlapping balloons?" (identical greedy — arrows and selections are the same count when touching counts as overlap.) "Minimum intervals to remove to make the rest non-overlapping?" (n minus the maximum non-overlapping count.)
- Anywhere: "What if endpoints were exclusive?" (every `<=` in the overlap tests tightens to `<` — restate the convention before coding.)

## The task

Three interval classics. All intervals are closed: `[start, end]` includes both endpoints. Return new lists; don't rely on the tests reading your mutations of the inputs.

### `merge_intervals(intervals)`

Given a list of intervals `[start, end]` (`start <= end`, arbitrary order, possibly overlapping, touching, nested, or duplicated), merge every group of overlapping intervals and return the merged list **sorted by start**. Touching intervals merge: `[1,4]` and `[4,5]` become `[1,5]`. O(n log n) time.

```python
merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]])  # [[1,6],[8,10],[15,18]]
merge_intervals([[1, 4], [4, 5]])                     # [[1,5]]
merge_intervals([[1, 10], [2, 3], [4, 5]])            # [[1,10]]
merge_intervals([])                                   # []
```

Edge cases: empty input (`[]`), a single interval, an interval fully containing others, duplicate intervals, zero-width intervals (`[5,5]`), unsorted input with negative coordinates.

### `insert_interval(intervals, new_interval)`

`intervals` is sorted by start and pairwise non-overlapping. Insert `new_interval` (also `[start, end]`, closed) and merge as needed, returning a list that is again sorted by start and non-overlapping. Touching merges here too: inserting `[5,7]` into `[[1,5]]` yields `[[1,7]]`. Do it in a single O(n) pass — re-sorting defeats the point.

```python
insert_interval([[1, 3], [6, 9]], [2, 5])
# [[1,5],[6,9]]

insert_interval([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])
# [[1,2],[3,10],[12,16]]

insert_interval([], [5, 7])         # [[5,7]]
insert_interval([[1, 5]], [2, 3])   # [[1,5]]  (fully contained)
```

Edge cases: empty `intervals`, `new_interval` before everything / after everything (no merging), `new_interval` swallowing the whole list, `new_interval` fully inside an existing interval, touching at either endpoint.

### `min_arrows(points)`

`points[i] = [xstart, xend]` is a balloon's inclusive horizontal span. One arrow shot at position `x` bursts every balloon with `xstart <= x <= xend`. Return the minimum number of arrows needed to burst all balloons; `0` for an empty list. A balloon ending exactly where another starts can be burst by one arrow at that shared coordinate. O(n log n) time.

```python
min_arrows([[10, 16], [2, 8], [1, 6], [7, 12]])  # 2
min_arrows([[1, 2], [3, 4], [5, 6]])             # 3
min_arrows([[1, 2], [2, 3], [3, 4], [4, 5]])     # 2
min_arrows([])                                   # 0
```

Edge cases: empty list (`0`), one balloon (`1`), all balloons sharing a common point (`1`), chains of touching balloons, nested balloons, negative and large coordinates.
