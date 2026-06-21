# Tree DFS

## What you'll learn

How depth-first search on a binary tree maps to three traversal orders, and how to combine subtree results recursively. The third problem — Lowest Common Ancestor — is one of the most-asked tree problems in FAANG interviews.

## Key concepts

### Pattern 1 — Post-order: combine children results (Max Depth)

Process both subtrees first, then combine at the current node.

```java
public static int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

Base case: null returns 0 (depth below a leaf). Recursive case: max of both subtrees + 1 for the current node.

### Pattern 2 — Pre-order: decide before descending (Has Path Sum)

Pass state downward; make a leaf-check decision at the bottom.

```java
public static boolean hasPathSum(TreeNode root, int target) {
    if (root == null) return false;
    if (root.left == null && root.right == null) return root.val == target;
    return hasPathSum(root.left,  target - root.val)
        || hasPathSum(root.right, target - root.val);
}
```

Short-circuit `||` stops the right branch if the left already found a valid path.

### Pattern 3 — Post-order with upward return (Lowest Common Ancestor)

The LCA of two nodes p and q is the deepest node that has both as descendants (a node is a descendant of itself). The recursive insight: if you find p or q, return it. If a node has both sides return non-null, it's the LCA.

```java
public static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left  = lowestCommonAncestor(root.left,  p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    if (left != null && right != null) return root; // root is the LCA
    return left != null ? left : right;             // propagate the found node upward
}
```

This works for any binary tree, not just BSTs — because it uses reference equality (`root == p`), not value comparison.

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `maxDepth` | O(n) | O(h) | Visit every node once; call stack depth = height h |
| `hasPathSum` | O(n) | O(h) | Worst case: every root-to-leaf path checked |
| `lowestCommonAncestor` | O(n) | O(h) | Visit every node at most once |

`h` = tree height. Balanced: O(log n). Degenerate (linked list shape): O(n).

## Common variations this pattern solves

1. **Diameter of Binary Tree** — max of (left height + right height) at each node; pass max diameter via an int[] or class field
2. **Path Sum II** — collect all root-to-leaf paths that sum to target; backtrack the path list
3. **Count Good Nodes** — count nodes where all ancestors have smaller or equal values; pass running max downward
4. **Binary Tree Maximum Path Sum** — max path through any node; post-order with global max tracking

## vs other languages

Python's recursion limit is 1000 by default (`sys.setrecursionlimit` to increase). Java's stack can handle ~10,000 recursive calls before `StackOverflowError` — deep trees still need an iterative approach. Use an explicit `ArrayDeque<TreeNode>` stack for iterative DFS.

## Watch out

- **Null check before access**: always `if (root == null) return ...` as the first line. Missing this causes NPE on an empty tree or after reaching a leaf's null child.
- **LCA: reference equality not value equality**: `root == p` uses reference equality. If your TreeNode overrides `equals`, this still works because you're comparing whether it's *literally the same object*. Don't use `root.val == p.val` — multiple nodes can share the same value.
- **hasPathSum leaf check**: `root.left == null && root.right == null` confirms you're at a leaf before comparing `root.val == target`. Checking `root.val == target` at every node would incorrectly match internal nodes.
- **`Long.MIN_VALUE`/`Long.MAX_VALUE` in isValidBST**: when using the range-checking approach, use `long` bounds (not `int`) to handle `Integer.MIN_VALUE` and `Integer.MAX_VALUE` as node values.

## FAANG follow-up questions

> "Can you solve LCA without modifying TreeNode (no parent pointers)?" — Yes — the recursive solution above does exactly that.
>
> "What if p or q might not exist in the tree?" — Modify to return a pair: (found_p, found_q, lca_candidate). Only return a confirmed LCA if both are found.
>
> "What's the iterative version of lowestCommonAncestor?" — Use parent-pointer tracking: BFS/DFS to find paths from root to p and root to q, then find the last common node.
>
> "How would you solve this for an n-ary tree?" — Same idea: recurse into all children. If more than one child returns non-null, current node is LCA.

## The task

`TreeNode` is defined in the test file:
```java
static class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
```

Implement three methods in `Solution`:

```java
// Returns the maximum depth (number of nodes along the longest root-to-leaf path).
// [3,9,20,null,null,15,7] -> 3
public static int maxDepth(TreeNode root)

// Returns true if a root-to-leaf path exists where node values sum to target.
// [5,4,8,11,null,13,4,7,2,null,null,null,1], target=22 -> true
public static boolean hasPathSum(TreeNode root, int target)

// Returns the lowest common ancestor of nodes p and q in the tree.
// p and q are guaranteed to exist in the tree.
public static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q)
```
