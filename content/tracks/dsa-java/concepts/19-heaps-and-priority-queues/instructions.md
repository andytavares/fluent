## What you build

You use a binary heap three ways: bounded top-K, best-first expansion and the two-heap median. Java's `PriorityQueue` is that heap. A heap keeps "the best element so far" readable in O(1), and inserts and deletes stay O(log n). This lesson builds on **Binary Tree**.

## Key concepts

### A heap answers "what is the minimum now?" again and again

An algorithm can ask for the current minimum or maximum while elements keep arriving. A sorted array is too expensive for that, with an O(n) insert. An unsorted array is too slow to query, with an O(n) minimum. A binary heap does both in O(log n), and that trade is the whole pattern. If you need the minimum only once, scan for it. A heap pays off when you ask again and again.

### A complete tree fits in an array with no pointers

A binary heap is a complete binary tree stored flat in an array. In a complete tree, every level is full. Only the last level can be partly full, and it fills left to right. Completeness makes pointer-free storage possible, because the count alone sets the shape.

| Node at index `i` | Where |
|-------------------|-------|
| parent | `(i - 1) / 2` |
| left child | `2 * i + 1` |
| right child | `2 * i + 2` |

The heap property for a min-heap: every node is ≤ its children. Nothing more. Siblings have no order, and the array is not sorted. Only the root is always the minimum.

### Every operation is one change plus one repair walk

`PriorityQueue` does these walks for you. The code below shows what happens inside it. `push` appends at the end, which keeps the tree complete. Then it sifts the new value up.

```java
void push(int value) {
    List<Integer> a = items;
    a.add(value);
    int i = a.size() - 1;
    while (i > 0) {
        int parent = (i - 1) / 2;
        int c = cmp.compare(
            a.get(i), a.get(parent));
        if (c >= 0) break;
        Collections.swap(a, i, parent);
        i = parent;
    }
}
```

`pop` saves the root and moves the last element to the root. Then it sifts that element down.

```java
Integer pop() {
    List<Integer> a = items;
    if (a.isEmpty()) return null;
    Integer top = a.get(0);
    Integer last = a.remove(a.size() - 1);
    if (a.isEmpty()) return top;
    a.set(0, last);
    int i = 0;
    while (true) {
        int min = i;
        int l = 2 * i + 1, r = 2 * i + 2;
        if (l < a.size() && cmp.compare(
                a.get(l), a.get(min)) < 0)
            min = l;
        if (r < a.size() && cmp.compare(
                a.get(r), a.get(min)) < 0)
            min = r;
        if (min == i) break;
        Collections.swap(a, i, min);
        i = min;
    }
    return top;
}
```

Both walks touch one node per level. A complete tree with n nodes has ⌊log₂ n⌋ + 1 levels, so each walk is O(log n).

### A comparator changes the order without changing the sift code

The default `PriorityQueue` uses natural order, so it is a min-heap. `Comparator.reverseOrder()` makes a max-heap. `(a, b) -> Integer.compare(a[0], b[0])` makes a heap of tuples. The sift logic stays the same.

```java
PriorityQueue<Integer> max =
    new PriorityQueue<>(
        Comparator.reverseOrder());
max.offer(5); max.offer(9);
max.peek(); // 9
max.poll(); // 9
max.size(); // 1
```

`offer` inserts and `poll` removes the top, both in O(log n). `peek` reads the top in O(1). On an empty queue, `poll()` and `peek()` return `null`.

### Bounded top-K uses a min-heap of size k

To find the k-th largest element of n, keep a min-heap of the k largest seen so far. Push each element. When the size is more than k, pop. The popped element is the smallest of k+1 candidates, so it cannot be in the top k. After the sweep, the root is the k-th largest.

```java
PriorityQueue<Integer> heap =
    new PriorityQueue<>();
for (int x : nums) {
    heap.offer(x);
    if (heap.size() > k) heap.poll();
}
return heap.peek();
```

A min-heap for a "largest" question looks backwards, but it is the point. The root is the eviction candidate, so you always evict the worst of the kept set. It takes O(n log k) time and O(k) space. That beats a full sort, O(n log n), when k ≪ n.

### Best-first expansion uses the heap as a frontier

The candidate space can be huge, such as all m·n index pairs or all project schedules. When you need only the best few, put a seed set in the heap and expand lazily. Pop the best candidate, emit it and push only its direct successors. The heap property emits candidates in global sorted order, and you create only O(frontier) of them. Find K Pairs and IPO both have this shape.

### Two heaps give a streaming median

Split the numbers seen so far into two halves. `low` is a max-heap of the smaller half; its root is the largest small number. `high` is a min-heap of the larger half; its root is the smallest large number. Keep their sizes within one element, and keep every element of `low` ≤ every element of `high`. Then you read the median from the roots in O(1). Each insert costs O(log n) for the push plus at most one rebalancing transfer.

### Complexity of the main problems

| Problem | Time | Space | Pattern |
|---------|------|-------|---------|
| Kth Largest Element in an Array | O(n log k) | O(k) | bounded top-K |
| Find K Pairs with Smallest Sums | O(k log k) | O(k) | best-first frontier |
| Find Median from Data Stream | O(log n) insert, O(1) query | O(n) | two heaps |

## Watch out

- `PriorityQueue` is a min-heap by default. `poll()` returns the smallest value.
- For the k largest, the min-heap is what top-K needs. Do not add `Comparator.reverseOrder()` there.
- The comparator `(a, b) -> a - b` overflows when `a` and `b` are far apart. The sign wraps and the order breaks.
- Use `Integer.compare(a, b)` instead, or `Long.compare` for sums that can overflow `int`.
- The heap array is not sorted. Iterating a `PriorityQueue` or printing it shows heap order. Only `peek()` has a known position.
- To get sorted output, poll again and again.
- `poll()` returns `null` on an empty queue. `remove()` throws `NoSuchElementException`.
- In top-K, push first, then pop if the heap is too big.
- A pop before the push evicts the wrong element when the newcomer belongs in the top k.
- Decide which heap can be one larger. In this lesson, it is `low`. Rebalance toward that rule after every insert.
- If both heaps can lead, the median for an odd count is ambiguous.
- In Find K Pairs, pushing both `(i+1, j)` and `(i, j+1)` on every pop inserts most cells twice.
- To stop duplicates, track visited pairs in a set. Or use the seed-column trick, which pushes only `(i, j+1)`.

## Problem walkthroughs

### Kth Largest Element in an Array ★

**Problem.** Given an integer array `nums` and an integer `k` (`1 <= k <= nums.length`), return the k-th largest element in sorted order. Duplicates count separately: the 2nd largest of `[3,3,1]` is `3`, not `1`.

**Example.**

```
nums = [3,2,1,5,6,4], k = 2 → 5
nums = [3,2,3,1,2,4,5,5,6], k = 4
  → 4
```

**Steps.**

1. Create a min-heap. At all times, it holds the k largest elements seen so far.
2. For each `x` in `nums`, call `heap.offer(x)`. If `heap.size() > k`, call `heap.poll()`. That evicts the smallest of k+1 candidates, which is not among the k largest.
3. After the sweep, `heap.peek()` is the smallest of the k largest: the k-th largest. Return it.
4. The invariant: you evict an element only when k elements at least as large exist. So the evicted element is never the answer.

**Complexity.** O(n log k) time, O(k) space. Quickselect gets O(n) on average, which is a good follow-up. The heap version is deterministic and works on streams.

### IPO

**Problem.** You start with capital `w` and can complete at most `k` projects. Project `i` needs at least `capitals[i]` capital to start. When done, it adds `profits[i]` to your capital, and it costs nothing. You can do projects in any order, each at most once. Return the maximum capital after at most `k` projects.

**Example.**

```
k = 2, w = 0
profits = [1,2,3]
capitals = [0,1,1]
→ 4
(project 0 → w = 1,
 then project 2 → w = 4)
```

**Steps.**

1. Pair up the projects and sort them by required capital, ascending. Keep an index `next` into this list.
2. Create a max-heap of profits with `Comparator.reverseOrder()`. This heap is the pool of affordable projects.
3. Repeat `k` times. First, move every project with `capitals[next] <= w` from the sorted list into the pool. Each project enters the heap exactly once across all rounds.
4. Then, if the pool is empty, stop early. More capital can never unlock fewer projects. Otherwise, set `w += pool.poll()`.

The greedy choice is safe. The best affordable project only grows `w`, and a larger `w` unlocks a superset of projects. Taking it never blocks anything.

**Complexity.** O(n log n + k log n) time, O(n) space.

### Find K Pairs with Smallest Sums ★

**Problem.** Given two integer arrays `nums1` and `nums2`, both sorted ascending, and an integer `k`, return the `k` pairs `[u, v]` with the smallest sums `u + v`. `u` comes from `nums1` and `v` from `nums2`. Order them by sum, ascending. If fewer than `k` pairs exist, return them all.

**Example.**

```
nums1 = [1,7,11], nums2 = [2,4,6]
k = 3 → [[1,2],[1,4],[1,6]]
nums1 = [1,1,2], nums2 = [1,2,3]
k = 2 → [[1,1],[1,1]]
```

**Steps.**

1. Think of the m×n grid of index pairs `(i, j)`. Each row is sorted left to right, and each column top to bottom. Do not build this matrix, because m·n can be much larger than k.
2. Create a min-heap of `int[]{i, j}` index pairs, ordered by `nums1[i] + nums2[j]`. Seed it with the first column: `(i, 0)` for `i` from 0 to `min(k, nums1.length) - 1`.
3. Seeding more than `k` rows is useless. The answer has at most `k` pairs, and the head of row `k` loses to the `k` heads above it.
4. Loop until you emit `k` pairs or the heap is empty. Poll the smallest `(i, j)`, and add `{nums1[i], nums2[j]}` to the result. If the row successor `(i, j + 1)` exists, offer it.

Why only the row successor: the column successor `(i + 1, j)` comes from the chain `(i + 1, 0)`, …, `(i + 1, j - 1)`. The seed started that chain. Every cell has exactly one path into the heap. You need no visited set, and you never emit a pair twice.

Why it is correct: when you pop a cell, you already popped every cell with a smaller sum. Its predecessor chain entered the heap earlier and beat it. So the emit order is the sum order.

**Complexity.** O(k log k) time. Each of at most k pops does one push into a heap of size at most min(k, m). The heap uses O(min(k, m)) space.

### Find Median from Data Stream ★

**Problem.** Design a `MedianFinder` class. `addNum(num)` accepts a number from a stream. `findMedian()` returns the median of everything added so far. For an odd count, that is the middle value. For an even count, it is the average of the two middle values. Callers call both many times, in any order.

**Example.**

```java
MedianFinder mf = new MedianFinder();
mf.addNum(1);
mf.addNum(2);
mf.findMedian(); // 1.5
mf.addNum(3);
mf.findMedian(); // 2.0
```

**Steps.**

1. Keep two heaps. `low` is a max-heap of the smaller half, with `Comparator.reverseOrder()`. `high` is a min-heap of the larger half.
2. The rule: every `low` element is ≤ every `high` element. `low.size()` equals `high.size()`, or is exactly one more.
3. In `addNum`, if `low` is empty or `num <= low.peek()`, offer into `low`. Otherwise, offer into `high`. This keeps the order rule, but it can break the size rule.
4. Rebalance with at most one transfer. If `low.size() > high.size() + 1`, move `low.poll()` into `high`. If `high.size() > low.size()`, move `high.poll()` into `low`. A transfer moves a root across the boundary, so the order rule holds.
5. In `findMedian`, an odd total returns `low.peek()`, because the extra element lives in `low`. An even total returns `(low.peek() + high.peek()) / 2.0`.

The invariant does all the work. The two roots always bracket the middle of the sorted order, so the median never needs a scan.

**Complexity.** O(log n) per `addNum`, O(1) per `findMedian`, O(n) space. Follow-up shapes: for values in [0, 100], use counting buckets. For the median of a window, use two heaps plus lazy deletion.

## Interview follow-ups

- After Kth Largest: "Can you beat O(n log k)?" Quickselect is O(n) on average and O(n²) in the worst case. The heap wins for streams or adversarial input.
- After Kth Largest: "Find the k-th smallest." Flip to a max-heap of size k.
- After Find K Pairs: "Find the k-th smallest element in a matrix sorted by row and column." Use the same frontier walk; the grid is that matrix.
- After Find K Pairs: "Why not a visited set?" It works, but it costs O(k) extra memory and hashing. The one-path seeding gets the same result from the structure.
- After Find Median: "All values are in [0, 100]." Use 101 counting buckets: O(1) insert, O(100) query.
- After Find Median: "Find the median of the last w elements." Use two heaps plus lazy deletion, or an order-statistics tree.
- General: "Build a heap from n elements faster than n pushes." Heapify bottom-up: sift down from the last parent to the root. The total is O(n), by the classic amortization argument.

## The task

Java ships a binary heap: `java.util.PriorityQueue`. Use it, with comparators where needed, for all three problems. Write them in `Solution`.

### `findKthLargest(int[] nums, int k)`

`1 <= k <= nums.length`.

1. Return the k-th largest element of `nums` in sorted order.
2. Duplicates count separately.
3. Aim for O(n log k) time and O(k) space. Keep a min-heap of the k largest, and evict its root when it grows past `k`.
4. Do not sort the whole array.

```java
// 5
findKthLargest(
    new int[]{3, 2, 1, 5, 6, 4}, 2);
// 4
findKthLargest(
    new int[]{3,2,3,1,2,4,5,5,6}, 4);
findKthLargest(new int[]{1}, 1); // 1
// 7
findKthLargest(new int[]{7, 7, 7}, 2);
```

Edge cases:

- `k == 1`: the maximum.
- `k == nums.length`: the minimum.
- Duplicates around the k-th rank.
- Negative numbers.
- A single-element array.

### `kSmallestPairs(int[] nums1, int[] nums2, int k)`

`nums1` and `nums2` are sorted ascending.

1. Return a `List<int[]>` of the `k` pairs `{u, v}` with the smallest sums. `u` comes from `nums1` and `v` from `nums2`.
2. Order the pairs by sum, ascending. Pairs with equal sums can appear in any order.
3. If fewer than `k` pairs exist, return all of them.
4. Never build all `m·n` pairs. Expand best-first from a seeded frontier.

```java
// [[1,2],[1,4],[1,6]]
kSmallestPairs(new int[]{1, 7, 11},
    new int[]{2, 4, 6}, 3);
// [[1,1],[1,1]]
kSmallestPairs(new int[]{1, 1, 2},
    new int[]{1, 2, 3}, 2);
// [[1,3],[2,3]]: only 2 pairs exist
kSmallestPairs(new int[]{1, 2},
    new int[]{3}, 3);
// []
kSmallestPairs(new int[]{},
    new int[]{1, 2}, 5);
```

Edge cases:

- `k` larger than `m·n`.
- Either array empty: return an empty list.
- Duplicate values: each index pair counts once.
- Negative numbers.
- `k = 1`.

### `class MedianFinder`

A streaming median. Numbers arrive one at a time. At any moment, you must give the median of everything seen so far. `MedianFinder` is a static nested class of `Solution`.

1. `new MedianFinder()` starts empty.
2. `addNum(int num)` adds a number from the stream in O(log n).
3. `findMedian()` returns a `double`: the median of all numbers added so far, in O(1).
4. For an odd count, the median is the middle value. For an even count, it is the average of the two middle values.
5. Callers call `findMedian()` only after at least one `addNum`.

```java
MedianFinder mf = new MedianFinder();
mf.addNum(1);
mf.addNum(2);
mf.findMedian(); // 1.5
mf.addNum(3);
mf.findMedian(); // 2.0
```

Edge cases:

- A single element: the median is that element.
- Duplicates: `[2, 2, 2]` gives 2.
- Descending insertion order.
- Negative numbers.
- Even counts give medians that are not integers, such as `1.5`.
- `addNum` and `findMedian` calls can interleave.
