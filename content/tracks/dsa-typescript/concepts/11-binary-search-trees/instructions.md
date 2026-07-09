# Binary Search Tree

## What you'll learn

Building on tree DFS and the level loop from Tree BFS: the one property that makes a BST more than a binary tree — **in-order traversal visits values in sorted order** — and the three algorithms interviews build on it. You'll validate the BST invariant correctly (the classic wrong answer only checks children, not subtrees), find the k-th smallest value with an early-exit traversal, and compute the minimum gap between any two values by comparing in-order neighbors only.

## Key concepts

### The invariant covers whole subtrees, not just children

A binary search tree requires that for *every* node, **all** values in its left subtree are strictly less than the node and **all** values in its right subtree are strictly greater. Comparing each node only to its immediate children accepts trees like this one:

```text
      5
     / \
    4   6
       / \
      3   7      ← 3 < 6 locally, but 3 < 5 sits in 5's RIGHT subtree: not a BST
```

The correct formulation propagates bounds — each node must lie inside an open interval `(lo, hi)`; recursing left tightens `hi`, recursing right tightens `lo`:

```ts
function valid(node: TreeNode | null, lo: number, hi: number): boolean {
  if (node === null) return true;
  if (!(node.val > lo && node.val < hi)) return false;
  return valid(node.left, lo, node.val) && valid(node.right, node.val, hi);
}
// valid(root, -Infinity, Infinity)
```

### In-order traversal yields sorted order

Left subtree, node, right subtree — on a BST that is exactly ascending order. This single fact solves an entire family of problems: validation becomes "is the in-order sequence strictly increasing?", k-th smallest becomes "the k-th node visited", minimum gap becomes "the smallest difference between in-order neighbors".

The workhorse pattern is in-order with a **previous-value tracker** — you rarely need the whole sorted array, just each value and the one before it:

```ts
function inorderWithPrev(root: TreeNode | null, visit: (val: number, prev: number | null) => void): void {
  let prev: number | null = null;   // value of the previously visited node
  const walk = (node: TreeNode | null): void => {
    if (node === null) return;
    walk(node.left);
    visit(node.val, prev);
    prev = node.val;
    walk(node.right);
  };
  walk(root);
}
```

### Iterative in-order — the early-exit version

Recursion visits all n nodes even when you only need the first k. An explicit stack lets you stop mid-traversal:

```ts
const stack: TreeNode[] = [];
let node: TreeNode | null = root;
while (node !== null || stack.length > 0) {
  while (node !== null) {   // slide to the leftmost unvisited node
    stack.push(node);
    node = node.left;
  }
  node = stack.pop()!;      // next value in sorted order
  // ... use node.val; `return` here aborts the traversal early ...
  node = node.right;
}
```

The stack holds the path of ancestors whose left subtrees are done — at most O(h) entries, h = tree height.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Minimum Absolute Difference | O(n) | O(h) | in-order + prev |
| Kth Smallest Element | O(h + k) | O(h) | iterative in-order, early exit |
| Validate BST | O(n) | O(h) | range propagation or in-order + prev |

## Watch out

- **Checking children instead of subtrees** is the canonical wrong validation — it passes `2 → (1, 3)` shapes and also, incorrectly, `5 → (4, 6)` with `6 → (3, 7)`. Propagate bounds or check the in-order sequence.
- **Duplicates are invalid.** The BST invariant here is strict: `node.val <= prev` (or a bound comparison with `>=`/`<=`) means *not* a BST. Using `<` where you need `<=` accepts duplicate values.
- **Initialize `prev` to `null`, not `-Infinity`.** With `prev = null` and a `prev !== null` guard, node values at any numeric extreme work. Sentinel values are how validation bugs at integer boundaries happen in fixed-width languages.
- **`k` is 1-indexed** in k-th smallest. Decrement-and-test (`--k === 0`) or count-then-compare — pick one and be consistent.
- **The minimum gap is between in-order neighbors.** You never need all O(n²) pairs: in a sorted sequence the closest pair is adjacent. Comparing each node against its *parent* instead of its in-order predecessor is wrong — in the BST `4 → (2, 6), 2 → (1, 3)` the closest pair `(3, 4)` crosses subtrees.
- **Don't sort.** Collecting all values and sorting works but wastes O(n log n) — the tree already *is* the sorted order.

## Problem walkthroughs

### Minimum Absolute Difference in BST ★

**Problem.** Given the root of a BST with at least two nodes, return the smallest absolute difference between the values of any two different nodes.

**Example.**

    BST 4 → (2, 6), 2 → (1, 3)      →  1   (e.g. |3 − 4| = 1)
    BST 1 → (0, 48), 48 → (12, 49)  →  1   (|48 − 49| = 1)

**Steps.**
1. In a sorted sequence, the minimum difference over all pairs is achieved by some *adjacent* pair — anything farther apart differs by at least as much.
2. Run in-order with a `prev` tracker and a running `best = Infinity`.
3. At each visited node where `prev !== null`, fold in `node.val - prev` (no `Math.abs` needed — in-order is ascending, the difference is non-negative).
4. Set `prev = node.val` and continue; return `best` at the end.

**Complexity.** O(n) time / O(h) recursion stack — every node visited once, one comparison each.

### Kth Smallest Element in a BST ★

**Problem.** Given the root of a BST and an integer `k` (1-indexed, `1 <= k <=` number of nodes), return the k-th smallest value in the tree.

**Example.**

    BST 3 → (1, 4), 1.right = 2, k = 1            →  1
    BST 5 → (3, 6), 3 → (2, 4), 2.left = 1, k = 3 →  3

**Steps.**
1. In-order visits values in ascending order, so the k-th node visited is the answer — the only question is stopping there.
2. Use the iterative stack template: slide left pushing ancestors, then pop and decrement `k`.
3. When `k` hits 0, return the popped node's value — the rest of the tree is never touched.
4. After using a popped node, move to `node.right` and continue sliding left from there.

**Complexity.** O(h + k) time / O(h) space — you descend the left spine once, then visit exactly k nodes.

### Validate Binary Search Tree ★

**Problem.** Given the root of a binary tree, return `true` if it is a valid BST: every node's left subtree contains only values strictly less than the node, every right subtree only values strictly greater, and both subtrees are themselves valid BSTs.

**Example.**

    tree 2 → (1, 3)              →  true
    tree 5 → (1, 4), 4 → (3, 6)  →  false  (3 and 6 sit under 5's right child)
    tree 5 → (4, 6), 6 → (3, 7)  →  false  (3 violates the ROOT, not its parent)

**Steps.**
1. Range propagation: validate `(node, lo, hi)` meaning "every value in this subtree must satisfy `lo < val < hi`". Start with `(-Infinity, Infinity)`.
2. At each node: fail if `node.val <= lo || node.val >= hi` (the `=` cases reject duplicates).
3. Recurse left with `(lo, node.val)` and right with `(node.val, hi)` — each edge tightens exactly one bound, which is how a deep violation like the `3` under `6` gets caught against the root's value.
4. Alternative with identical complexity: in-order with `prev`, failing when `node.val <= prev`. Both are worth knowing; the in-order form reuses the pattern from the other two problems.

**Complexity.** O(n) time / O(h) space — every node checked once against two bounds.

## Interview follow-ups

- After **Validate BST**: "Two nodes of a BST were swapped — recover it." (in-order with `prev`; the inversions found identify the swapped pair.) "Why not collect the in-order array and check it's sorted?" (correct but O(n) extra space; `prev` needs O(1).)
- After **Kth Smallest**: "The tree is modified often and k-th smallest is queried often — optimize." (augment each node with its left-subtree size; queries become an O(h) rank walk.)
- After **Minimum Absolute Difference**: "What if the tree is *not* a BST?" (in-order is no longer sorted — collect values, sort, scan neighbors: O(n log n).)
- General: "All three run on the same traversal — what changes?" (only what you do at the visit point: compare to `prev`, count down `k`, or check bounds. Interviewers love hearing this stated explicitly.)

## The task

Three algorithms over binary search trees. Trees are plain objects — every node is `{ val, left, right }` where `left`/`right` are child nodes or `null`; an empty tree is `null`. In a valid BST, for every node, **all** values in the left subtree are strictly less than `node.val` and **all** values in the right subtree are strictly greater (no duplicates).

```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// The BST used in the samples below:
//        4
//       / \
//      2   6
//     / \
//    1   3
const t: TreeNode = {
  val: 4,
  left: {
    val: 2,
    left: { val: 1, left: null, right: null },
    right: { val: 3, left: null, right: null },
  },
  right: { val: 6, left: null, right: null },
};
```

### `getMinimumDifference(root: TreeNode): number`

`root` is a valid BST with **at least two nodes**. Return the smallest absolute difference between the values of any two different nodes. Target O(n) time without sorting — the closest pair in a BST is always adjacent in in-order.

```ts
getMinimumDifference(t);  // 1   (|3 - 4| = 1, also |1 - 2|, |2 - 3|)

// 1 → (0, 48), 48 → (12, 49): closest pair is 48 and 49
getMinimumDifference({
  val: 1,
  left: { val: 0, left: null, right: null },
  right: {
    val: 48,
    left: { val: 12, left: null, right: null },
    right: { val: 49, left: null, right: null },
  },
});                       // 1
```

Edge cases: exactly two nodes, the closest pair crossing subtrees (e.g. `3` and `4` in the sample — neither is the other's child or parent), negative values, evenly spaced values.

### `kthSmallest(root: TreeNode, k: number): number`

`root` is a valid BST; `k` is 1-indexed with `1 <= k <=` number of nodes. Return the k-th smallest value in the tree. Target O(h + k) time — stop traversing once the k-th value is found rather than visiting all n nodes.

```ts
kthSmallest(t, 1);  // 1
kthSmallest(t, 3);  // 3
kthSmallest(t, 5);  // 6   (k = node count → largest value)
```

Edge cases: `k = 1` (smallest), `k` equal to the node count (largest), single-node tree with `k = 1`, skewed trees where the answer sits deep on one side.

### `isValidBST(root: TreeNode | null): boolean`

`root` is a binary tree that may or may not satisfy the BST invariant. Return `true` if it does, `false` otherwise. Duplicates make a tree invalid (strict inequality on both sides). A violation can be several levels away from the value it violates — checking each node against only its direct children is not enough. An empty tree (`null`) is valid.

```ts
isValidBST(t);                                     // true
isValidBST({ val: 1, left: null, right: null });   // true
isValidBST(null);                                  // true

// 5 → (1, 4), 4 → (3, 6): 3 and 6 live under 5's right child
isValidBST({
  val: 5,
  left: { val: 1, left: null, right: null },
  right: {
    val: 4,
    left: { val: 3, left: null, right: null },
    right: { val: 6, left: null, right: null },
  },
});                                                // false

// 5 → (4, 6), 6 → (3, 7): every parent-child pair is fine, but 3 < 5
// sits inside 5's right subtree — invalid
isValidBST({
  val: 5,
  left: { val: 4, left: null, right: null },
  right: {
    val: 6,
    left: { val: 3, left: null, right: null },
    right: { val: 7, left: null, right: null },
  },
});                                                // false
```

Edge cases: empty tree (`true`), single node (`true`), duplicate values (`false` — a child equal to its parent), deep violations against an ancestor rather than the parent (the last sample), values at numeric extremes (a single node holding `2147483647` is valid — don't rely on fixed integer sentinel bounds).
