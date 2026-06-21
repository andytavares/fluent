# Binary Search Trees

## What you'll learn

Three BST-specific algorithms: validation using range propagation, kth-smallest via in-order traversal with early exit, and BST reconstruction from preorder using the same range technique.

## Key concepts

BST property: for every node, all values in the left subtree are strictly less, all values in the right subtree are strictly greater. This invariant enables O(h) search and O(n) sorted traversal.

### Validate BST — propagate range bounds

The naive mistake: compare each node only to its parent. This misses violations like a node in the right subtree being smaller than the root.

```js
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&  // tighten upper bound
         isValidBST(root.right, root.val, max);    // tighten lower bound
}
```

### Kth smallest — in-order DFS with early exit

In-order traversal of a BST produces sorted ascending order. Track a counter; return when you've visited k nodes.

```js
function kthSmallest(root, k) {
  let count = 0, result = null;
  function inorder(node) {
    if (!node || result !== null) return; // early exit once found
    inorder(node.left);
    if (++count === k) { result = node.val; return; }
    inorder(node.right);
  }
  inorder(root);
  return result;
}
```

### Build BST from preorder — shared index with range bounds

Preorder is root-first. Use a shared index `i` that advances as you consume elements. Pass range bounds to know when to stop building a subtree.

```js
function buildBSTFromPreorder(preorder) {
  let i = 0;
  function build(min, max) {
    if (i === preorder.length || preorder[i] < min || preorder[i] > max) return null;
    const val = preorder[i++];
    const node = new TreeNode(val);
    node.left  = build(min, val);   // left subtree: values in (min, val)
    node.right = build(val, max);   // right subtree: values in (val, max)
    return node;
  }
  return build(-Infinity, Infinity);
}
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| isValidBST | O(n) | O(h) |
| kthSmallest | O(h + k) | O(h) |
| buildBSTFromPreorder | O(n) | O(h) |

`h` = tree height. O(log n) balanced, O(n) skewed.

## Common variations

- **LCA in BST** (LC 235) — use BST property: both < root → go left; both > root → go right; else root
- **Delete node in BST** — three cases: leaf, one child, two children (replace with in-order successor)
- **BST to greater sum tree** (LC 1038) — reverse in-order (right, root, left) accumulates suffix sums
- **Floor/ceiling in BST** — binary search–style navigation without visiting all nodes

## vs other languages

JavaScript has no built-in BST or sorted set. Python has `sortedcontainers.SortedList` (third-party). Java has `TreeMap`/`TreeSet`. For interview purposes you always implement BST operations from scratch.

## FAANG follow-up questions

After isValidBST:
- "Why can't you just compare parent to child?" (grandparent violations — a right child's left subtree can have values smaller than the root)
- "Can you validate iteratively?" (yes — in-order traversal; each node must be greater than the previous)

After kthSmallest:
- "What if k queries happen after frequent insertions?" (augment each node with subtree size; update on insert/delete; O(log n) per query)

After buildBSTFromPreorder:
- "Can you rebuild from inorder alone?" (no — many BSTs share the same inorder; you need preorder + inorder, or preorder + postorder)
- "Why use range bounds instead of finding the split index?" (range bounds is O(n); finding the split index by linear scan would be O(n²) for skewed trees)

## Watch out

- **isValidBST**: use strict inequalities. Equal values are not allowed in a standard BST.
- **kthSmallest**: the `count` variable must be shared across all recursive calls (closure), not passed as a parameter — otherwise each branch resets it.
- **buildBSTFromPreorder**: `i` must also be a shared closure variable for the same reason.
- **Skewed tree stack depth**: O(n) call stack depth on degenerate trees. For n=10^5, this can stack overflow. Iterative in-order with an explicit stack is the production approach.

## The task

Use the same `TreeNode` class as the DFS concept.

### `isValidBST(root)`

Return `true` if the binary tree is a valid BST.

```js
//   2          //   5
//  / \         //  / \
// 1   3        // 1   4
//              //    / \
//             //    3   6
isValidBST(first)  // true
isValidBST(second) // false
```

### `kthSmallest(root, k)`

Return the kth smallest value (1-indexed) in the BST.

```js
//     3
//    / \
//   1   4
//    \
//     2
kthSmallest(tree, 1) // 1
kthSmallest(tree, 3) // 3
```

### `buildBSTFromPreorder(preorder)`

Reconstruct the unique BST from its preorder traversal. Return the root.

```js
buildBSTFromPreorder([8, 5, 1, 7, 10, 12])
//     8
//    / \
//   5  10
//  / \   \
// 1   7  12
```
