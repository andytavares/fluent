# Greedy Algorithms

## What you'll learn

When greedy works (and when it doesn't), the exchange argument that proves correctness, and how three canonical problems — jump game, merge intervals, and task scheduler — each illustrate a different flavor of greedy reasoning.

## Key concepts

A greedy algorithm makes the locally optimal choice at each step and never backtracks. It works when the problem has:
1. **Greedy choice property** — a locally optimal choice is always part of some globally optimal solution
2. **Optimal substructure** — the optimal solution contains optimal solutions to subproblems

### Jump Game — track max reachable index

```python
def can_jump(nums: list[int]) -> bool:
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False         # current position is unreachable
        farthest = max(farthest, i + jump)
    return True
```

**Greedy insight:** at every index, update the maximum reachable index. If `i > farthest`, we're at a position we could never have reached — early exit `False`.

### Merge Intervals — sort by start, scan once

```python
def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0][:]]         # copy first interval
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:     # overlaps (or touches) last merged
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged
```

### Task Scheduler — math on frequency counts

CPU tasks with cooldown `n`: the same task can't repeat within `n` intervals. Greedy insight: the most frequent task drives the minimum length.

```python
from collections import Counter

def task_scheduler(tasks: list[str], n: int) -> int:
    counts = Counter(tasks)
    max_count = max(counts.values())
    # How many tasks have the maximum frequency?
    num_max = sum(1 for c in counts.values() if c == max_count)
    # Formula: enough slots to run the most frequent task with all its cooldowns,
    # plus the other max-frequency tasks at the end of the last chunk.
    return max(len(tasks), (max_count - 1) * (n + 1) + num_max)
```

**Formula derivation:** arrange tasks in `max_count - 1` full chunks of `n + 1` slots each, then a final partial chunk of `num_max` tasks. If we have more tasks than idle slots can accommodate, no idle slots are needed: just return `len(tasks)`.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Jump Game | O(n) | O(1) |
| Merge Intervals | O(n log n) | O(n) output |
| Task Scheduler | O(n) | O(1) — 26 possible tasks |

## Common variations

- **Jump Game II** — minimum number of jumps; greedy: at each step pick the position that extends your reach the most
- **Non-overlapping Intervals** — minimum removals; sort by end time, greedily keep intervals with earliest end
- **Partition Labels** — each letter appears in at most one part; track last occurrence of each letter
- **Gas Station** — circular greedy: if total gas ≥ total cost, a solution exists; find the valid start

## vs dynamic programming

Greedy is a specialization of DP. Jump game can be solved with O(n²) DP; the greedy observation reduces it to O(n). Task scheduler can be solved by simulation; the math formula gives O(n). The greedy approach is always preferred when it's provably correct.

## Watch out

- **`intervals.sort()` mutates the input** — if the caller needs the original order, use `sorted(intervals, key=...)` instead.
- **Touching intervals (`start == merged[-1][1]`) should merge** — the condition is `<=` not `<`.
- **Task Scheduler edge case:** `n = 0` means no cooldown; answer is just `len(tasks)`. The formula handles this: `(max_count - 1) * 1 + num_max`, which is always ≤ `len(tasks)` when `n = 0`.
- **Counter import:** `from collections import Counter`. Don't confuse `Counter.values()` with `Counter.most_common()` — both work here, but `most_common()` returns sorted (value, count) pairs.

## FAANG follow-up questions

> "How does the exchange argument prove merge intervals is optimal?" — Assume an optimal solution that doesn't sort by start. We can always swap adjacent intervals to get the sorted order without making the solution worse. So sorted-start is always at least as good.

> "Can Jump Game II be solved greedily in O(n)?" — Yes. Track `current_end` (farthest you can reach with current jump count) and `next_end` (farthest reachable in one more jump). Increment jump count when you reach `current_end`.

> "What if task_scheduler has tasks with unknown labels (not just A-Z)?" — Replace `Counter` with a general frequency dict. The formula still works; `num_max` counts tasks with the highest frequency.

## The task

```python
def can_jump(nums: list[int]) -> bool:
    """Return True if you can reach the last index from index 0.
    nums[i] is the maximum jump length from position i."""

def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """Merge all overlapping intervals. intervals[i] = [start, end].
    Return the merged list sorted by start."""

def task_scheduler(tasks: list[str], n: int) -> int:
    """Return the minimum number of CPU intervals needed to finish all tasks.
    Each task takes 1 interval. The same task must wait at least n intervals
    before it can run again. You may insert idle intervals."""
```

**Examples:**
- `can_jump([2,3,1,1,4])` → `True`
- `can_jump([3,2,1,0,4])` → `False`
- `merge_intervals([[1,3],[2,6],[8,10],[15,18]])` → `[[1,6],[8,10],[15,18]]`
- `merge_intervals([[1,4],[4,5]])` → `[[1,5]]`
- `task_scheduler(["A","A","A","B","B","B"], 2)` → `8`
- `task_scheduler(["A","A","A","B","B","B"], 0)` → `6`
- `task_scheduler(["A","A","A","A","A","A","B","C","D","E","F","G"], 2)` → `16`
