## What you build

You write `sortedArrayToBST`, `sortList` and `mergeKLists`. In each one, the right middle and the right combine step are the whole solution. This lesson builds on **Linked List Patterns** and **Binary Search Trees**.

## Key concepts

The stub defines `TreeNode` as `{ val, left, right }` and `ListNode` as `{ val, next }`, with `null` for a missing child.

### Divide and conquer has three moves

Divide splits the input, usually at the middle. Conquer recurses on each part. Combine joins the sub-answers.

When the split is balanced and the combine is linear, `T(n) = 2T(n/2) + O(n)` gives O(n log n). That is merge sort. When the combine is O(1), `T(n) = 2T(n/2) + O(1)` gives O(n). That is building a tree from a sorted array.

### The tests use plain-object nodes

A binary tree node is a `TreeNode` `{ val, left, right }`, and an absent child is `null`. A linked-list node is a `ListNode` `{ val, next }`, and the last node has `next: null`. You do not need classes; object literals create the nodes.

```ts
// Binary tree node
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}
// Linked-list node
interface ListNode {
  val: number;
  next: ListNode | null;
}
```

### Pick the middle of an array by index

To turn a sorted array into a height-balanced BST, make the middle element the root. Then recurse on the two halves.

```ts
// Inclusive bounds into nums
function build(
  lo: number,
  hi: number,
): TreeNode | null {
  if (lo > hi) return null;
  const mid = (lo + hi) >> 1;
  return {
    val: nums[mid],
    left: build(lo, mid - 1),
    right: build(mid + 1, hi),
  };
}
```

The BST property comes free: the array is sorted, so the values left of `mid` are smaller and the values right of it are larger. Balance comes free too. The halves differ in size by at most one, so subtree heights differ by at most one at every node. Recurse on index bounds, not on copied slices. Slicing turns O(n) into O(n log n) and wastes memory.

### Find the middle of a list with fast and slow pointers, then cut

A list has no index. Move `slow` one step and `fast` two steps. Then cut the list, so the two halves are independent.

```ts
// fast starts ahead, so slow stops
// at the tail of the first half
let slow: ListNode = head;
let fast = head.next;
while (fast && fast.next) {
  slow = slow.next!;
  fast = fast.next.next;
}
const mid = slow.next;
// Cut: without it the input never shrinks
slow.next = null;
```

When `fast` starts at `head.next`, a 2-node list splits into 1 + 1. With `fast = head`, it splits into 2 + 0 and recurses forever.

### The combine step merges two sorted lists

The combine step of merge sort is the Merge Two Sorted Lists routine from **Linked List Patterns**. It uses a dummy head and a tail pointer, and it always appends the smaller front node. It relinks the existing nodes and allocates only the dummy.

```ts
function mergeTwo(
  a: ListNode | null,
  b: ListNode | null,
): ListNode | null {
  const dummy: ListNode = {
    val: 0, next: null,
  };
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a; a = a.next;
    } else {
      tail.next = b; b = b.next;
    }
    tail = tail.next;
  }
  // Splice the leftover run
  tail.next = a ? a : b;
  return dummy.next;
}
```

### Merge k lists in pairs, not one by one

If you merge list 1 into list 2, then the result into list 3, you walk the early lists again and again: O(N·k) in total. Merge the lists in pairs instead, and halve the count each round. Each round touches every node once, and there are ⌈log₂ k⌉ rounds, so the total is O(N log k).

```ts
while (lists.length > 1) {
  const merged: (ListNode | null)[] = [];
  const n = lists.length;
  for (let i = 0; i < n; i += 2) {
    const a = lists[i];
    const b = lists[i + 1] ?? null;
    merged.push(mergeTwo(a, b));
  }
  lists = merged;
}
```

### Complexity of the flagship problems

| Problem | Recurrence | Time | Space |
|---------|-----------|------|-------|
| Convert Sorted Array to BST | T(n) = 2T(n/2) + O(1) | O(n) | O(log n) recursion |
| Sort List | T(n) = 2T(n/2) + O(n) | O(n log n) | O(log n) recursion |
| Merge k Sorted Lists | ⌈log k⌉ rounds × O(N) | O(N log k) | O(1) extra |
| Construct Quad Tree | T(n²) = 4T(n²/4) + O(n²) | O(n² log n) | O(log n) recursion |

## Watch out

- If Sort List does not set `slow.next = null`, both halves share a tail. The recursion never ends and overflows the stack.
- With `fast = head` in place of `head.next`, a 2-node list splits 2 + 0. It recurses forever.
- A `slice` per level allocates O(n) per level. The total becomes O(n log n) for an O(n) problem.
- For an even length, either middle works in `sortedArrayToBST`. Both give a valid height-balanced BST.
- Answers are not unique. The tests check balance and order, not one exact shape.
- Sort List and Merge k Lists must reuse the existing nodes. The tests check node identity.
- If you copy values into an array, sort it and build a new list, you miss the point and fail the tests.
- `sortList(null)`, `mergeKLists([])` and `mergeKLists([null, null])` all return `null`.
- A single-node list is already sorted. The base case is `head === null || head.next === null`.

## Problem walkthroughs

### Convert Sorted Array to Binary Search Tree ★

**Problem.** Given an array of distinct integers sorted ascending, build a height-balanced BST with exactly those values. At every node, the subtree heights differ by at most 1. Return the root, or `null` for an empty array. Any valid balanced arrangement passes.

**Example.**

```text
[-10,-3,0,5,9] → one valid answer:
      0
     / \
   -3   9
   /   /
-10   5
```

**Steps.**
1. Recurse on inclusive index bounds `(lo, hi)`. The base case `lo > hi` returns `null`.
2. Take `mid = (lo + hi) >> 1` and make `nums[mid]` the root of this subtree.
3. Build `left` from `(lo, mid - 1)` and `right` from `(mid + 1, hi)`.
4. Correctness: the sorted order makes the BST property automatic. Halving keeps the two subtree sizes within 1, so by induction the heights stay within 1 at every node.

**Complexity.** O(n) time, one node per element / O(log n) recursion depth.

### Sort List ★

**Problem.** Sort a singly linked list ascending in O(n log n) time. Relink the existing nodes; do not copy values and do not use arrays. Return the new head.

**Example.**

```text
4 → 2 → 1 → 3
→ 1 → 2 → 3 → 4
-1 → 5 → 3 → 4 → 0
→ -1 → 0 → 3 → 4 → 5
```

**Steps.**
1. Base case: a list of 0 or 1 nodes is sorted. Return it.
2. Divide: run fast and slow pointers with `fast = head.next`. After the loop, `slow` is the tail of the first half. Set `mid = slow.next`, then cut with `slow.next = null`.
3. Conquer: call `sortList(head)` and `sortList(mid)`.
4. Combine: merge the two sorted halves with the dummy-head merge routine.
5. Merge sort suits lists, because a merge needs only pointer rewires and no random access. That is why quicksort and heapsort, the array workhorses, do not transfer here.

**Complexity.** O(n log n) time / O(log n) recursion stack, with no extra nodes.

### Construct Quad Tree

**Problem.** Given an `n × n` binary grid, where `n` is a power of 2, build its quad tree. Each node is `{ isLeaf, val, topLeft, topRight, bottomLeft, bottomRight }`. A node is a leaf if and only if its whole region has one value. Otherwise, split the region into four `n/2 × n/2` quadrants and recurse.

**Example.**

```text
[[0,1],
 [1,0]]
→ root { isLeaf: false }
  with four leaf children 0,1,1,0
```

**Steps.**
1. Recurse on `(row, col, size)`, which describes a square region.
2. Base case `size === 1`: return a leaf with the value of that cell.
3. Build the four quadrant subtrees at `size / 2`.
4. Combine: if all four children are leaves with the same `val`, collapse them into one leaf with that value. Otherwise return an internal node that holds the four.
5. The collapse at combine time is the elegant part. The uniformity checks happen bottom-up for free, with no top-down scan of each region.

**Complexity.** O(n² log n) time naively, O(n²) with prefix-sum uniformity checks / O(log n) recursion depth.

### Merge k Sorted Lists ★

**Problem.** Given an array `lists` of `k` sorted linked-list heads, merge them into one sorted list that reuses the existing nodes. Entries can be `null`, and the array can be empty. Return the head, or `null` if there are no nodes.

**Example.**

```text
[[1,4,5],[1,3,4],[2,6]]
→ 1 → 1 → 2 → 3 → 4 → 4 → 5 → 6
[]     → null
[null] → null
```

**Steps.**
1. Write or reuse `mergeTwo(a, b)`, the dummy-head merge of two lists. It handles `null` inputs without extra code.
2. Reduce in rounds. While more than one list remains, merge `i` with `i + 1`, stepping by 2. An odd list at the end passes through unmerged.
3. Each round halves the list count. After ⌈log₂ k⌉ rounds one list remains. Return it, or `null` for an empty input.
4. Why not merge one by one? The nodes of the first list take part in all `k - 1` merges: O(N·k). In pairs, each node takes part in one merge per round: O(N log k).
5. A min-heap of list heads gives the same bound: pop the smallest, push its successor. Mention it in interviews; the pairwise version needs no extra data structure.

**Complexity.** O(N log k) time, where `N` is the total node count / O(1) extra space with the iterative pairwise loop.

## Interview follow-ups

After Convert Sorted Array to BST:
- "A sorted linked list in place of an array?" Convert it to an array first, for O(n) space. Or build bottom-up with an inorder simulation: recurse on counts and consume list nodes in order. That takes O(n) time and O(log n) space.
- "Why is the result not unique?" An even-length range has two middles, and both choices are balanced. A rule like "always take the left middle" fixes one answer.

After Sort List:
- "Can you use O(1) space, not O(log n)?" Use bottom-up merge sort. Iterate run lengths 1, 2, 4, … and splice the merged runs back in place, with no recursion.
- "Why not quicksort?" A list has no random access to help pivot partitioning, and the O(n²) worst case stays. Merge sort needs only sequential access, which a list gives.

After Merge k Sorted Lists:
- "Compare pairwise merging with a min-heap." Both are O(N log k). The heap uses O(k) extra space and works well when lists arrive over time. The pairwise version is simpler and allocates nothing.
- "What if k is huge but the lists are tiny?" The log k factor dominates. The O(k) build cost of the heap matters, and pairwise merging stays cache-friendly.

## The task

Write three divide-and-conquer builds over linked structures. A binary tree node is `{ val, left, right }`, and an absent child is `null`. A linked-list node is `{ val, next }`, and the last node's `next` is `null`.

1. `sortedArrayToBST(nums: number[]): TreeNode | null` takes an array of distinct integers in ascending order. It returns the root of a height-balanced binary search tree with exactly those values.
2. In that tree, the left subtree of every node holds only smaller values. The right subtree holds only larger values.
3. At every node, the two subtree heights differ by at most 1.
4. `sortList(head: ListNode | null): ListNode | null` sorts a singly linked list of integers ascending in O(n log n) time. It returns the new head.
5. `sortList` relinks the existing nodes. Do not allocate new nodes or copy values into an array.
6. `mergeKLists(lists: (ListNode | null)[]): ListNode | null` takes an array of `k` sorted list heads. It merges them into one sorted list and returns its head.
7. `mergeKLists` reuses the existing nodes and allocates no new nodes.
8. `mergeKLists` takes O(N log k) time, where `N` is the total node count. Merge the lists in pairs, in rounds.

Edge cases:

- `sortedArrayToBST([])` returns `null`. A single element becomes a leaf.
- For two elements, either one can be the root. Any valid height-balanced BST passes, because answers are not unique.
- `sortedArrayToBST` handles negative values and large arrays. Unbalanced insertion fails the balance check.
- `sortList(null)` returns `null`. A single node comes back as the same node.
- For two nodes, the split must make progress: 1 + 1, not 2 + 0.
- `sortList` handles duplicates, negative values, sorted lists and reverse-sorted lists.
- The tests check that every node in the result of `sortList` and `mergeKLists` is an input node.
- `mergeKLists([])` returns `null`. If all entries are `null`, it returns `null`.
- `mergeKLists` handles `null` entries mixed with real lists, and duplicates across lists.
- A single list comes back unchanged. `k` one-node lists merge into one sorted list.

In the examples, `list(...)` builds a linked list from its values, and `→` shows the result.

```ts
// Only one balanced BST exists:
// { val: 2,
//   left: { val: 1, ... },
//   right: { val: 3, ... } }
sortedArrayToBST([1, 2, 3])
sortedArrayToBST([])   // null
// { val: 7, left: null, right: null }
sortedArrayToBST([7])

sortList(list(4, 2, 1, 3))
// 1 → 2 → 3 → 4
sortList(list(-1, 5, 3, 4, 0, 3))
// -1 → 0 → 3 → 3 → 4 → 5
sortList(list(2, 1))   // 1 → 2
sortList(null)         // null
// A single node comes back as-is
sortList(list(5))      // 5

mergeKLists([
  list(1, 4, 5),
  list(1, 3, 4),
  list(2, 6),
])
// 1 → 1 → 2 → 3 → 4 → 4 → 5 → 6
mergeKLists([
  null, list(2, 4), null, list(1, 3),
])
// 1 → 2 → 3 → 4
mergeKLists([])                 // null
mergeKLists([null])             // null
mergeKLists([null, null, null]) // null
```
