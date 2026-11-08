## What you build

You write three functions on binary search trees (BSTs): the minimum gap between two values, the k-th smallest value, and a validity check. All three use one fact: an in-order traversal of a BST visits values in sorted order. This lesson builds on **Binary Tree** and **Tree BFS**.

## Key concepts

### The invariant covers whole subtrees, not only children

In a BST, every value in a node's left subtree is strictly less than the node. Every value in its right subtree is strictly greater. A check of each node against its direct children only accepts this tree:

```text
      5
     / \
    4   6
       / \
      3   7
```

The `3` is less than `6`, so its parent is fine. But `3` sits in the right subtree of `5`, so the tree is not a BST.

### Bounds travel down the tree

Each node must lie inside an open interval `(lo, hi)`. A step to the left child sets `hi` to the node value. A step to the right child sets `lo` to the node value.

```java
static boolean valid(TreeNode node,
                     long lo, long hi) {
    if (node == null) return true;
    if (node.val <= lo || node.val >= hi) {
        return false;
    }
    return valid(node.left, lo, node.val)
        && valid(node.right, node.val, hi);
}
// valid(root, Long.MIN_VALUE,
//       Long.MAX_VALUE)
```

### In-order traversal gives sorted order

In-order visits the left subtree, then the node, then the right subtree. On a BST, that order is ascending. Validation becomes "is the in-order sequence strictly increasing?". The k-th smallest value becomes "the k-th node visited". The minimum gap becomes "the smallest difference between in-order neighbors".

### Track the previous value, not the whole list

You rarely need the full sorted list. Each value and the value before it are enough.

```java
// Value of the previous visited node
static Integer prev = null;

static void walk(TreeNode node) {
    if (node == null) return;
    walk(node.left);
    visit(node.val, prev);
    prev = node.val;
    walk(node.right);
}
```

`prev` is static, so it keeps its value between calls. Set `prev = null` at the start of each public call: the tests call the method several times in one run.

### An explicit stack lets in-order stop early

A recursive traversal visits all n nodes, even when you need only the first k. An explicit stack lets you stop in the middle of the traversal.

```java
Deque<TreeNode> stack =
    new ArrayDeque<>();
TreeNode node = root;
while (node != null || !stack.isEmpty()) {
    // Go to the leftmost unvisited node
    while (node != null) {
        stack.push(node);
        node = node.left;
    }
    // Next value in sorted order
    node = stack.pop();
    // Use node.val here; a return stops
    // the traversal early
    node = node.right;
}
```

The stack holds the ancestors whose left subtrees are done. It has at most O(h) entries, where h is the tree height.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Minimum Absolute Difference | O(n) | O(h) | in-order + prev |
| Kth Smallest Element | O(h + k) | O(h) | iterative in-order, early exit |
| Validate BST | O(n) | O(h) | bounds, or in-order + prev |

## Watch out

- A check of children instead of subtrees is the classic wrong validation. It accepts `5 → (4, 6)` with `6 → (3, 7)`.
- Duplicates are invalid here. `node.val <= prev` means the tree is not a BST.
- A `<` where you need `<=` accepts duplicate values.
- Start `prev` as `Integer prev = null` with a `prev != null` guard. Then values at `Integer.MIN_VALUE` and `Integer.MAX_VALUE` work.
- `int` sentinel bounds reject a node that holds `Integer.MAX_VALUE`. Use `long` bounds or boxed `null` bounds.
- `k` is 1-indexed. Decrement and test, or count and compare, but do the same thing everywhere.
- The minimum gap is between in-order neighbors. You never need all O(n²) pairs.
- A comparison against the parent instead of the in-order predecessor is wrong. The closest pair can cross subtrees.
- Do not sort the values. Sorting costs O(n log n), and the tree already holds the sorted order.

## Problem walkthroughs

### Minimum Absolute Difference in BST ★

**Problem.** You get the root of a BST with at least two nodes. Return the smallest absolute difference between the values of any two different nodes.

**Example.**

```text
4 → (2, 6), 2 → (1, 3)
  →  1   (|3 − 4| = 1)
1 → (0, 48), 48 → (12, 49)
  →  1   (|48 − 49| = 1)
```

**Steps.**
1. In a sorted sequence, some adjacent pair has the minimum difference. A pair farther apart differs by at least as much.
2. Run in-order with a `prev` tracker and a running `best = Integer.MAX_VALUE`.
3. At each node where `prev != null`, compare `node.val - prev` with `best`. In-order is ascending, so the difference is never negative and you need no absolute value.
4. Set `prev = node.val` and continue. Return `best` at the end.

**Complexity.** O(n) time / O(h) recursion stack. The traversal visits every node once, with one comparison each.

### Kth Smallest Element in a BST ★

**Problem.** You get the root of a BST and an integer `k`, with `1 <= k <=` the number of nodes. `k` is 1-indexed. Return the k-th smallest value in the tree.

**Example.**

```text
3 → (1, 4), 1.right = 2, k = 1
  →  1
5 → (3, 6), 3 → (2, 4), 2.left = 1, k = 3
  →  3
```

**Steps.**
1. In-order visits values in ascending order, so the k-th node visited is the answer. The only question is how to stop there.
2. Use the explicit-stack template: go left and push each ancestor, then pop and decrement `k`.
3. When `k` reaches 0, return the value of the popped node. The traversal never touches the rest of the tree.
4. After you use a popped node, move to `node.right` and go left again from there.

**Complexity.** O(h + k) time / O(h) space. You go down the left spine once, then visit exactly k nodes.

### Validate Binary Search Tree ★

**Problem.** You get the root of a binary tree. Return `true` if it is a valid BST. Each left subtree holds only values strictly less than its node. Each right subtree holds only values strictly greater. Both subtrees are valid BSTs too.

**Example.**

```text
2 → (1, 3)
  →  true
5 → (1, 4), 4 → (3, 6)
  →  false
5 → (4, 6), 6 → (3, 7)
  →  false
```

In the second tree, `3` and `6` sit under the right child of `5`. In the third tree, `3` violates the root, not its parent.

**Steps.**
1. Use bound propagation. `(node, lo, hi)` means "every value in this subtree satisfies `lo < val < hi`". Start with `(Long.MIN_VALUE, Long.MAX_VALUE)`.
2. At each node, fail if `node.val <= lo || node.val >= hi`. The `=` cases reject duplicates.
3. Recurse left with `(lo, node.val)` and right with `(node.val, hi)`. Each edge changes exactly one bound, so the `3` under `6` fails against the root value.
4. An alternative with the same complexity: in-order with `prev`, which fails when `node.val <= prev`. This form uses the same pattern as the other two problems.

**Complexity.** O(n) time / O(h) space. The check compares every node once against two bounds.

## Interview follow-ups

- After **Validate BST**: "Someone swapped two nodes of a BST. Recover it." Use in-order with `prev`; the inversions it finds identify the swapped pair.
- After **Validate BST**: "Why not collect the in-order list and check that it is sorted?" That is correct, but it needs O(n) extra space. A `prev` variable needs O(1) beyond the stack.
- After **Kth Smallest**: "The tree changes often and you query the k-th smallest often. Optimize." Store the left-subtree size in each node. A query becomes an O(h) rank walk.
- After **Minimum Absolute Difference**: "What if the tree is not a BST?" In-order is no longer sorted. Collect the values, sort them and scan neighbors in O(n log n).
- General: "All three use the same traversal. What changes?" Only the work at the visit point changes: compare to `prev`, count down `k`, or check bounds. Say this out loud in the interview.

## The task

Write three static methods over binary search trees. Each node is a `TreeNode` with `int val`, `TreeNode left` and `TreeNode right`.

1. `left` and `right` are child nodes or `null`. An empty tree is `null`.
2. In a valid BST, all left-subtree values are strictly less than `node.val`.
3. All right-subtree values are strictly greater than `node.val`. Duplicates make a tree invalid.

In the examples, `tree(...)` builds a tree from level-order values. `null` marks an absent child.

### `int getMinimumDifference(TreeNode root)`

`root` is a valid BST with at least two nodes. Return the smallest absolute difference between any two node values. Aim for O(n) time without sorting.

Edge cases: exactly two nodes, negative values, evenly spaced values. The closest pair can cross subtrees: in `[5, 3, 8, 1, 4]`, `4` and `5` are neither parent and child nor siblings.

### `int kthSmallest(TreeNode root, int k)`

`root` is a valid BST. `k` is 1-indexed, with `1 <= k <=` the number of nodes. Return the k-th smallest value. Aim for O(h + k) time: stop once you find the k-th value.

Edge cases: `k = 1` returns the smallest value. `k` equal to the node count returns the largest. A single node with `k = 1` returns its value. Skewed trees work too.

### `boolean isValidBST(TreeNode root)`

`root` is any binary tree. Return `true` if it satisfies the BST invariant, `false` otherwise.

Edge cases:

- An empty tree (`null`) is valid. A single node is valid.
- A child equal to its parent makes the tree invalid.
- A violation can be several levels below the ancestor it violates.
- A single node that holds `2147483647` is valid. Do not use `int` sentinel bounds.

```java
TreeNode a = tree(4, 2, 6, 1, 3);
getMinimumDifference(a);   // 1
kthSmallest(a, 5);         // 6

TreeNode b = tree(
    1, 0, 48, null, null, 12, 49);
getMinimumDifference(b);   // 1
getMinimumDifference(
    tree(5, 3, 8, 1, 4));  // 1
getMinimumDifference(
    tree(1, null, 5));     // 4
getMinimumDifference(
    tree(0, -3));          // 3

kthSmallest(
    tree(3, 1, 4, null, 2), 1);  // 1
kthSmallest(
    tree(5, 3, 6, 2, 4, null, null, 1),
    3);                          // 3
kthSmallest(tree(7), 1);         // 7

isValidBST(tree(2, 1, 3));       // true
isValidBST(null);                // true
isValidBST(tree(2, 2));          // false
isValidBST(
    tree(5, 1, 4, null, null, 3, 6));
// false
isValidBST(
    tree(5, 4, 6, null, null, 3, 7));
// false
isValidBST(tree(2147483647));    // true
```
