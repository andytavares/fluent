# Tree DFS

## What you'll learn

Three DFS traversal patterns — post-order, pre-order, and the Lowest Common Ancestor — covering the recursive patterns that appear in the majority of FAANG binary tree problems.

## Key concepts

The call stack *is* the DFS stack. Recursion is natural for trees. The key is recognizing which traversal direction the problem requires:
- **Post-order** (left, right, root): compute children first, then combine at root — use for depth, diameter, LCA
- **Pre-order** (root, left, right): carry state downward — use for path sums, serialize/deserialize

### Post-order — max depth

```js
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

### Pre-order — has path sum

Subtract as you descend. A leaf node with `val === remaining` is a valid path.

```js
function hasPathSum(root, target) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === target; // leaf check
  const remaining = target - root.val;
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}
```

### Post-order — Lowest Common Ancestor

Return the node itself when it equals `p` or `q`. A node is the LCA when both `left` and `right` are non-null (one subtree contains `p`, the other contains `q`).

```js
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left  = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root; // p and q split across subtrees
  return left ?? right;           // both in same subtree
}
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| maxDepth | O(n) | O(h) |
| hasPathSum | O(n) | O(h) |
| lowestCommonAncestor | O(n) | O(h) |

`h` = tree height. O(log n) for balanced, O(n) for skewed (degenerate linked list).

## Common variations

- **Diameter of binary tree** (LC 543) — post-order; at each node compute `left_depth + right_depth`; track global max
- **Path sum II** (LC 113) — pre-order with backtracking; collect all valid root-to-leaf paths
- **Maximum path sum** (LC 124) — post-order; at each node, choose to include it in a path or start fresh
- **Serialize and deserialize binary tree** — pre-order with null markers

## vs other languages

Python's implicit recursion limit (1000 by default) matters for deep trees — `sys.setrecursionlimit()` is needed. JavaScript's default call stack depth is larger but still finite. For very deep trees (skewed), convert to iterative DFS using an explicit stack.

## FAANG follow-up questions

After lowestCommonAncestor:
- "What if nodes can have parent pointers?" (walk from both nodes to root collecting ancestors in a set; first intersection is LCA — O(h) time O(h) space)
- "What if p or q might not be in the tree?" (add a boolean return alongside the node; only mark LCA if both found)
- "What if it's a BST, not a general binary tree?" (use BST property: if both p and q are less than root, go left; if both greater, go right; else root is LCA — O(h) time O(1) space)

After hasPathSum:
- "What if you need to return all paths, not just a boolean?" (backtracking variant — add to path, recurse, pop)
- "What if the path doesn't have to start at root?" (prefix sums + hash map, similar to subarray sum)

## Watch out

- **LCA null check**: `if (!root || root === p || root === q) return root` — the order matters. Check null first.
- **hasPathSum leaf check**: `!root.left && !root.right` must be checked when `root` is not null. Checking before the null check risks a null dereference.
- **Skewed trees**: DFS on a skewed tree has O(n) call stack depth. For n=10^5 this can stack overflow. Mention iterative DFS as the production solution.
- **hasPathSum with zero target**: if `target = 0` and the root has value 0, the leaf check `root.val === target` handles it correctly as long as it's a leaf node.

## The task

A `TreeNode` class is provided:

```js
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val; this.left = left; this.right = right;
  }
}
```

### `maxDepth(root)`

Return the maximum depth (length of longest root-to-leaf path in nodes).

```js
//     3
//    / \
//   9  20
//     /  \
//    15   7
maxDepth(tree) // 3
maxDepth(null) // 0
```

### `hasPathSum(root, target)`

Return `true` if any root-to-leaf path sums to `target`.

```js
hasPathSum(tree, 22) // true  (5->4->11->2)
hasPathSum(tree, 5)  // false
hasPathSum(null, 0)  // false
```

### `lowestCommonAncestor(root, p, q)`

Given a binary tree and two nodes `p` and `q`, return their lowest common ancestor. All node values are unique. `p` and `q` are guaranteed to exist in the tree.

```js
//       3
//      / \
//     5   1
//    / \   \
//   6   2   8
lowestCommonAncestor(root, node5, node1) // node3
lowestCommonAncestor(root, node5, node6) // node5
```
