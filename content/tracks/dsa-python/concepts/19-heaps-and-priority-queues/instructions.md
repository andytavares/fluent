# Heap / Priority Queue

## What you'll learn

The heap pattern: keeping "the best element so far" retrievable in O(1) while insertions and deletions stay O(log n). Python ships a heap in the standard library — `heapq` — so this lesson is about its idioms: it's a **min-heap only**, ties on tuples fall through to later elements (so you need a tiebreaker to avoid comparing incomparable objects), and max-heaps are built by negating values on the way in and out. Then three ways heaps show up in interviews: bounded top-K, best-first expansion of a huge candidate space, and the two-heap median split.

## Key concepts

### Why a heap at all

Whenever an algorithm repeatedly asks "what's the current minimum (or maximum)?" while elements keep arriving, a sorted list is too expensive (O(n) insert) and an unsorted one too slow to query (O(n) min). A binary heap does both in O(log n) — and that trade is the entire pattern. If you only need the min *once*, just scan; heaps pay off when the ask is repeated.

### `heapq` — a min-heap over a plain list

`heapq` doesn't give you a heap *object* — it gives you free functions that treat an ordinary `list` as a binary min-heap, in place:

```python
import heapq

heap: list[int] = []
heapq.heappush(heap, 5)
heapq.heappush(heap, 1)
heapq.heappush(heap, 3)
heap[0]              # 1 — peek is just indexing; no function call, O(1)
heapq.heappop(heap)  # 1 — removes and returns the smallest
heapq.heapify(existing_list)  # turn any list into a heap in O(n), in place
```

There is no `pop`/`push` on a class — `heap` is just a `list` that `heapq` functions keep in heap order via the same array-indexed-tree layout every heap uses (`children of i are at 2i+1, 2i+2`). Nothing stops you from reading `heap[0]`, but don't iterate `heap` expecting sorted order — only the root is guaranteed to be the minimum.

### Max-heap via negation

`heapq` never gives you a max-heap directly. The standard trick: negate on push, negate again on pop or peek. The heap property `parent <= child` on negated values is exactly `parent >= child` on the originals.

```python
max_heap: list[int] = []
for x in (5, 1, 3):
    heapq.heappush(max_heap, -x)
largest = -max_heap[0]        # 5 — peek the max
-heapq.heappop(max_heap)      # 5 — pop the max
```

This works cleanly for numbers. For non-numeric payloads, negate a numeric *key* and carry the payload alongside it in a tuple (next section).

### Tuple ordering — sort by the first element, tiebreak on the rest

Pushing a tuple orders the heap by its elements left to right, exactly like comparing tuples anywhere else in Python: compare index 0 first, fall through to index 1 only on a tie, and so on.

```python
heapq.heappush(heap, (distance, node_id))   # ordered by distance, then node_id
```

This is also the fix for the classic `heapq` footgun: if two tuples tie on their first element and the *second* elements aren't comparable (two dicts, two custom objects with no `__lt__`), Python raises `TypeError` trying to break the tie. Always make every position in the tuple comparable — an integer index is the standard tiebreaker:

```python
heapq.heappush(heap, (priority, insertion_index, payload))
```

### Pattern 1 — bounded top-K: a min-heap of size k

To find the k-th **largest** element in a stream of n, keep a **min**-heap holding the k largest seen so far. Push each element; when size exceeds k, pop — the popped element is the smallest of the k+1 candidates, so it can't be in the top k. After the sweep the root *is* the k-th largest:

```python
heap: list[int] = []
for x in nums:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)
return heap[0]
```

The counterintuitive inversion — min-heap for a "largest" question — is the point: the root is the *eviction candidate*, and you always evict the worst of the kept set. O(n log k) time, O(k) space; beats full sorting (O(n log n)) whenever k ≪ n. (`heapq.nlargest(k, nums)[-1]` does the same thing with less code and is the idiomatic one-liner in production — build it by hand once so you understand what it's doing.)

### Pattern 2 — best-first expansion: heap as a frontier

When the candidate space is huge (all m·n index pairs, all project schedules) but you only need the best few, put a *seed set* in the heap and expand lazily: pop the best candidate, emit it, push only its immediate successors. The heap property guarantees you emit candidates in globally sorted order while only ever materializing O(frontier) of them. Find K Pairs and IPO are both this shape.

### Pattern 3 — two heaps: streaming median

Split the numbers seen so far into halves: a **max**-heap `low` (smaller half — its root is the largest small number, stored negated) and a **min**-heap `high` (larger half — its root is the smallest large number). Keep them balanced within one element and every element of `low` ≤ every element of `high`. The median is then read off the roots in O(1); each insert costs O(log n) for the push plus at most one rebalancing transfer.

### Complexity of the flagship problems

| Problem | Time | Space | Pattern |
|---------|------|-------|---------|
| Kth Largest Element in an Array | O(n log k) | O(k) | bounded top-K |
| Find K Pairs with Smallest Sums | O(k log k) | O(k) | best-first frontier |
| Find Median from Data Stream | O(log n) insert, O(1) query | O(n) | two heaps |

## Watch out

- **`heapq` is min-heap only.** Negate to simulate a max-heap, and remember to negate back on the way out — a forgotten negation on peek/pop is the most common bug in this lesson.
- **Ties on the second tuple element can raise `TypeError`.** If you push `(priority, payload)` and `payload` isn't comparable, a tie on `priority` crashes. Add an integer tiebreaker: `(priority, counter, payload)`.
- **The underlying list is not sorted.** `heap` in whatever order `heapq` left it is meaningless except at index 0; to get sorted output, pop repeatedly (or just call `sorted()` if you don't need incremental access).
- **Top-K eviction order**: push *then* pop-if-oversized. Popping first compares the newcomer against a heap that's still allowed to grow, and evicts the wrong element when the newcomer belongs in the top k.
- **Two-heap balance direction**: decide which heap may be one larger (this lesson: `low`) and rebalance toward that rule after *every* insert. If both heaps are allowed to lead, the odd-count median read becomes ambiguous.
- **`heapq.heappop` on an empty list raises `IndexError`** — check `len(heap) > 0` (or track a count) before popping.
- **Duplicate suppression in grid expansion**: in Find K Pairs, pushing both `(i+1, j)` and `(i, j+1)` from every pop inserts most cells twice. Either track visited pairs in a set or use the seed-column trick (walkthrough) that only ever pushes `(i, j+1)`.

## Problem walkthroughs

### Kth Largest Element in an Array ★

**Problem.** Given an integer list `nums` and an integer `k` (`1 <= k <= len(nums)`), return the k-th largest element **in sorted order** — duplicates count separately (the 2nd largest of `[3,3,1]` is `3`, not `1`).

**Example.**

    nums = [3,2,1,5,6,4], k = 2          → 5
    nums = [3,2,3,1,2,4,5,5,6], k = 4    → 4

**Steps.**
1. Start with an empty list `heap` used as a min-heap. It will hold, at all times, the k largest elements seen so far.
2. For each `x` in `nums`: `heapq.heappush(heap, x)`, then if `len(heap) > k`, `heapq.heappop(heap)` — evicting the smallest of the k+1 candidates, which by definition is not among the k largest.
3. After the sweep, `heap[0]` is the smallest of the k largest — exactly the k-th largest. Return it.
4. Invariant: an element is evicted only when k elements at least as large exist, so it can never be the answer.

**Complexity.** O(n log k) time / O(k) space. (Quickselect gets O(n) average — a good follow-up — but the heap version is deterministic and streams.)

### IPO

**Problem.** You have `w` starting capital and may complete at most `k` projects. Project `i` needs at least `capitals[i]` capital to start and adds `profits[i]` to your capital when done (no cost is spent). Projects can be done in any order, each at most once. Return the maximum capital after at most `k` projects.

**Example.**

    k = 2, w = 0, profits = [1,2,3], capitals = [0,1,1] → 4
    (do project 0 → w = 1, then project 2 → w = 4)

**Steps.**
1. Pair up and sort projects by required capital ascending; keep an index `next_idx` into this list.
2. Create a **max**-heap of profits: push `-profit` for each affordable project.
3. Repeat `k` times: first move every project with `capitals[next_idx] <= w` from the sorted list into the pool (each project enters the heap exactly once across all rounds); then, if the pool is empty, stop early (more capital can never unlock fewer projects); otherwise `w += -heapq.heappop(pool)`.
4. Greedy is safe because doing the highest-profit affordable project first only grows `w`, and a larger `w` unlocks a superset of projects — taking it never forecloses anything.

**Complexity.** O(n log n + k log n) time / O(n) space.

### Find K Pairs with Smallest Sums ★

**Problem.** Given two integer lists `nums1` and `nums2`, both sorted ascending, and an integer `k`, return the `k` pairs `[u, v]` (`u` from `nums1`, `v` from `nums2`) with the smallest sums `u + v`, ordered by sum ascending. If fewer than `k` pairs exist, return them all.

**Example.**

    nums1 = [1,7,11], nums2 = [2,4,6], k = 3 → [[1,2],[1,4],[1,6]]
    nums1 = [1,1,2],  nums2 = [1,2,3], k = 2 → [[1,1],[1,1]]

**Steps.**
1. Think of the m×n grid of index pairs `(i, j)`. Each row is sorted left to right (nums2 ascending) and each column top to bottom (nums1 ascending) — a sorted matrix you must not materialize (m·n can dwarf k).
2. Create a min-heap of `(sum, i, j)` triples — the sum orders the heap, `i` and `j` are plain integers so ties never hit an incomparable payload — and seed it with the first column: `(nums1[i] + nums2[0], i, 0)` for `i` from 0 to `min(k, len(nums1)) - 1`. Seeding beyond `k` rows is pointless — the answer takes at most `k` pairs, and row `k`'s head already loses to the `k` heads above it.
3. Loop until `k` pairs are emitted or the heap empties: pop the smallest `(sum, i, j)`, append `[nums1[i], nums2[j]]` to the result, and push its **row successor** `(nums1[i] + nums2[j+1], i, j + 1)` if it exists.
4. Why only the row successor: `(i, j)`'s column successor `(i + 1, j)` is reachable from `(i + 1, j - 1)`, … , `(i + 1, 0)` — which was seeded. Every cell has exactly one path into the heap, so no visited-set is needed and no pair is emitted twice.
5. Correctness: whenever a cell is popped, every cell with a smaller sum has already been popped (its predecessor chain entered the heap earlier and beat it) — so emission order is sum order.

**Complexity.** O(k log k) time (each of ≤ k pops does one push into a heap of size ≤ min(k, m)) / O(min(k, m)) heap space.

### Find Median from Data Stream ★

**Problem.** Design a `MedianFinder` class: `add_num(num)` accepts a number from a stream; `find_median()` returns the median of everything added so far — the middle value for an odd count, the average of the two middle values for an even count. Both are called many times, interleaved.

**Example.**

    mf = MedianFinder()
    mf.add_num(1); mf.add_num(2); mf.find_median()  # 1.5
    mf.add_num(3);                 mf.find_median()  # 2

**Steps.**
1. Keep two heaps: `low`, a max-heap of the smaller half (values stored negated), and `high`, a min-heap of the larger half (values stored as-is). Rule: every `low` element ≤ every `high` element, and `len(low)` is either equal to or exactly one more than `len(high)`.
2. `add_num`: if `low` is empty or `num <= -low[0]`, push `-num` onto `low`; else push `num` onto `high`. This preserves the ordering rule but may break the size rule.
3. Rebalance with at most one transfer: if `len(low) > len(high) + 1`, pop `low`'s root and push its negation onto `high`; if `len(high) > len(low)`, pop `high`'s root and push its negation onto `low`. Transfers move a *root* across the boundary, so ordering survives.
4. `find_median`: odd total → `-low[0]` (the extra element lives in `low`); even total → `(-low[0] + high[0]) / 2`.
5. The invariant does all the work: the two roots always bracket the middle of the sorted order, so the median never requires a scan.

**Complexity.** O(log n) per `add_num` / O(1) per `find_median` / O(n) space. (Follow-up shapes: values bounded in [0, 100] → counting buckets; median-of-window → two heaps plus lazy deletion.)

## Interview follow-ups

- After **Kth Largest**: "Can you beat O(n log k)?" (quickselect: O(n) average, O(n²) worst; heap wins for streams or adversarial input). "k-th *smallest*?" (flip to a max-heap of size k.)
- After **Find K Pairs**: "K-th smallest element in a row-and-column-sorted matrix?" (same frontier walk — the grid *is* that matrix.) "Why not a visited-set?" (works, but costs O(k) extra memory and hashing; the one-path seeding makes it structural.)
- After **Find Median**: "All values in [0, 100]?" (101 counting buckets, O(1) insert, O(100) query.) "Median of the last window of w elements?" (two heaps + lazy deletion, or an order-statistics tree.)
- General: "Why does `heapq.heapify` achieve O(n) when n pushes would be O(n log n)?" (it sifts down from the last non-leaf upward; nodes near the bottom — the majority — do very little work, and the sum telescopes to O(n).)

## The task

Three heap-backed algorithms, all using `heapq` directly — no custom heap class needed.

### `find_kth_largest(nums, k)`

`nums` is a non-empty list of integers, `1 <= k <= len(nums)`. Return the k-th largest element **in sorted order** — duplicates count separately. Target O(n log k) time and O(k) space: keep a min-heap of the k largest and evict its root when it grows past `k`. Do not sort the whole list.

```python
find_kth_largest([3, 2, 1, 5, 6, 4], 2)          # 5
find_kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) # 4
find_kth_largest([1], 1)                         # 1
find_kth_largest([7, 7, 7], 2)                   # 7
```

Edge cases: `k == 1` (maximum), `k == len(nums)` (minimum), duplicates around the k-th rank, negative numbers, single-element list.

### `k_smallest_pairs(nums1, nums2, k)`

`nums1` and `nums2` are sorted ascending. Return the `k` pairs `[u, v]` (`u` drawn from `nums1`, `v` from `nums2`) with the smallest sums, **ordered by sum ascending**; pairs with equal sums may appear in any order among themselves. If the lists offer fewer than `k` pairs total, return all of them. Never materialize all `m·n` pairs — expand best-first from a seeded frontier.

```python
k_smallest_pairs([1, 7, 11], [2, 4, 6], 3) # [[1,2],[1,4],[1,6]]
k_smallest_pairs([1, 1, 2], [1, 2, 3], 2)  # [[1,1],[1,1]]
k_smallest_pairs([1, 2], [3], 3)           # [[1,3],[2,3]]  (only 2 pairs exist)
k_smallest_pairs([], [1, 2], 5)            # []
```

Edge cases: `k` larger than `m·n`, either list empty, duplicate values (each index pair counts once), negative numbers, `k = 1`.

### `class MedianFinder`

A streaming median: numbers arrive one at a time, and the median of everything seen so far must be answerable at any moment.

- `MedianFinder()` — starts empty.
- `add_num(num)` — adds a number from the stream. O(log n).
- `find_median()` — returns the median of all numbers added so far: the middle value when the count is odd, the average of the two middle values when even. O(1). Only called after at least one `add_num`.

```python
mf = MedianFinder()
mf.add_num(1)
mf.add_num(2)
mf.find_median()  # 1.5
mf.add_num(3)
mf.find_median()  # 2
```

Edge cases: a single element (median is that element), duplicates (`[2, 2, 2]` → 2), descending insertion order, negative numbers, non-integer medians from even counts (`1.5`), interleaved `add_num`/`find_median` calls.
