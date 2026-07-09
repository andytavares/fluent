# Divide & Conquer

## What you'll learn

Building on the linked-list surgery from Linked List and the tree recursion from Binary Search Tree, this concept covers divide & conquer as a design recipe: split the input in half, solve each half recursively, and combine the results in linear time. You'll build a height-balanced BST from a sorted array, merge-sort a linked list in place, and merge `k` sorted lists in O(N log k) — three problems where picking the *right middle* and the *right combine step* is the whole solution.

## Key concepts

Divide & conquer has three moves: **divide** (split the input, usually at the middle), **conquer** (recurse on each part), **combine** (stitch the sub-answers together). When the split is balanced and the combine is linear, the recurrence `T(n) = 2T(n/2) + O(n)` gives O(n log n) — that's merge sort. When the combine is O(1), `T(n) = 2T(n/2) + O(1)` gives O(n) — that's building a tree from a sorted array.

### Node representations (used by the tests)

```js
// binary tree node                  // linked list node
{ val, left, right }                 { val, next }
// absent children are null          // last node has next: null
```

Plain objects, no classes required — create them with object literals.

### The middle of an array: pick it, don't search it

A sorted array becomes a height-balanced BST by making the **middle element the root** and recursing on the two halves:

```js
function build(lo, hi) {            // inclusive bounds into nums
  if (lo > hi) return null;
  const mid = (lo + hi) >> 1;
  return {
    val: nums[mid],
    left: build(lo, mid - 1),
    right: build(mid + 1, hi),
  };
}
```

The BST property is free (everything left of `mid` is smaller, everything right is bigger — the array is sorted), and balance is free too: the halves differ in size by at most one, so subtree heights differ by at most one at every node. Recurse on index bounds, not on `slice()` copies — slicing turns O(n) into O(n log n) and burns memory.

### The middle of a linked list: fast/slow, then cut

Lists have no index. Find the middle with two pointers — `slow` moves one step, `fast` moves two — then **cut the list** so the halves are independent:

```js
let slow = head, fast = head.next;   // fast head-start → slow stops at first-half tail
while (fast !== null && fast.next !== null) {
  slow = slow.next;
  fast = fast.next.next;
}
const mid = slow.next;
slow.next = null;                    // cut! without this the recursion never shrinks
```

Starting `fast` at `head.next` makes a 2-node list split into 1 + 1 (with `fast = head` it would split into 2 + 0 and recurse forever).

### The combine step: merging two sorted lists

Merge sort's combine is the Merge Two Sorted Lists routine from the Linked List concept — a dummy head plus a tail pointer, always appending the smaller front node. It relinks existing nodes; nothing is allocated except the dummy:

```js
function mergeTwo(a, b) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else                { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;    // splice the leftover run
  return dummy.next;
}
```

### k lists: merge pairwise, not sequentially

Merging list 1 into list 2, then the result into list 3, and so on re-walks the early lists over and over — O(N·k) total. Divide & conquer instead: merge lists **in pairs**, halving the count each round. Every node is touched once per round and there are ⌈log₂ k⌉ rounds → O(N log k).

```js
while (lists.length > 1) {
  const merged = [];
  for (let i = 0; i < lists.length; i += 2) {
    merged.push(i + 1 < lists.length ? mergeTwo(lists[i], lists[i + 1]) : lists[i]);
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

- **Cut the list.** Forgetting `slow.next = null` before recursing in Sort List leaves both halves sharing a tail — the recursion never reaches the base case and blows the stack.
- **Fast pointer head start.** `fast = head.next` (not `head`) makes the 2-node split 1 + 1. Get this wrong and 2-node lists recurse forever.
- **Recurse on bounds, not slices.** `nums.slice(lo, mid)` per level costs O(n) allocation per level — O(n log n) total for a problem that should be O(n).
- **Either middle is fine for even lengths** in sortedArrayToBST — `(lo + hi) >> 1` or `(lo + hi + 1) >> 1` both yield a valid height-balanced BST. Answers aren't unique; tests check balance and ordering, not exact shape.
- **Relink, don't rebuild.** Sort List and Merge k Lists are pointer-surgery problems: reuse the existing nodes. Copying values into an array, sorting, and building a new list dodges the entire point (and the tests check node identity).
- **Empty inputs**: `sortList(null)`, `mergeKLists([])`, and `mergeKLists([null, null])` all return `null`; a single-node list is already sorted (base case: `head === null || head.next === null`).

## Problem walkthroughs

### Convert Sorted Array to Binary Search Tree ★

**Problem.** Given an array of distinct integers sorted ascending, build a **height-balanced** BST containing exactly those values (at every node, subtree heights differ by at most 1). Return the root, or `null` for an empty array. Any valid balanced arrangement is accepted.

**Example.**

    [-10,-3,0,5,9] → one valid answer:
          0
         / \
       -3   9
       /   /
    -10   5

**Steps.**
1. Recurse on inclusive index bounds `(lo, hi)`; base case `lo > hi` returns `null`.
2. Take `mid = (lo + hi) >> 1` and make `nums[mid]` the root of this subtree.
3. Build `left` from `(lo, mid - 1)` and `right` from `(mid + 1, hi)`.
4. Correctness: sortedness makes the BST property automatic; halving makes the two subtree sizes differ by at most 1, which bounds the height difference by 1 at every node — height-balance by induction.

**Complexity.** O(n) time (one node built per element) / O(log n) recursion depth.

### Sort List ★

**Problem.** Sort a singly linked list ascending in O(n log n) time, relinking the existing nodes (no value copying, no arrays). Return the new head.

**Example.**

    4 → 2 → 1 → 3        →  1 → 2 → 3 → 4
    -1 → 5 → 3 → 4 → 0   →  -1 → 0 → 3 → 4 → 5

**Steps.**
1. Base case: a list of 0 or 1 nodes is sorted — return it.
2. Divide: fast/slow with `fast = head.next`; after the loop `slow` is the first-half tail. Set `mid = slow.next`, then cut with `slow.next = null`.
3. Conquer: `sortList(head)` and `sortList(mid)` recursively.
4. Combine: merge the two sorted halves with the dummy-head merge routine.
5. Merge sort suits lists perfectly: merging needs only pointer rewires (no random access), which is exactly why quicksort/heapsort — array workhorses — don't transfer here.

**Complexity.** O(n log n) time / O(log n) recursion stack; no auxiliary node allocation.

### Construct Quad Tree

**Problem.** Given an `n × n` binary grid (`n` a power of 2), build its quad tree: each node is `{ isLeaf, val, topLeft, topRight, bottomLeft, bottomRight }`. A node is a leaf iff its whole region is one uniform value; otherwise split the region into four `n/2 × n/2` quadrants and recurse.

**Example.**

    [[0,1],
     [1,0]] → root { isLeaf: false } with four leaf children 0,1,1,0

**Steps.**
1. Recurse on `(row, col, size)` describing a square region.
2. Base case `size === 1`: a leaf carrying that cell's value.
3. Build the four quadrant subtrees at `size / 2`.
4. Combine: if all four children are leaves with the same `val`, collapse — return one leaf with that value (discarding the children). Otherwise return an internal node holding the four.
5. The collapse-on-combine is the elegance: uniformity checks happen bottom-up for free instead of scanning each region top-down.

**Complexity.** O(n² log n) time naively, O(n²) with prefix-sum uniformity checks / O(log n) recursion depth.

### Merge k Sorted Lists ★

**Problem.** Given an array `lists` of `k` sorted linked-list heads (entries may be `null`, the array may be empty), merge them into one sorted list, reusing the existing nodes. Return its head, or `null` if there are no nodes at all.

**Example.**

    [[1,4,5],[1,3,4],[2,6]] → 1 → 1 → 2 → 3 → 4 → 4 → 5 → 6
    []                      → null
    [null]                  → null

**Steps.**
1. Write (or reuse) `mergeTwo(a, b)` — the dummy-head two-list merge; it handles `null` inputs naturally.
2. Round-based reduction: while more than one list remains, merge them in pairs (`i` with `i + 1`, stepping by 2; an odd list at the end passes through unmerged).
3. Each round halves the list count; after ⌈log₂ k⌉ rounds one list remains — return it (or `null` for an empty input).
4. Why not merge sequentially? The first list's nodes get re-walked in all `k - 1` merges: O(N·k). Pairwise, each node participates in one merge per round: O(N log k).
5. Alternative with the same bound: a min-heap of list heads — pop the smallest, push its successor. Worth mentioning in interviews; the pairwise version needs no extra data structure.

**Complexity.** O(N log k) time (`N` = total nodes) / O(1) extra space with the iterative pairwise loop.

## Interview follow-ups

After Convert Sorted Array to BST:
- "Sorted **linked list** instead of an array?" — either convert to an array first (O(n) space), or build bottom-up with an inorder simulation: recurse on counts, consume list nodes in order — O(n) time, O(log n) space.
- "Why is the result not unique?" — even-length ranges have two middles; both choices are balanced. Constraints like "always take the left middle" pin it down.

After Sort List:
- "Can you do O(1) space, not O(log n)?" — bottom-up merge sort: iterate run lengths 1, 2, 4, …, splicing merged runs back in place; no recursion at all.
- "Why not quicksort?" — no random access for pivot partitioning benefits, and worst-case O(n²) stays; merge sort's sequential access is exactly what lists provide.

After Merge k Sorted Lists:
- "Compare pairwise merging vs a min-heap." — both O(N log k); the heap uses O(k) extra space and shines when lists stream in incrementally; pairwise is simpler and allocation-free.
- "What if k is huge but lists are tiny?" — the log k factor dominates; the heap version's O(k) build cost matters, and pairwise merging stays cache-friendly.

## The task

Three divide & conquer builds over linked structures. Representations: a binary tree node is a plain object `{ val, left, right }` (absent children are `null`); a linked-list node is `{ val, next }` (the last node's `next` is `null`).

### `sortedArrayToBST(nums)`

`nums` is an array of distinct integers sorted in ascending order. Return the root of a **height-balanced** binary search tree containing exactly the values of `nums`: at every node, the left subtree holds only smaller values, the right subtree only larger ones, and the two subtree heights differ by at most 1. Return `null` for an empty array. Any valid height-balanced BST is accepted — answers are not unique.

```js
sortedArrayToBST([1, 2, 3]);
// { val: 2, left: { val: 1, left: null, right: null },
//           right: { val: 3, left: null, right: null } }

sortedArrayToBST([]);   // null
sortedArrayToBST([7]);  // { val: 7, left: null, right: null }
```

Edge cases: empty array (`null`), single element (a leaf), two elements (either one may be the root), negative values, larger arrays where naive unbalanced insertion would fail the balance check.

### `sortList(head)`

`head` is the head of a singly linked list of integers (possibly `null`). Sort the list ascending in **O(n log n)** time and return the new head. Relink the **existing** nodes — do not allocate new nodes or copy values into an array; the tests verify that every node in the result is one of the input nodes.

```js
// 4 → 2 → 1 → 3
sortList(head);        // 1 → 2 → 3 → 4

sortList(null);        // null
// single node: returned as-is
```

Edge cases: `null` (empty list), a single node, two nodes (the split must make progress: 1 + 1, not 2 + 0), duplicates, negative values, an already-sorted list, a reverse-sorted list.

### `mergeKLists(lists)`

`lists` is an array of `k` sorted linked-list heads; individual entries may be `null` and the array itself may be empty. Merge all of them into one sorted linked list, reusing the existing nodes (no new node allocation), and return its head — `null` if there are no nodes at all. Target **O(N log k)** where `N` is the total node count: merge the lists pairwise in rounds rather than folding them in one by one.

```js
// lists: [1→4→5, 1→3→4, 2→6]
mergeKLists(lists);    // 1 → 1 → 2 → 3 → 4 → 4 → 5 → 6

mergeKLists([]);       // null
mergeKLists([null]);   // null
```

Edge cases: empty `lists` array, all entries `null`, some entries `null` mixed with real lists, a single list (returned as-is), `k` lists of one node each, duplicate values across lists.
