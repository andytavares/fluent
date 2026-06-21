# Queues and Deques

## What you'll learn

Why `list.pop(0)` is a performance trap, how `collections.deque` enables O(1) FIFO, and how a monotonic deque solves sliding window maximum in O(n) — the same structure that powers BFS in grid problems like Rotting Oranges.

## Key concepts

**`collections.deque`** is Python's O(1) double-ended queue. `append` / `popleft` for FIFO. `appendleft` / `pop` for the other direction. `deque[0]` and `deque[-1]` are both O(1) peeks.

### Sliding window maximum — monotonic decreasing deque

Store **indices** in the deque, maintaining the invariant that `nums[dq[0]]` is always the maximum of the current window.

```python
from collections import deque

def sliding_window_maximum(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()   # indices; nums[dq[0]] is the window max
    result: list[int] = []
    for i, x in enumerate(nums):
        # Evict indices no longer in the window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        # Evict indices whose values are smaller — they can never be the max
        while dq and nums[dq[-1]] < x:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result
```

### RecentCounter — FIFO queue with expiry

```python
class RecentCounter:
    def __init__(self) -> None:
        self.q: deque[int] = deque()

    def ping(self, t: int) -> int:
        self.q.append(t)
        while self.q[0] < t - 3000:
            self.q.popleft()
        return len(self.q)
```

### Rotting Oranges — multi-source BFS on a grid

Classic BFS: seed the queue with all initially rotten oranges, spread rot level by level (each level = 1 minute), count minutes until no fresh orange remains.

```python
from collections import deque

def rotting_oranges(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    queue: deque[tuple[int, int]] = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    if fresh == 0:
        return 0

    minutes = 0
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    while queue and fresh > 0:
        minutes += 1
        for _ in range(len(queue)):         # process one full level (= 1 minute)
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))

    return minutes if fresh == 0 else -1
```

**Why multi-source BFS?** All rotten oranges rot simultaneously. Seeding the queue with all of them at the start means the BFS naturally simulates parallel spreading — level 1 = everything reachable in 1 minute from any rotten orange.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Sliding window maximum | O(n) | O(k) |
| RecentCounter.ping | O(1) amortized | O(window size) |
| Rotting Oranges | O(m·n) | O(m·n) |

## Common variations

- **Walls and Gates** — multi-source BFS from all gates simultaneously to fill distances
- **01 Matrix** — multi-source BFS from all zeros to find distance to nearest zero
- **Shortest Path in Binary Matrix** — BFS with 8-directional neighbors
- **LRU Cache** — deque + hash map (or `collections.OrderedDict.move_to_end`)

## vs other languages

`list.pop(0)` is O(n) in Python — every element shifts left. Java's `LinkedList` or `ArrayDeque` are O(1) for both ends. In Python, always use `collections.deque` for queues. `deque(maxlen=k)` automatically discards from the left when full — useful for fixed-size buffers but not for the monotonic deque pattern (you need selective, not automatic, removal).

## Watch out

- **Never use `list.pop(0)` as a queue** — O(n) per operation ruins BFS performance on large inputs.
- **Level-by-level BFS** requires snapshot of queue size (`for _ in range(len(queue))`) before the inner loop, otherwise you process next-level nodes in the same minute.
- **Rotting Oranges early exit:** if `fresh == 0` after counting, return 0 immediately — some cells might be unreachable (blocked by 0s), in which case return -1.
- **Monotonic deque stores indices** so you can compare to the current window boundary (`dq[0] < i - k + 1`).

## FAANG follow-up questions

> "What if you can't modify the grid in `rotting_oranges`?" — Use a `visited` set of `(r, c)` tuples instead of mutating `grid[nr][nc] = 2`.

> "What's the difference between BFS and Dijkstra for grid problems?" — BFS works when all edge weights are equal (1 step = 1 unit). When weights vary (e.g., stepping on certain cells costs more), use Dijkstra with a heap.

> "Can `sliding_window_maximum` be done with a sorted data structure instead?" — Yes, a sorted multiset (available in `sortedcontainers.SortedList`) gives O(log k) per operation. The deque solution is O(1) amortized and preferred.

## The task

```python
from collections import deque

def sliding_window_maximum(nums: list[int], k: int) -> list[int]:
    """Return the maximum value in each sliding window of size k."""

class RecentCounter:
    """Counts recent requests within a 3000ms sliding window."""
    def __init__(self) -> None: ...
    def ping(self, t: int) -> int:
        """Add a request at time t (ms, strictly increasing).
        Return count of requests in [t-3000, t] inclusive."""

def rotting_oranges(grid: list[list[int]]) -> int:
    """Given a grid where 0=empty, 1=fresh orange, 2=rotten orange,
    return the minimum minutes until no fresh orange remains,
    or -1 if it's impossible."""
```

**Examples:**
- `sliding_window_maximum([1,3,-1,-3,5,3,6,7], 3)` → `[3,3,5,5,6,7]`
- `sliding_window_maximum([1], 1)` → `[1]`
- RecentCounter: `ping(1)→1, ping(100)→2, ping(3001)→3, ping(3002)→3`
- `rotting_oranges([[2,1,1],[1,1,0],[0,1,1]])` → `4`
- `rotting_oranges([[2,1,1],[0,1,1],[1,0,1]])` → `-1`
- `rotting_oranges([[0,2]])` → `0`
