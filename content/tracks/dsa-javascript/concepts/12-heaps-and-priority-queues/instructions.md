# Heaps and Priority Queues

## What you'll learn

How to implement a min-heap from scratch, use it for top-K queries, and apply it to merge K sorted lists — a problem that combines heap mechanics with linked list traversal.

## Key concepts

A heap is a complete binary tree stored in an array. Parent-child index relationships:

```
parent of i  = Math.floor((i - 1) / 2)
left child   = 2 * i + 1
right child  = 2 * i + 2
```

### Sift up (after push)

```js
_siftUp(i) {
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (this.heap[parent] <= this.heap[i]) break;
    [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
    i = parent;
  }
}
```

### Sift down (after pop)

```js
_siftDown(i) {
  const n = this.heap.length;
  while (true) {
    let smallest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
    if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;
    if (smallest === i) break;
    [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
    i = smallest;
  }
}
```

### Top K using min-heap of size k

Keep a min-heap of exactly k elements. When a new element exceeds the current minimum, it replaces it.

```js
function kLargestElements(nums, k) {
  const heap = new MinHeap();
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) heap.pop(); // evict current minimum
  }
  return heap.toArray();
}
```

### Merge K sorted lists — heap of list heads

Push all list heads. Pop the minimum, append to result, push that node's `next`.

```js
function mergeKSortedLists(lists) {
  const heap = new MinHeap((a, b) => a.val - b.val); // comparator
  for (const head of lists) if (head) heap.push(head);
  const dummy = new ListNode(0);
  let curr = dummy;
  while (heap.size()) {
    const node = heap.pop();
    curr.next = node;
    curr = curr.next;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}
```

## Time and space complexity

| Operation | Time | Space |
|-----------|------|-------|
| push | O(log n) | — |
| pop | O(log n) | — |
| peek | O(1) | — |
| kLargestElements | O(n log k) | O(k) |
| mergeKSortedLists | O(n log k) | O(k) |

`n` = total elements across all lists, `k` = number of lists.

## Common variations

- **Kth largest element in a stream** (LC 703) — maintain a min-heap of size k; answer is `peek()`
- **Find median from data stream** (LC 295) — two heaps: max-heap for lower half, min-heap for upper half
- **Task scheduler** (LC 621) — max-heap of task frequencies
- **Dijkstra's algorithm** — min-heap of `(cost, node)` pairs

## vs other languages

Python's `heapq` module is a min-heap. Java has `PriorityQueue` (min by default). JavaScript has nothing — you implement it or use an array-based simulation. The heap implementation here accepts a comparator to generalize to any ordering.

## FAANG follow-up questions

After mergeKSortedLists:
- "What's the time complexity if you merge pairs iteratively?" (O(n log k) — same asymptotically, but each pass is O(n * k/pairs) and you do O(log k) passes)
- "Can you do it without a heap?" (yes — divide and conquer merging; O(n log k))

After kLargestElements:
- "What if the array is already sorted?" (still O(n log k) — but you could short-circuit after k elements for sorted input)
- "What if k is close to n?" (use a max-heap of size n-k and pop n-k times; avoids processing all n elements in the heap)

## Watch out

- **siftDown swap direction**: always swap with the smaller child, not just any child that is smaller than the current node.
- **pop when size is 1**: after `heap.pop()` removes the last element, don't try to sift down — the heap is empty. Check `heap.length > 0` before placing the last element at root.
- **mergeKSortedLists null heads**: skip null heads when initializing the heap — lists can be empty.
- **Comparator for non-numeric heaps**: the basic MinHeap implementation here compares numbers directly. For `mergeKSortedLists`, you need to compare by `.val`. The stub provides a comparator-based extension.

## The task

### `MinHeap` class

Implement a min-heap with:
- `push(val)` — O(log n)
- `pop()` — remove and return minimum, O(log n)
- `peek()` — return minimum without removing, O(1)
- `size()` — O(1)

```js
const h = new MinHeap();
h.push(3); h.push(1); h.push(4);
h.peek() // 1
h.pop()  // 1
h.peek() // 3
```

### `kLargestElements(nums, k)`

Return an array of the k largest elements. Order does not matter.

```js
kLargestElements([3, 2, 1, 5, 6, 4], 2) // [5, 6] (any order)
kLargestElements([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) // [4, 5, 5, 6]
```

### `mergeKSortedLists(lists)`

Merge k sorted linked lists and return the merged sorted list. Use a min-heap of list nodes, comparing by `.val`.

```js
// [[1,4,5],[1,3,4],[2,6]] -> [1,1,2,3,4,4,5,6]
// [[]]  -> []
// []    -> null
```

A `ListNode` class and helper functions are provided in the stub.
