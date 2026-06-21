# Queues and Deques

## What you'll learn

Queue-based BFS patterns, the deque (double-ended queue) for O(n) sliding window maximum, and multi-source BFS for grid problems — three distinct FAANG archetypes all rooted in queue mechanics.

## Key concepts

A queue is FIFO: enqueue at the back, dequeue from the front. A deque supports O(1) push/pop from both ends. In JavaScript, arrays serve as deques — but `shift()` is O(n). For interview problems `shift()` is acceptable; acknowledge the tradeoff.

### Sliding window maximum — monotonic deque

Keep indices in the deque in decreasing value order. When `i` arrives, pop from the back anything smaller (can never be a future maximum). The front is always the current window maximum.

```js
const deque = []; // indices, decreasing value order
for (let i = 0; i < nums.length; i++) {
  if (deque.length && deque[0] < i - k + 1) deque.shift(); // expire old
  while (deque.length && nums[deque.at(-1)] < nums[i]) deque.pop(); // remove dominated
  deque.push(i);
  if (i >= k - 1) result.push(nums[deque[0]]); // front = max
}
```

### Rate limiting — RecentCounter

Queue timestamps; dequeue everything older than `t - 3000`.

```js
ping(t) {
  this.q.push(t);
  while (this.q[0] < t - 3000) this.q.shift();
  return this.q.length;
}
```

### Multi-source BFS — rotting oranges

Enqueue all initially rotten cells. BFS level-by-level; each level represents one minute. After BFS, if fresh oranges remain, return -1.

```js
const queue = [];
for (let r = 0; r < rows; r++)
  for (let c = 0; c < cols; c++)
    if (grid[r][c] === 2) queue.push([r, c, 0]);

let minutes = 0, freshCount = 0;
// count fresh oranges, then BFS...
// after BFS: return freshCount > 0 ? -1 : minutes
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| slidingWindowMaximum | O(n) | O(k) |
| RecentCounter.ping | O(1) amortized | O(n) |
| rottingOranges | O(m * n) | O(m * n) |

`slidingWindowMaximum`: each index is pushed and popped at most once regardless of the while loop.

## Common variations

- **Jump Game VI** (LC 1696) — deque DP; O(n) sliding window maximum over the DP array
- **Shortest path in binary matrix** (LC 1091) — BFS on a 0/1 grid
- **Walls and gates** (LC 286) — multi-source BFS from gates outward
- **Minimum knight moves** — BFS with visited set

## vs other languages

Python's `collections.deque` has O(1) `appendleft`/`popleft`. Java uses `ArrayDeque`. JavaScript has no built-in O(1) deque — `Array.shift()` is O(n). For large n, implement a proper deque with a doubly linked list or a circular buffer.

## FAANG follow-up questions

After slidingWindowMaximum:
- "Why a deque rather than a heap?" (heap gives O(n log k); deque is O(n) — but requires the monotonic invariant which is harder to reason about)
- "What's the deque invariant after each step?" (indices are in order; values at those indices are strictly decreasing)
- "What if k = nums.length?" (one window, deque resolves to a single maximum scan)

After rottingOranges:
- "How do you handle fresh oranges that are isolated (unreachable)?" (count all fresh oranges before BFS; after BFS if count > 0, return -1)
- "What if the grid has no fresh oranges at all?" (return 0 immediately after counting fresh oranges)

## Watch out

- **slidingWindowMaximum**: expire check is `deque[0] < i - k + 1`, not `<= i - k`. The window is `[i-k+1, i]` inclusive.
- **rottingOranges -1 case**: don't rely on queue emptying to signal all fresh oranges are gone — count fresh oranges before BFS and recount after.
- **rottingOranges 0 case**: if there are no fresh oranges at all, return 0 immediately.
- **RecentCounter boundary**: the window is `[t-3000, t]` inclusive — timestamps exactly equal to `t - 3000` are included.

## The task

### `slidingWindowMaximum(nums, k)`

Return an array of the maximum value in each sliding window of size `k`.

```js
slidingWindowMaximum([1, 3, -1, -3, 5, 3, 6, 7], 3) // [3, 3, 5, 5, 6, 7]
slidingWindowMaximum([1], 1)                          // [1]
```

### `RecentCounter`

Class with a single method `ping(t)`: records a new request at timestamp `t` (ms) and returns the number of requests in the range `[t - 3000, t]` inclusive.

```js
const rc = new RecentCounter();
rc.ping(1)    // 1
rc.ping(100)  // 2
rc.ping(3001) // 3
rc.ping(3002) // 3
```

### `rottingOranges(grid)`

`0` = empty cell, `1` = fresh orange, `2` = rotten orange. Every minute, rotten oranges spread to adjacent (4-directional) fresh oranges. Return minimum minutes until no fresh oranges remain, or `-1` if impossible.

```js
rottingOranges([[2,1,1],[1,1,0],[0,1,1]]) // 4
rottingOranges([[2,1,1],[0,1,1],[1,0,1]]) // -1
rottingOranges([[0,2]])                   // 0
```
