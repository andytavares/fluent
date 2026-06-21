# Heaps and Priority Queues

## What you'll learn

How to implement a min-heap from scratch using an array and index arithmetic, and how to apply it to two canonical interview problems: finding the k largest elements and merging k sorted lists. TypeScript has no built-in heap — you build one.

## Key concepts

### Array-based heap indexing (0-indexed)

```
Parent of i:     Math.floor((i - 1) / 2)
Left child of i: 2 * i + 1
Right child of i: 2 * i + 2
```

The heap property: every parent is smaller than (or equal to) both children (min-heap). This guarantees `data[0]` is always the minimum.

### MinHeap implementation

```typescript
class MinHeap<T> {
  private data: T[] = [];
  constructor(private comparator: (a: T, b: T) => number) {}

  push(val: T): void {
    this.data.push(val);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const min = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;  // move last element to root
      this.sinkDown(0);     // restore heap property
    }
    return min;
  }

  peek(): T | undefined { return this.data[0]; }
  size(): number        { return this.data.length; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.comparator(this.data[i], this.data[parent]) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }

  private sinkDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.comparator(this.data[l], this.data[smallest]) < 0) smallest = l;
      if (r < n && this.comparator(this.data[r], this.data[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}
```

### k Largest elements — min-heap of size k

Keep a min-heap of exactly k elements. When a new element beats the heap minimum (i.e., heap exceeds size k after pushing), evict the minimum. After processing all n elements, the heap holds the k largest.

```typescript
function kLargestElements(nums: number[], k: number): number[] {
  const heap = new MinHeap<number>((a, b) => a - b);
  for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) heap.pop(); // evict the smallest
  }
  const result: number[] = [];
  while (heap.size() > 0) result.push(heap.pop()!);
  return result; // returns in ascending order; reverse if you need descending
}
// Time: O(n log k)  Space: O(k)
```

### Merge k sorted lists — min-heap of list heads

Push the head of each list into a min-heap. Repeatedly extract the minimum, advance that list's pointer, and push the next node.

```typescript
function mergeKSortedLists(lists: (ListNode | null)[]): ListNode | null {
  // Heap stores [value, list-index, node]
  const heap = new MinHeap<[number, number, ListNode]>((a, b) => a[0] - b[0]);

  for (let i = 0; i < lists.length; i++) {
    if (lists[i] !== null) heap.push([lists[i]!.val, i, lists[i]!]);
  }

  const dummy = new ListNode(0);
  let curr = dummy;

  while (heap.size() > 0) {
    const [, , node] = heap.pop()!;
    curr.next = node;
    curr = curr.next;
    if (node.next !== null) heap.push([node.next.val, 0, node.next]);
  }
  return dummy.next;
}
// Time: O(N log k)  Space: O(k)  where N = total nodes, k = number of lists
```

## Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| `push` | O(log n) | bubbleUp traverses at most log n levels |
| `pop` | O(log n) | sinkDown traverses at most log n levels |
| `peek` | O(1) | root element |
| `kLargestElements` | O(n log k) | n pushes, each O(log k) |
| `mergeKSortedLists` | O(N log k) | N total nodes, heap size bounded by k |

## Common variations

- **Kth largest element in a stream** — maintain a min-heap of size k; `peek()` is the kth largest
- **Top k frequent elements** — frequency map + min-heap on frequency
- **Find median from data stream** — two heaps: max-heap for lower half, min-heap for upper half
- **Dijkstra's shortest path** — min-heap on (distance, node)

## vs other languages

Python's `heapq` is a built-in min-heap. Java has `PriorityQueue<T>`. Go's `container/heap` requires implementing an interface. TypeScript has none — you build it. This makes TypeScript heap questions test both the heap data structure AND its application, which is why interviewers at FAANG companies commonly ask you to implement `MinHeap` from scratch.

## Watch out

- **`pop()` when size === 1**: do NOT call `sinkDown(0)` after popping when only one element remains. After `this.data.pop()`, `this.data.length` is 0, and you'd be setting `this.data[0] = undefined`. Guard with `if (this.data.length > 0)`.
- **Comparator direction**: `(a, b) => a - b` gives a min-heap (smallest at top). `(a, b) => b - a` gives a max-heap. Don't confuse these when implementing `kLargestElements` — you need a min-heap to efficiently evict the smallest.
- **Index arithmetic**: 0-based vs 1-based. With 0-based: parent = `Math.floor((i-1)/2)`, left = `2i+1`, right = `2i+2`. With 1-based: parent = `Math.floor(i/2)`, left = `2i`, right = `2i+1`. Pick one and stick to it.
- **`mergeKSortedLists` with empty lists**: filter nulls before pushing to the heap, or guard inside the loop. Pushing `null` would cause `null.val` to crash.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you find the median of a running stream?" (Two heaps: max-heap for the lower half, min-heap for the upper half. Rebalance after each insert. Median is either the top of one heap or the average of both tops.)
> - "What is `heapify` and when do you use it?" (Build a heap from an existing array in O(n) by sinking down from the last non-leaf. Preferred over n individual pushes which take O(n log n).)
> - "How does this relate to Dijkstra's algorithm?" (Dijkstra is `mergeKSortedLists` generalized to a graph: the heap holds (distance, node), and you relax edges when popping.)
> - "Can you implement a max-heap using your MinHeap?" (Yes — pass `(a, b) => b - a` as the comparator. Everything else is identical.)

## The task

Implement the `MinHeap<T>` class and two functions:

```typescript
// Generic min-heap backed by an array.
// comparator(a, b) < 0 means a should be above b in the heap.
class MinHeap<T> {
  constructor(comparator: (a: T, b: T) => number)
  push(val: T): void
  pop(): T | undefined
  peek(): T | undefined
  size(): number
}

// Return the k largest elements from nums in any order.
// nums=[3,2,1,5,6,4], k=2 → [5,6] (any order)
function kLargestElements(nums: number[], k: number): number[]

// Merge k sorted linked lists into one sorted list and return the head.
// lists=[[1,4,5],[1,3,4],[2,6]] → 1→1→2→3→4→4→5→6
// The ListNode class is defined in the stub.
function mergeKSortedLists(lists: (ListNode | null)[]): ListNode | null
```
