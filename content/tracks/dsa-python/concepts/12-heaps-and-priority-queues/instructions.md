# Heaps and Priority Queues

## What you'll learn

How Python's `heapq` (always a min-heap) works, the negation trick for max-heaps, and how a heap of size k solves "k largest" in O(n log k) — significantly better than O(n log n) sorting for large n with small k.

## Key concepts

`heapq` is a **min-heap**. The smallest element is always at `h[0]`. There is no built-in max-heap; you negate values to simulate one.

```
heapq.heappush(h, val)    # O(log n)
heapq.heappop(h)          # O(log n) — removes and returns minimum
h[0]                       # O(1) peek
heapq.heapify(lst)        # O(n) — converts list in-place
heapq.nlargest(k, it)     # O(n log k)
heapq.nsmallest(k, it)    # O(n log k)
```

### MinHeap class

```python
import heapq

class MinHeap:
    def __init__(self) -> None:
        self._data: list[int] = []

    def push(self, val: int) -> None:
        heapq.heappush(self._data, val)

    def pop(self) -> int:
        return heapq.heappop(self._data)

    def peek(self) -> int:
        return self._data[0]    # O(1) — min is always at index 0

    def __len__(self) -> int:
        return len(self._data)
```

### K largest elements — min-heap of size k

Keep a min-heap of exactly k elements. When a new element arrives and is larger than the heap minimum, swap it in. After processing all n elements, the heap contains the k largest.

```python
def k_largest_elements(nums: list[int], k: int) -> list[int]:
    heap: list[int] = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)    # evict the current minimum
    return heap                    # unsorted; contains k largest
```

**Why a min-heap for "k largest"?** The heap's minimum is the sentinel: the "weakest" of our current candidates. When a new element beats the minimum, it earns a spot. If it doesn't, it can't possibly be in the top k.

### Merge K sorted lists — heap of (value, list_index, node)

```python
from __future__ import annotations
import heapq

class ListNode:
    def __init__(self, val: int = 0, next: "ListNode | None" = None) -> None:
        self.val = val
        self.next = next

def merge_k_sorted_lists(lists: list[ListNode | None]) -> ListNode | None:
    dummy = ListNode(0)
    curr = dummy
    heap: list[tuple[int, int, ListNode]] = []

    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))   # tie-break on index i

    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))

    return dummy.next
```

**Why `(val, i, node)` not `(val, node)`?** Python compares tuples element by element. If two values are equal, it tries to compare `ListNode` objects, which raises `TypeError` (no `<` defined). The index `i` acts as a deterministic tiebreaker.

## Time and space complexity

| Operation | Time |
|-----------|------|
| push | O(log n) |
| pop | O(log n) |
| peek | O(1) |
| heapify | O(n) |
| K largest (heap of k) | O(n log k) |
| Merge k lists (total n nodes) | O(n log k) |

## Common variations

- **Running Median** — two heaps: max-heap for lower half (negate values), min-heap for upper half. Balance after each insert so sizes differ by at most 1.
- **Top K Frequent Elements** — `Counter` + `heapq.nlargest(k, counter.keys(), key=counter.get)`
- **Dijkstra's Algorithm** — heap of `(distance, node)`; update neighbors on each pop
- **Find Kth Largest in Stream** — maintain a min-heap of size k; peek gives the kth largest

## vs other languages

Java has `PriorityQueue` (min-heap by default) and accepts a `Comparator` for max-heap. C++ has `std::priority_queue` (max-heap by default; use `std::greater<>` for min). Python's negation trick is a common interview answer — in production, use `(-val, original_val)` if you need to recover the original value.

`heapq.nlargest` and `heapq.nsmallest` use a heap internally but are more convenient than manual heap management. For `k == 1`, they just call `max()` / `min()`.

## Watch out

- **`heapq` is min-heap only.** For max-heap: push `-val`, pop and negate: `max_val = -heapq.heappop(h)`.
- **`heapify` mutates the list in-place** — don't pass a list you still need in its original form.
- **Tuples with non-comparable objects** raise `TypeError` when values tie. Always include an integer tiebreaker: `(val, i, obj)`.
- **`k_largest_elements` returns an unsorted list** (it's the heap's internal array). Sort it if order matters: `return sorted(heap)`.
- **`heappop` on an empty list raises `IndexError`** — always check `len(h) > 0` or handle the exception.

## FAANG follow-up questions

> "When would you use `heapq.nlargest(k, nums)` vs a manual heap loop?" — For a one-shot query on a static array, `nlargest` is cleaner. For streaming data (elements arrive one at a time), the manual loop maintains a running k-largest heap.

> "What's the space complexity of merge_k_sorted_lists?" — O(k) for the heap (at most k elements, one per list). The output list is O(n) but that's inherent to the problem.

> "How does `heapify` achieve O(n) when n pushes would be O(n log n)?" — `heapify` uses sift-down on each non-leaf from bottom to top. Nodes near the bottom (majority of nodes) do very little work; only the root does O(log n) work. The sum telescopes to O(n).

## The task

```python
import heapq

class MinHeap:
    """A min-heap backed by heapq."""
    def __init__(self) -> None: ...
    def push(self, val: int) -> None: ...
    def pop(self) -> int: ...
    def peek(self) -> int: ...
    def __len__(self) -> int: ...

def k_largest_elements(nums: list[int], k: int) -> list[int]:
    """Return the k largest elements in any order."""

def merge_k_sorted_lists(lists: list["ListNode | None"]) -> "ListNode | None":
    """Merge k sorted linked lists into one sorted list. Return the head."""
```

**Examples:**
- `MinHeap`: push 5, 3, 8 → peek = 3, pop = 3, peek = 5
- `k_largest_elements([3,2,1,5,6,4], 2)` → `[5,6]` (any order)
- `k_largest_elements([3,2,3,1,2,4,5,5,6], 4)` → `[4,5,5,6]` (any order)
- `merge_k_sorted_lists([[1,4,5],[1,3,4],[2,6]])` → `[1,1,2,3,4,4,5,6]`
- `merge_k_sorted_lists([[]])` → `[]`
