# Heap / Priority Queue

## What you'll learn

The heap pattern: keeping "the best element so far" retrievable in O(1) while insertions and deletions stay O(log n). JavaScript ships no heap in its standard library, so this lesson has two layers — implementing an array-backed binary heap correctly (part of the pattern, not busywork), and the three ways heaps show up in interviews: bounded top-K, best-first expansion of a huge candidate space, and the two-heap median split.

## Key concepts

### Why a heap at all

Whenever an algorithm repeatedly asks "what's the current minimum (or maximum)?" while elements keep arriving, a sorted array is too expensive (O(n) insert) and an unsorted one too slow to query (O(n) min). A binary heap does both in O(log n) — and that trade is the entire pattern. If you only need the min *once*, just scan; heaps pay off when the ask is repeated.

### The array trick — a complete tree with no pointers

A binary heap is a *complete* binary tree (every level full except possibly the last, filled left to right) stored flat in an array. Completeness is what makes pointer-free storage possible — the shape is fully determined by the count:

| Node at index `i` | Where |
|-------------------|-------|
| parent | `(i - 1) >> 1` |
| left child | `2 * i + 1` |
| right child | `2 * i + 2` |

The **heap property** for a min-heap: every node ≤ its children. Nothing more — siblings are unordered, and the array is *not* sorted. Only the root is guaranteed to be the minimum.

### The two repairs: sift up and sift down

Every heap operation is one array mutation plus one repair walk:

```js
// push: append at the end (keeps the tree complete), then sift UP
push(value) {
  this.items.push(value);
  let i = this.items.length - 1;
  while (i > 0) {
    const parent = (i - 1) >> 1;
    if (this.compare(this.items[i], this.items[parent]) >= 0) break;
    [this.items[i], this.items[parent]] = [this.items[parent], this.items[i]];
    i = parent;
  }
}

// pop: save the root, move the LAST element to the root, then sift DOWN
pop() {
  const top = this.items[0];
  const last = this.items.pop();
  if (this.items.length > 0) {
    this.items[0] = last;
    let i = 0;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < this.items.length && this.compare(this.items[l], this.items[smallest]) < 0) smallest = l;
      if (r < this.items.length && this.compare(this.items[r], this.items[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
      i = smallest;
    }
  }
  return top;
}
```

Both walks touch one node per level, and a complete tree with n nodes has ⌊log₂ n⌋ + 1 levels — hence O(log n). A comparator (`(a, b) => a - b` by default) turns the same code into a max-heap (`(a, b) => b - a`) or a heap of tuples (`(a, b) => a[0] - b[0]`) without touching the sift logic.

### Pattern 1 — bounded top-K: a min-heap of size k

To find the k-th **largest** element in a stream of n, keep a **min**-heap holding the k largest seen so far. Push each element; when size exceeds k, pop — the popped element is the smallest of the k+1 candidates, so it can't be in the top k. After the sweep the root *is* the k-th largest:

```js
const heap = new MinHeap();
for (const x of nums) {
  heap.push(x);
  if (heap.size() > k) heap.pop();
}
return heap.peek();
```

The counterintuitive inversion — min-heap for a "largest" question — is the point: the root is the *eviction candidate*, and you always evict the worst of the kept set. O(n log k) time, O(k) space; beats full sorting (O(n log n)) whenever k ≪ n.

### Pattern 2 — best-first expansion: heap as a frontier

When the candidate space is huge (all m·n index pairs, all project schedules) but you only need the best few, put a *seed set* in the heap and expand lazily: pop the best candidate, emit it, push only its immediate successors. The heap property guarantees you emit candidates in globally sorted order while only ever materializing O(frontier) of them. Find K Pairs and IPO are both this shape.

### Pattern 3 — two heaps: streaming median

Split the numbers seen so far into halves: a **max**-heap `low` (smaller half — its root is the largest small number) and a **min**-heap `high` (larger half — its root is the smallest large number). Keep them balanced within one element and every element of `low` ≤ every element of `high`. The median is then read off the roots in O(1); each insert costs O(log n) for the push plus at most one rebalancing transfer.

### Complexity of the flagship problems

| Problem | Time | Space | Pattern |
|---------|------|-------|---------|
| Kth Largest Element in an Array | O(n log k) | O(k) | bounded top-K |
| Find K Pairs with Smallest Sums | O(k log k) | O(k) | best-first frontier |
| Find Median from Data Stream | O(log n) insert, O(1) query | O(n) | two heaps |

## Watch out

- **`pop` on a one-element heap**: `this.items.pop()` empties the array — do **not** write the popped value back to index 0. Guard with a length check or you resurrect the element you just removed.
- **Sift-down must pick the *smaller* child**, not just any child that beats the parent. Swapping with the larger child can leave that child above its sibling, silently breaking the heap for later pops.
- **`(a, b) => a - b` returns a number, not a boolean.** If you write comparators returning `true`/`false`, `compare(x, y) < 0` misbehaves (`false < 0` is `false`, `true < 0` is `false` — everything looks equal-or-greater).
- **The heap array is not sorted.** `heap.items` in insertion-influenced order is meaningless; the only readable element is `items[0]`. To get sorted output, pop repeatedly.
- **Top-K eviction order**: push *then* pop-if-oversized. Popping first compares the newcomer against a heap that's still allowed to grow, and evicts the wrong element when the newcomer belongs in the top k.
- **Two-heap balance direction**: decide which heap may be one larger (this lesson: `low`) and rebalance toward that rule after *every* insert. If both heaps are allowed to lead, the odd-count median read becomes ambiguous.
- **Duplicate suppression in grid expansion**: in Find K Pairs, pushing both `(i+1, j)` and `(i, j+1)` from every pop inserts most cells twice. Either track visited pairs in a set or use the seed-column trick (walkthrough) that only ever pushes `(i, j+1)`.

## Problem walkthroughs

### Kth Largest Element in an Array ★

**Problem.** Given an integer array `nums` and an integer `k` (`1 <= k <= nums.length`), return the k-th largest element **in sorted order** — duplicates count separately (the 2nd largest of `[3,3,1]` is `3`, not `1`).

**Example.**

    nums = [3,2,1,5,6,4], k = 2          → 5
    nums = [3,2,3,1,2,4,5,5,6], k = 4    → 4

**Steps.**
1. Create a min-heap. It will hold, at all times, the k largest elements seen so far.
2. For each `x` in `nums`: `heap.push(x)`, then if `heap.size() > k`, `heap.pop()` — evicting the smallest of the k+1 candidates, which by definition is not among the k largest.
3. After the sweep, `heap.peek()` is the smallest of the k largest — exactly the k-th largest. Return it.
4. Invariant: an element is evicted only when k elements at least as large exist, so it can never be the answer.

**Complexity.** O(n log k) time / O(k) space. (Quickselect gets O(n) average — a good follow-up — but the heap version is deterministic and streams.)

### IPO

**Problem.** You have `w` starting capital and may complete at most `k` projects. Project `i` needs at least `capitals[i]` capital to start and adds `profits[i]` to your capital when done (no cost is spent). Projects can be done in any order, each at most once. Return the maximum capital after at most `k` projects.

**Example.**

    k = 2, w = 0, profits = [1,2,3], capitals = [0,1,1] → 4
    (do project 0 → w = 1, then project 2 → w = 4)

**Steps.**
1. Pair up and sort projects by required capital ascending; keep an index `next` into this list.
2. Create a **max**-heap of profits (comparator `(a, b) => b - a`) — the affordable pool.
3. Repeat `k` times: first move every project with `capitals[next] <= w` from the sorted list into the pool (each project enters the heap exactly once across all rounds); then, if the pool is empty, stop early (more capital can never unlock fewer projects); otherwise `w += pool.pop()`.
4. Greedy is safe because doing the highest-profit affordable project first only grows `w`, and a larger `w` unlocks a superset of projects — taking it never forecloses anything.

**Complexity.** O(n log n + k log n) time / O(n) space.

### Find K Pairs with Smallest Sums ★

**Problem.** Given two integer arrays `nums1` and `nums2`, both sorted ascending, and an integer `k`, return the `k` pairs `[u, v]` (`u` from `nums1`, `v` from `nums2`) with the smallest sums `u + v`, ordered by sum ascending. If fewer than `k` pairs exist, return them all.

**Example.**

    nums1 = [1,7,11], nums2 = [2,4,6], k = 3 → [[1,2],[1,4],[1,6]]
    nums1 = [1,1,2],  nums2 = [1,2,3], k = 2 → [[1,1],[1,1]]

**Steps.**
1. Think of the m×n grid of index pairs `(i, j)`. Each row is sorted left to right (nums2 ascending) and each column top to bottom (nums1 ascending) — a sorted matrix you must not materialize (m·n can dwarf k).
2. Create a min-heap of `[i, j]` index pairs ordered by `nums1[i] + nums2[j]`, and seed it with the first column: `(i, 0)` for `i` from 0 to `min(k, nums1.length) - 1`. Seeding beyond `k` rows is pointless — the answer takes at most `k` pairs, and row `k`'s head already loses to the `k` heads above it.
3. Loop until `k` pairs are emitted or the heap empties: pop the smallest `(i, j)`, push `[nums1[i], nums2[j]]` onto the result, and push its **row successor** `(i, j + 1)` if it exists.
4. Why only the row successor: `(i, j)`'s column successor `(i + 1, j)` is reachable from `(i + 1, j - 1)`, … , `(i + 1, 0)` — which was seeded. Every cell has exactly one path into the heap, so no visited-set is needed and no pair is emitted twice.
5. Correctness: whenever a cell is popped, every cell with a smaller sum has already been popped (its predecessor chain entered the heap earlier and beat it) — so emission order is sum order.

**Complexity.** O(k log k) time (each of ≤ k pops does one push into a heap of size ≤ min(k, m)) / O(min(k, m)) heap space.

### Find Median from Data Stream ★

**Problem.** Design a `MedianFinder` class: `addNum(num)` accepts a number from a stream; `findMedian()` returns the median of everything added so far — the middle value for an odd count, the average of the two middle values for an even count. Both are called many times, interleaved.

**Example.**

    const mf = new MedianFinder();
    mf.addNum(1); mf.addNum(2); mf.findMedian(); // 1.5
    mf.addNum(3);                mf.findMedian(); // 2

**Steps.**
1. Keep two heaps: `low`, a max-heap of the smaller half (comparator `(a, b) => b - a`), and `high`, a min-heap of the larger half. Rule: every `low` element ≤ every `high` element, and `low.size()` is either equal to or exactly one more than `high.size()`.
2. `addNum`: if `low` is empty or `num <= low.peek()`, push into `low`; else push into `high`. This preserves the ordering rule but may break the size rule.
3. Rebalance with at most one transfer: if `low.size() > high.size() + 1`, move `low.pop()` into `high`; if `high.size() > low.size()`, move `high.pop()` into `low`. Transfers move a *root* across the boundary, so ordering survives.
4. `findMedian`: odd total → `low.peek()` (the extra element lives in `low`); even total → `(low.peek() + high.peek()) / 2`.
5. The invariant does all the work: the two roots always bracket the middle of the sorted order, so the median never requires a scan.

**Complexity.** O(log n) per `addNum` / O(1) per `findMedian` / O(n) space. (Follow-up shapes: values bounded in [0, 100] → counting buckets; median-of-window → two heaps plus lazy deletion.)

## Interview follow-ups

- After **Kth Largest**: "Can you beat O(n log k)?" (quickselect: O(n) average, O(n²) worst; heap wins for streams or adversarial input). "k-th *smallest*?" (flip to a max-heap of size k.)
- After **Find K Pairs**: "K-th smallest element in a row-and-column-sorted matrix?" (same frontier walk — the grid *is* that matrix.) "Why not a visited-set?" (works, but costs O(k) extra memory and hashing; the one-path seeding makes it structural.)
- After **Find Median**: "All values in [0, 100]?" (101 counting buckets, O(1) insert, O(100) query.) "Median of the last window of w elements?" (two heaps + lazy deletion, or an order-statistics tree.)
- General: "Build a heap from n elements faster than n pushes?" (heapify bottom-up: sift down from the last parent — O(n) total, the classic amortization argument.)

## The task

JavaScript has no built-in priority queue, so first build one, then use it three ways. Everything below is exported from the same file; `findKthLargest`, `kSmallestPairs`, and `MedianFinder` should be built on your `MinHeap`.

### `class MinHeap`

An array-backed binary min-heap with an optional comparator.

- `new MinHeap(compare?)` — `compare(a, b)` returns a negative number when `a` must sit above `b`; defaults to `(a, b) => a - b` (numeric min-heap). Passing `(a, b) => b - a` must yield a max-heap.
- `push(value)` — inserts in O(log n).
- `pop()` — removes and returns the top (smallest by the comparator); returns `undefined` on an empty heap.
- `peek()` — returns the top without removing it; `undefined` when empty.
- `size()` — number of elements.

```js
const h = new MinHeap();
h.push(5); h.push(1); h.push(3);
h.size(); // 3
h.peek(); // 1
h.pop();  // 1
h.pop();  // 3
h.pop();  // 5
h.pop();  // undefined

const max = new MinHeap((a, b) => b - a);
max.push(5); max.push(1); max.push(3);
max.pop(); // 5
```

Edge cases: pop/peek on empty (`undefined`), duplicate values, interleaved push/pop sequences, comparators over non-number values (e.g. `(a, b) => a[0] - b[0]` on tuples).

### `findKthLargest(nums, k)`

Return the k-th largest element of `nums` in sorted order — duplicates count separately. `1 <= k <= nums.length`. Target O(n log k) time and O(k) space: keep a min-heap of the k largest and evict its root when it grows past `k`. Do not sort the whole array.

```js
findKthLargest([3, 2, 1, 5, 6, 4], 2);          // 5
findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4); // 4
findKthLargest([1], 1);                         // 1
findKthLargest([7, 7, 7], 2);                   // 7
```

Edge cases: `k === 1` (maximum), `k === nums.length` (minimum), duplicates around the k-th rank, negative numbers, single-element array.

### `kSmallestPairs(nums1, nums2, k)`

`nums1` and `nums2` are sorted ascending. Return the `k` pairs `[u, v]` (`u` drawn from `nums1`, `v` from `nums2`) with the smallest sums, **ordered by sum ascending**; pairs with equal sums may appear in any order among themselves. If the arrays offer fewer than `k` pairs total, return all of them. Never materialize all `m·n` pairs — expand best-first from a seeded frontier.

```js
kSmallestPairs([1, 7, 11], [2, 4, 6], 3); // [[1,2],[1,4],[1,6]]
kSmallestPairs([1, 1, 2], [1, 2, 3], 2);  // [[1,1],[1,1]]
kSmallestPairs([1, 2], [3], 3);           // [[1,3],[2,3]]  (only 2 pairs exist)
kSmallestPairs([], [1, 2], 5);            // []
```

Edge cases: `k` larger than `m·n`, either array empty, duplicate values (each index pair counts once), negative numbers, `k = 1`.

### `class MedianFinder`

A streaming median: numbers arrive one at a time, and the median of everything seen so far must be answerable at any moment.

- `new MedianFinder()` — starts empty.
- `addNum(num)` — adds a number from the stream. O(log n).
- `findMedian()` — returns the median of all numbers added so far: the middle value when the count is odd, the average of the two middle values when even. O(1). Only called after at least one `addNum`.

```js
const mf = new MedianFinder();
mf.addNum(1);
mf.addNum(2);
mf.findMedian(); // 1.5
mf.addNum(3);
mf.findMedian(); // 2
```

Edge cases: a single element (median is that element), duplicates (`[2, 2, 2]` → 2), descending insertion order, negative numbers, non-integer medians from even counts (`1.5`), interleaved `addNum`/`findMedian` calls.
