# Queues and Deques

## What you'll learn

How FIFO queues power BFS traversal and sliding-time-window problems, and how a monotonic deque solves sliding window maximum in O(n). The third problem — rotting oranges — is the canonical multi-source BFS problem that appears in almost every FAANG loop.

## Key concepts

### Pattern 1 — Monotonic deque (Sliding Window Maximum)

Maintain a deque of indices in *decreasing value* order. The front always holds the maximum of the current window.

```java
var dq = new ArrayDeque<Integer>(); // indices; front = max
for (int i = 0; i < nums.length; i++) {
    // evict indices that have exited the window
    if (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst();
    // evict from the back any index whose value <= current (can never be max)
    while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();
    dq.offerLast(i);
    if (i >= k - 1) result[i - k + 1] = nums[dq.peekFirst()];
}
```

### Pattern 2 — Queue-based class (RecentCounter)

Track timestamps in a FIFO queue; evict anything older than `t - 3000`.

```java
class RecentCounter {
    private final ArrayDeque<Integer> queue = new ArrayDeque<>();

    public int ping(int t) {
        queue.offer(t);
        while (queue.peek() < t - 3000) queue.poll();
        return queue.size();
    }
}
```

### Pattern 3 — Multi-source BFS (Rotting Oranges)

Seed the BFS queue with all initially-rotten oranges simultaneously. BFS processes them layer by layer — each layer represents one additional minute.

```java
public static int rottingOranges(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    var queue = new ArrayDeque<int[]>();
    int fresh = 0;

    // Seed all rotten oranges at time 0
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) queue.offer(new int[]{r, c});
            else if (grid[r][c] == 1) fresh++;
        }
    }

    int minutes = 0;
    int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
    while (!queue.isEmpty() && fresh > 0) {
        minutes++;
        int size = queue.size(); // process one BFS level = one minute
        for (int i = 0; i < size; i++) {
            int[] cell = queue.poll();
            for (int[] d : dirs) {
                int nr = cell[0] + d[0], nc = cell[1] + d[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.offer(new int[]{nr, nc});
                }
            }
        }
    }
    return fresh == 0 ? minutes : -1;
}
```

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `slidingWindowMaximum` | O(n) | O(k) | Each index enters/leaves deque once |
| `RecentCounter.ping` | O(1) amortized | O(n) | Each timestamp enqueued/dequeued once |
| `rottingOranges` | O(m·n) | O(m·n) | Every cell visited at most once |

## Common variations this pattern solves

1. **Jump Game III** — multi-source BFS; reach index 0 by jumping
2. **Walls and Gates** — fill distance to nearest gate; seed all gates simultaneously
3. **Shortest Path in Binary Matrix** — BFS from top-left; shortest path in 0-cell grid
4. **Course Schedule II** — BFS (Kahn's algorithm) for topological sort

## vs other languages

Python uses `collections.deque` which is identical in concept to Java's `ArrayDeque`. The naming differs: Python uses `appendleft`/`popleft`; Java uses `offerFirst`/`pollFirst`. Both are O(1).

`LinkedList` implements `Deque` in Java but has worse cache performance than `ArrayDeque`. Never use `LinkedList` as a queue in production or interview code.

## Watch out

- **`ArrayDeque` does not accept `null`**: calling `offer(null)` throws `NullPointerException`. Use a sentinel object or a separate list if you need null entries.
- **`poll()` vs `pop()`**: `poll()` returns `null` on empty; `pop()` throws. For queue-style code, always use `poll()` with a null check or `!isEmpty()` guard.
- **`peekFirst() == -1` confusion**: in the monotonic deque, you push indices, not values. `peekFirst()` gives an *index*, not the max value. Get the value with `nums[dq.peekFirst()]`.
- **Mutating `grid` in rottingOranges**: marking cells as `2` in-place acts as the "visited" set. This is correct here, but be aware you're modifying the input — ask the interviewer if that's acceptable.
- **Multi-source BFS: initialize fresh count before the loop**: counting fresh oranges inside the BFS loop leads to subtle off-by-one errors.

## FAANG follow-up questions

> "Why multi-source BFS and not single-source?" — Starting BFS from each rotten orange separately and taking the maximum would give the wrong answer because spread happens simultaneously. Multi-source BFS models simultaneous spread correctly.
>
> "Can rottingOranges be solved with DFS?" — DFS can compute reachability but not minimum time without additional bookkeeping. BFS gives shortest-path naturally.
>
> "What if the grid changes during the spread (dynamic obstacles)?" — Standard BFS no longer works; you'd need a priority queue (Dijkstra) or time-expanded graph.
>
> "What's the difference between BFS levels and BFS total nodes?" — Tracking levels (the `size = queue.size()` trick) lets you count minutes. Without it, you'd know BFS order but not layer depth.

## The task

Implement `slidingWindowMaximum` and `rottingOranges` as static methods and `RecentCounter` as a static inner class in `Solution`:

```java
// Returns an array of maximums for each sliding window of size k.
// nums.length >= k, k >= 1
// [1,3,-1,-3,5,3,6,7], k=3 -> [3,3,5,5,6,7]
public static int[] slidingWindowMaximum(int[] nums, int k)

// Tracks requests in the most recent 3000ms (inclusive).
static class RecentCounter {
    public RecentCounter()
    public int ping(int t)  // t is strictly increasing
}

// Returns the minimum minutes until all fresh oranges rot.
// Returns -1 if it's impossible. 0=empty, 1=fresh, 2=rotten.
// [[2,1,1],[1,1,0],[0,1,1]] -> 4
public static int rottingOranges(int[][] grid)
```
