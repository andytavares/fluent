# Queues and Deques

## What you'll learn

How queues enable BFS (breadth-first search) and how a monotonic deque enables O(n) sliding-window maximum. You'll implement three problems: sliding window maximum (monotonic deque), RecentCounter (FIFO queue), and rotting oranges (multi-source BFS on a grid).

## Key concepts

### Monotonic deque — sliding window maximum

The deque stores indices in decreasing order of their values. When a new element arrives, pop all smaller elements from the back — they can never be the window maximum. Pop from the front when the index falls outside the window.

```typescript
function slidingWindowMaximum(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // indices; front = current window max's index

  for (let i = 0; i < nums.length; i++) {
    // 1. Remove indices outside the window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift(); // O(n) but acceptable; use a real deque for O(1)
    }
    // 2. Maintain decreasing order: pop smaller elements from back
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }
    deque.push(i);

    // 3. Record maximum once window is fully formed
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }
  return result;
}
```

### FIFO queue — RecentCounter

A simple queue of timestamps. On each ping, enqueue the new timestamp and dequeue all timestamps older than `t - 3000`.

```typescript
class RecentCounter {
  private queue: number[] = [];

  ping(t: number): number {
    this.queue.push(t);
    while (this.queue[0] < t - 3000) {
      this.queue.shift();
    }
    return this.queue.length;
  }
}
```

### Multi-source BFS — Rotting Oranges

Start BFS simultaneously from all initially-rotten oranges. BFS on a grid guarantees the shortest path (minimum minutes to rot each fresh orange). Count remaining fresh oranges after BFS completes.

```typescript
function rottingOranges(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: [number, number][] = [];
  let fresh = 0;

  // Collect all initial rotten oranges and count fresh ones
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }

  const directions: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
  let minutes = 0;

  while (queue.length > 0 && fresh > 0) {
    minutes++;
    const size = queue.length; // process one "level" (one minute) at a time
    for (let i = 0; i < size; i++) {
      const [r, c] = queue.shift()!;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return fresh === 0 ? minutes : -1;
}
```

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `slidingWindowMaximum` | O(n) | O(k) | Each element pushed/popped from deque once |
| `RecentCounter.ping` | O(1) amortized | O(n) | Each timestamp added/removed once |
| `rottingOranges` | O(r·c) | O(r·c) | Each cell enqueued at most once |

## Common variations

- **First non-repeating character in a stream** — maintain a queue of candidates, invalidate with a frequency map
- **Open the lock (BFS)** — BFS on a 4-digit combination space
- **Jump game III** — BFS/DFS on reachable indices
- **Walls and gates** — multi-source BFS from all gate cells simultaneously (same pattern as rotting oranges)

## vs other languages

JavaScript's `Array.shift()` is O(n) — it copies every remaining element left. For production queues, use a linked list or a ring buffer. In algorithm interviews, `Array.shift()` is accepted because the O(n) constant is small and the problem constraints are bounded. Python's `collections.deque` gives true O(1) `popleft`. In Go, you'd use `container/list` or a slice with a head index.

## Watch out

- **BFS level-by-level**: capture `queue.length` before the inner loop. If you use `queue.length` as the loop condition directly, new items added during the loop extend the "current minute" — wrong.
- **`fresh > 0` in the while condition**: if there are no fresh oranges at the start, BFS should not run at all, and the answer is 0 (not -1). The `fresh === 0` check in the return handles this.
- **Mutating the grid**: the BFS marks visited cells as `2` in place. If the problem requires the original grid, copy it first.
- **Isolated fresh oranges**: a fresh orange with no path to a rotten orange will never be reached. After BFS, `fresh > 0` signals this case — return -1.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you implement `slidingWindowMaximum` with true O(1) deque operations?" (Use a doubly-linked list with head/tail pointers, or a circular buffer.)
> - "What if the grid in `rottingOranges` is huge and sparse?" (Store only the rotten and fresh cells; BFS on compressed adjacency still works.)
> - "How does `rottingOranges` differ from a single-source BFS?" (Multi-source BFS: all sources go into the queue before the first step. The "minute" is measured from the simultaneous spread, not from a single origin.)
> - "Can you solve `slidingWindowMaximum` without a deque?" (Segment tree or sparse table supports O(1) range max queries after O(n log n) preprocessing — overkill for this problem but valid.)

## The task

Implement three things:

```typescript
// Return the maximum value in each sliding window of size k.
// [1,3,-1,-3,5,3,6,7], k=3 → [3,3,5,5,6,7]
function slidingWindowMaximum(nums: number[], k: number): number[]

// Count requests within the most recent 3000ms.
// ping(t) adds a request at time t and returns the count in [t-3000, t].
// t values are strictly increasing across calls.
class RecentCounter {
  ping(t: number): number
}

// Given a grid of 0 (empty), 1 (fresh orange), 2 (rotten orange),
// return the minimum minutes until no fresh orange remains, or -1 if impossible.
// [[2,1,1],[1,1,0],[0,1,1]] → 4
// [[2,1,1],[0,1,1],[1,0,1]] → -1  (bottom-right orange isolated)
// [[0,2]]                   → 0
function rottingOranges(grid: number[][]): number
```
