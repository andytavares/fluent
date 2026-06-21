# Heaps and Priority Queues

## What you'll learn

How a heap provides O(1) access to the current minimum (or maximum) with O(log n) insert/extract, how to implement one from scratch, and how to apply it to two canonical FAANG problems: top-K elements and merging K sorted lists.

## Key concepts

### Pattern 1 — Implement MinHeap (sift up / sift down)

Store as a 1D array: parent of index `i` is `(i-1)/2`; children are `2i+1` and `2i+2`.

```java
static class MinHeap {
    private final ArrayList<Integer> data = new ArrayList<>();

    public void push(int val) {
        data.add(val);
        siftUp(data.size() - 1);
    }

    public int pop() {
        int top = data.get(0);
        int last = data.remove(data.size() - 1);
        if (!data.isEmpty()) { data.set(0, last); siftDown(0); }
        return top;
    }

    public int peek() { return data.get(0); }

    private void siftUp(int i) {
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (data.get(parent) <= data.get(i)) break;
            Collections.swap(data, i, parent);
            i = parent;
        }
    }

    private void siftDown(int i) {
        int n = data.size();
        while (true) {
            int smallest = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && data.get(l) < data.get(smallest)) smallest = l;
            if (r < n && data.get(r) < data.get(smallest)) smallest = r;
            if (smallest == i) break;
            Collections.swap(data, i, smallest);
            i = smallest;
        }
    }
}
```

### Pattern 2 — K largest elements with a min-heap of size k

Counterintuitively, finding the k *largest* uses a *min-heap*: keep k elements; evict the smallest whenever the heap exceeds k. After all elements, the heap holds the k largest.

```java
public static int[] kLargestElements(int[] nums, int k) {
    var heap = new PriorityQueue<Integer>(); // min-heap by default
    for (int n : nums) {
        heap.offer(n);
        if (heap.size() > k) heap.poll(); // drop the current minimum
    }
    return heap.stream().mapToInt(Integer::intValue).toArray();
}
```

### Pattern 3 — Merge K sorted lists with a priority queue

Seed the heap with the head of each list. On each extraction, add the extracted node's next node. The heap always gives you the globally minimum current node.

```java
public static ListNode mergeKSortedLists(ListNode[] lists) {
    // Min-heap ordered by node value
    var heap = new PriorityQueue<ListNode>((a, b) -> a.val - b.val);
    for (ListNode head : lists) {
        if (head != null) heap.offer(head);
    }
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    while (!heap.isEmpty()) {
        tail.next = heap.poll();
        tail = tail.next;
        if (tail.next != null) heap.offer(tail.next);
    }
    return dummy.next;
}
```

## Time and space complexity

| Operation | Time | Space | Why |
|-----------|------|-------|-----|
| `MinHeap.push` | O(log n) | O(1) | Sift up at most h = log n levels |
| `MinHeap.pop` | O(log n) | O(1) | Sift down at most h levels |
| `kLargestElements` | O(n log k) | O(k) | n insertions, each O(log k) |
| `mergeKSortedLists` | O(N log k) | O(k) | N total nodes; heap size ≤ k |

`N` = total nodes across all lists; `k` = number of lists.

## Common variations this pattern solves

1. **Find Median from Data Stream** — two heaps: max-heap for lower half, min-heap for upper half
2. **Task Scheduler** — max-heap to always pick the most frequent remaining task
3. **Kth Largest Element in a Stream** — maintain a min-heap of size k; peek is answer
4. **Dijkstra's Shortest Path** — min-heap ordered by tentative distance

## vs other languages

Python's `heapq` is a min-heap; for max-heap negate the values. Java's `PriorityQueue` is a min-heap; for max-heap use `Comparator.reverseOrder()`. Python `heapq.nlargest(k, iterable)` is the built-in equivalent of `kLargestElements`.

## Watch out

- **`PriorityQueue` is a min-heap by default**: `poll()` returns the *smallest* value. For k largest, that's what you want. For k smallest, use `Comparator.reverseOrder()`.
- **Comparator `(a, b) -> a.val - b.val` can overflow**: if `a.val` is `Integer.MIN_VALUE` and `b.val` is `Integer.MAX_VALUE`, subtraction wraps. Use `Integer.compare(a.val, b.val)` for safety.
- **Autoboxing cost**: `PriorityQueue<Integer>` boxes every `int`. For very large heaps, this matters. In interviews it's always acceptable.
- **`PriorityQueue` does not support O(log n) decrease-key**: reinsertion is the workaround (lazy deletion). Dijkstra implementations often use this pattern with a visited set.

## FAANG follow-up questions

> "What's the time complexity of building a heap from n elements?" — O(n) using the Floyd heapify algorithm (sift down from n/2 to 0). Not O(n log n) as you might guess from n pushes.
>
> "Can you merge K sorted lists in O(N log K) with divide and conquer?" — Yes: merge pairs, then pairs of pairs. Also O(N log K) but uses O(log K) stack space.
>
> "What if mergeKSortedLists receives an empty array of lists?" — Guard with `if (lists == null || lists.length == 0) return null;` before seeding the heap.
>
> "Why can't you just concatenate all lists and sort?" — O(N log N). The heap approach exploits the existing sorted order for O(N log K), which is better when K << N.

## The task

`ListNode` is defined in the test file:
```java
static class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}
```

Implement `MinHeap` as a static inner class, and two static methods in `Solution`:

```java
static class MinHeap {
    public void push(int val)  // insert val
    public int pop()           // remove and return the minimum
    public int peek()          // return the minimum without removing
}

// Returns an array of the k largest elements in any order.
// [3,2,1,5,6,4], k=2 -> [5,6] (or [6,5])
public static int[] kLargestElements(int[] nums, int k)

// Merges k sorted linked lists into one sorted linked list.
// [[1->4->5],[1->3->4],[2->6]] -> [1->1->2->3->4->4->5->6]
public static ListNode mergeKSortedLists(ListNode[] lists)
```
