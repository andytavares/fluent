## What you build

You use `heapq`, Python's list-backed binary heap, three ways: bounded top-K, best-first expansion and the two-heap median. A heap keeps "the best element so far" readable in O(1), and inserts and deletes stay O(log n). This lesson builds on **Binary Tree**.

## Key concepts

### A heap answers "what is the minimum now?" again and again

An algorithm can ask for the current minimum or maximum while elements keep arriving. A sorted list is too expensive for that, with an O(n) insert. An unsorted list is too slow to query, with an O(n) minimum. A binary heap does both in O(log n), and that trade is the whole pattern. If you need the minimum only once, scan for it. A heap pays off when you ask again and again.

### A complete tree fits in a list with no pointers

A binary heap is a complete binary tree stored flat in a list. In a complete tree, every level is full. Only the last level can be partly full, and it fills left to right. Completeness makes pointer-free storage possible, because the count alone sets the shape.

| Node at index `i` | Where |
|-------------------|-------|
| parent | `(i - 1) // 2` |
| left child | `2 * i + 1` |
| right child | `2 * i + 2` |

The heap property for a min-heap: every node is ≤ its children. Nothing more. Siblings have no order, and the list is not sorted. Only the root is always the minimum.

### Every operation is one change plus one repair walk

A push appends at the end, which keeps the tree complete. Then it sifts the new value up.

```python
def push(a: list[int], value: int):
    a.append(value)
    i = len(a) - 1
    while i > 0:
        parent = (i - 1) // 2
        if a[i] >= a[parent]:
            break
        a[i], a[parent] = a[parent], a[i]
        i = parent
```

A pop saves the root and moves the last element to the root. Then it sifts that element down.

```python
def pop(a: list[int]) -> int:
    top = a[0]
    last = a.pop()
    if not a:
        return top
    a[0] = last
    i = 0
    while True:
        smallest = i
        for c in (2 * i + 1, 2 * i + 2):
            if (c < len(a) and
                    a[c] < a[smallest]):
                smallest = c
        if smallest == i:
            break
        a[i], a[smallest] = (
            a[smallest], a[i])
        i = smallest
    return top
```

Both walks touch one node per level. A complete tree with n nodes has ⌊log₂ n⌋ + 1 levels, so each walk is O(log n).

`heapq.heappush(heap, x)` and `heapq.heappop(heap)` do these two walks for you on a plain list. `heap[0]` is the peek. `heapq.heapify(items)` turns a list into a heap in place.

### Negation and tuples change the order without changing the sift code

`heapq` is a min-heap only, and it takes no comparator. Push `-x` and negate again on the way out to get a max-heap. Push tuples such as `(distance, node_id)` to order by the first field, then the next.

```python
import heapq

max_heap: list[int] = []
for x in (5, 1, 3):
    heapq.heappush(max_heap, -x)
-max_heap[0]  # 5: peek the maximum
```

### Bounded top-K uses a min-heap of size k

To find the k-th largest element of n, keep a min-heap of the k largest seen so far. Push each element. When the size is more than k, pop. The popped element is the smallest of k+1 candidates, so it cannot be in the top k. After the sweep, the root is the k-th largest.

```python
heap: list[int] = []
for x in nums:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)
return heap[0]
```

A min-heap for a "largest" question looks backwards, but it is the point. The root is the eviction candidate, so you always evict the worst of the kept set. It takes O(n log k) time and O(k) space. That beats a full sort, O(n log n), when k ≪ n.

### Best-first expansion uses the heap as a frontier

The candidate space can be huge, such as all m·n index pairs or all project schedules. When you need only the best few, put a seed set in the heap and expand lazily. Pop the best candidate, emit it and push only its direct successors. The heap property emits candidates in global sorted order, and you create only O(frontier) of them. Find K Pairs and IPO both have this shape.

### Two heaps give a streaming median

Split the numbers seen so far into two halves. `low` is a max-heap of the smaller half, stored negated; its root is the largest small number. `high` is a min-heap of the larger half; its root is the smallest large number. Keep their sizes within one element, and keep every element of `low` ≤ every element of `high`. Then you read the median from the roots in O(1). Each insert costs O(log n) for the push plus at most one rebalancing transfer.

### Complexity of the main problems

| Problem | Time | Space | Pattern |
|---------|------|-------|---------|
| Kth Largest Element in an Array | O(n log k) | O(k) | bounded top-K |
| Find K Pairs with Smallest Sums | O(k log k) | O(k) | best-first frontier |
| Find Median from Data Stream | O(log n) insert, O(1) query | O(n) | two heaps |

## Watch out

- `heapq` is a min-heap only. A forgotten negation on a max-heap peek or pop returns the wrong sign.
- A tie on the first tuple field compares the second field. If that field is not comparable, Python raises `TypeError`.
- Add an integer tiebreaker to stop that: `(priority, counter, payload)`.
- `heapq.heappop` on an empty list raises `IndexError`. Check `len(heap)` first.
- Sift-down must swap with the smaller child, not with any child that beats the parent.
- A swap with the larger child can put it above its sibling. Later pops then break.
- The heap list is not sorted. Only `heap[0]` has a known position. To get sorted output, pop again and again.
- In top-K, push first, then pop if the heap is too big.
- A pop before the push evicts the wrong element when the newcomer belongs in the top k.
- Decide which heap can be one larger. In this lesson, it is `low`. Rebalance toward that rule after every insert.
- If both heaps can lead, the median for an odd count is ambiguous.
- In Find K Pairs, pushing both `(i+1, j)` and `(i, j+1)` on every pop inserts most cells twice.
- To stop duplicates, track visited pairs in a set. Or use the seed-column trick, which pushes only `(i, j+1)`.

## Problem walkthroughs

### Kth Largest Element in an Array ★

**Problem.** Given an integer list `nums` and an integer `k` (`1 <= k <= len(nums)`), return the k-th largest element in sorted order. Duplicates count separately: the 2nd largest of `[3,3,1]` is `3`, not `1`.

**Example.**

```
nums = [3,2,1,5,6,4], k = 2 → 5
nums = [3,2,3,1,2,4,5,5,6], k = 4
  → 4
```

**Steps.**

1. Create an empty list `heap` to use as a min-heap. At all times, it holds the k largest elements seen so far.
2. For each `x` in `nums`, call `heapq.heappush(heap, x)`. If `len(heap) > k`, call `heapq.heappop(heap)`. That evicts the smallest of k+1 candidates, which is not among the k largest.
3. After the sweep, `heap[0]` is the smallest of the k largest: the k-th largest. Return it.
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

1. Pair up the projects and sort them by required capital, ascending. Keep an index `next_idx` into this list.
2. Create a max-heap of profits: push `-profit` for each affordable project. This heap is the pool of affordable projects.
3. Repeat `k` times. First, move every project with `capitals[next_idx] <= w` from the sorted list into the pool. Each project enters the heap exactly once across all rounds.
4. Then, if the pool is empty, stop early. More capital can never unlock fewer projects. Otherwise, set `w += -heapq.heappop(pool)`.

The greedy choice is safe. The best affordable project only grows `w`, and a larger `w` unlocks a superset of projects. Taking it never blocks anything.

**Complexity.** O(n log n + k log n) time, O(n) space.

### Find K Pairs with Smallest Sums ★

**Problem.** Given two integer lists `nums1` and `nums2`, both sorted ascending, and an integer `k`, return the `k` pairs `[u, v]` with the smallest sums `u + v`. `u` comes from `nums1` and `v` from `nums2`. Order them by sum, ascending. If fewer than `k` pairs exist, return them all.

**Example.**

```
nums1 = [1,7,11], nums2 = [2,4,6]
k = 3 → [[1,2],[1,4],[1,6]]
nums1 = [1,1,2], nums2 = [1,2,3]
k = 2 → [[1,1],[1,1]]
```

**Steps.**

1. Think of the m×n grid of index pairs `(i, j)`. Each row is sorted left to right, and each column top to bottom. Do not build this matrix, because m·n can be much larger than k.
2. Create a min-heap of `(sum, i, j)` triples, where `sum` is `nums1[i] + nums2[j]`. Seed it with the first column: `(i, 0)` for `i` from 0 to `min(k, len(nums1)) - 1`.
3. Seeding more than `k` rows is useless. The answer has at most `k` pairs, and the head of row `k` loses to the `k` heads above it.
4. Loop until you emit `k` pairs or the heap is empty. Pop the smallest `(sum, i, j)`, and add `[nums1[i], nums2[j]]` to the result. If the row successor `(i, j + 1)` exists, push it.

Why only the row successor: the column successor `(i + 1, j)` comes from the chain `(i + 1, 0)`, …, `(i + 1, j - 1)`. The seed started that chain. Every cell has exactly one path into the heap. You need no visited set, and you never emit a pair twice.

Why it is correct: when you pop a cell, you already popped every cell with a smaller sum. Its predecessor chain entered the heap earlier and beat it. So the emit order is the sum order.

**Complexity.** O(k log k) time. Each of at most k pops does one push into a heap of size at most min(k, m). The heap uses O(min(k, m)) space.

### Find Median from Data Stream ★

**Problem.** Design a `MedianFinder` class. `add_num(num)` accepts a number from a stream. `find_median()` returns the median of everything added so far. For an odd count, that is the middle value. For an even count, it is the average of the two middle values. Callers call both many times, in any order.

**Example.**

```python
mf = MedianFinder()
mf.add_num(1)
mf.add_num(2)
mf.find_median()  # 1.5
mf.add_num(3)
mf.find_median()  # 2
```

**Steps.**

1. Keep two heaps. `low` is a max-heap of the smaller half, with values stored negated. `high` is a min-heap of the larger half.
2. The rule: every `low` element is ≤ every `high` element. `len(low)` equals `len(high)`, or is exactly one more.
3. In `add_num`, if `low` is empty or `num <= -low[0]`, push `-num` into `low`. Otherwise, push `num` into `high`. This keeps the order rule, but it can break the size rule.
4. Rebalance with at most one transfer. If `len(low) > len(high) + 1`, pop the root of `low` and push its negation into `high`. If `len(high) > len(low)`, pop the root of `high` and push its negation into `low`. A transfer moves a root across the boundary, so the order rule holds.
5. In `find_median`, an odd total returns `-low[0]`, because the extra element lives in `low`. An even total returns `(-low[0] + high[0]) / 2`.

The invariant does all the work. The two roots always bracket the middle of the sorted order, so the median never needs a scan.

**Complexity.** O(log n) per `add_num`, O(1) per `find_median`, O(n) space. Follow-up shapes: for values in [0, 100], use counting buckets. For the median of a window, use two heaps plus lazy deletion.

## Interview follow-ups

- After Kth Largest: "Can you beat O(n log k)?" Quickselect is O(n) on average and O(n²) in the worst case. The heap wins for streams or adversarial input.
- After Kth Largest: "Find the k-th smallest." Flip to a max-heap of size k.
- After Find K Pairs: "Find the k-th smallest element in a matrix sorted by row and column." Use the same frontier walk; the grid is that matrix.
- After Find K Pairs: "Why not a visited set?" It works, but it costs O(k) extra memory and hashing. The one-path seeding gets the same result from the structure.
- After Find Median: "All values are in [0, 100]." Use 101 counting buckets: O(1) insert, O(100) query.
- After Find Median: "Find the median of the last w elements." Use two heaps plus lazy deletion, or an order-statistics tree.
- General: "Build a heap from n elements faster than n pushes." Heapify bottom-up, as `heapq.heapify` does: sift down from the last parent to the root. The total is O(n), by the classic amortization argument.

## The task

Python ships `heapq`, a min-heap over a plain list. Use it three ways. You need no custom heap class.

### `find_kth_largest(nums, k)`

`1 <= k <= len(nums)`.

1. Return the k-th largest element of `nums` in sorted order.
2. Duplicates count separately.
3. Aim for O(n log k) time and O(k) space. Keep a min-heap of the k largest, and evict its root when it grows past `k`.
4. Do not sort the whole list.

```python
# 5
find_kth_largest([3, 2, 1, 5, 6, 4], 2)
# 4
find_kth_largest([3,2,3,1,2,4,5,5,6], 4)
find_kth_largest([1], 1)  # 1
find_kth_largest([7, 7, 7], 2)  # 7
```

Edge cases:

- `k == 1`: the maximum.
- `k == len(nums)`: the minimum.
- Duplicates around the k-th rank.
- Negative numbers.
- A single-element list.

### `k_smallest_pairs(nums1, nums2, k)`

`nums1` and `nums2` are sorted ascending.

1. Return the `k` pairs `[u, v]` with the smallest sums. `u` comes from `nums1` and `v` from `nums2`.
2. Order the pairs by sum, ascending. Pairs with equal sums can appear in any order.
3. If fewer than `k` pairs exist, return all of them.
4. Never build all `m·n` pairs. Expand best-first from a seeded frontier.

```python
# [[1,2],[1,4],[1,6]]
k_smallest_pairs([1, 7, 11], [2, 4, 6], 3)
# [[1,1],[1,1]]
k_smallest_pairs([1, 1, 2], [1, 2, 3], 2)
# [[1,3],[2,3]]: only 2 pairs exist
k_smallest_pairs([1, 2], [3], 3)
k_smallest_pairs([], [1, 2], 5)  # []
```

Edge cases:

- `k` larger than `m·n`.
- Either list empty: return `[]`.
- Duplicate values: each index pair counts once.
- Negative numbers.
- `k = 1`.

### `class MedianFinder`

A streaming median. Numbers arrive one at a time. At any moment, you must give the median of everything seen so far.

1. `MedianFinder()` starts empty.
2. `add_num(num)` adds a number from the stream in O(log n).
3. `find_median()` returns the median of all numbers added so far, in O(1).
4. For an odd count, the median is the middle value. For an even count, it is the average of the two middle values.
5. Callers call `find_median()` only after at least one `add_num`.

```python
mf = MedianFinder()
mf.add_num(1)
mf.add_num(2)
mf.find_median()  # 1.5
mf.add_num(3)
mf.find_median()  # 2
```

Edge cases:

- A single element: the median is that element.
- Duplicates: `[2, 2, 2]` gives 2.
- Descending insertion order.
- Negative numbers.
- Even counts give medians that are not integers, such as `1.5`.
- `add_num` and `find_median` calls can interleave.
