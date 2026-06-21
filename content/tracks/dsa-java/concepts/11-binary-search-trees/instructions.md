# Binary Search Trees

## What you'll learn

How the BST invariant enables O(log n) operations on balanced trees, how to validate the invariant using propagated bounds, and how to reconstruct a BST from its preorder traversal.

## Key concepts

### Pattern 1 — Validate BST with propagated bounds

The common mistake is comparing a node only to its immediate parent. You must propagate upper and lower bounds through the entire path.

```java
public static boolean isValidBST(TreeNode root) {
    return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private static boolean validate(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return validate(node.left,  min,      node.val)
        && validate(node.right, node.val, max);
}
```

Use `Long.MIN_VALUE`/`Long.MAX_VALUE` as sentinels so that nodes with value `Integer.MIN_VALUE` or `Integer.MAX_VALUE` are handled correctly.

### Pattern 2 — K-th smallest via iterative inorder

BST inorder traversal (left → node → right) visits nodes in sorted ascending order. Stop at the k-th node.

```java
public static int kthSmallest(TreeNode root, int k) {
    var stack = new ArrayDeque<TreeNode>();
    TreeNode curr = root;
    int count = 0;
    while (curr != null || !stack.isEmpty()) {
        while (curr != null) { stack.push(curr); curr = curr.left; }
        curr = stack.pop();
        if (++count == k) return curr.val;
        curr = curr.right;
    }
    return -1;
}
```

Iterative inorder avoids O(n) recursive stack; stops as soon as the k-th element is found.

### Pattern 3 — Build BST from preorder traversal

In a preorder sequence, the first element is always the root. All values less than the root come before values greater — that's the BST split. Use a recursive bound to determine when to stop:

```java
// index[0] is a shared pointer into the preorder array
public static TreeNode buildBSTFromPreorder(int[] preorder) {
    int[] index = {0};
    return build(preorder, index, Integer.MIN_VALUE, Integer.MAX_VALUE);
}

private static TreeNode build(int[] pre, int[] idx, int min, int max) {
    if (idx[0] == pre.length) return null;
    int val = pre[idx[0]];
    if (val <= min || val >= max) return null; // val doesn't belong in this subtree
    idx[0]++;
    TreeNode node = new TreeNode(val);
    node.left  = build(pre, idx, min, val);  // left subtree: values < val
    node.right = build(pre, idx, val, max);  // right subtree: values > val
    return node;
}
```

## Time and space complexity

| Operation | Time | Space | Why |
|-----------|------|-------|-----|
| `isValidBST` | O(n) | O(h) | Every node visited once |
| `kthSmallest` | O(h + k) | O(h) | Descend to leftmost (h steps) + k pops |
| `buildBSTFromPreorder` | O(n) | O(h) | Each element processed once |

`h` = height. Balanced BST: O(log n). Degenerate: O(n).

## Common variations this pattern solves

1. **Validate BST with duplicate handling** — change strict inequalities to allow equal values on one side
2. **BST Iterator** — class wrapping iterative inorder; O(1) amortized `next()`
3. **Trim a BST** — recursively keep only nodes with values in `[low, high]`
4. **Convert Sorted Array to BST** — recursively pick the middle element as root

## vs other languages

Java's `TreeMap` is a Red-Black BST (self-balancing) with O(log n) operations. Python's `sortedcontainers.SortedList` fills a similar role. For interview problems you implement BST operations yourself on a plain `TreeNode`.

## Watch out

- **Integer bounds overflow in validation**: node values of exactly `Integer.MIN_VALUE` or `Integer.MAX_VALUE` will fail `node.val <= min` or `node.val >= max` if you use `int` sentinels. Use `long`.
- **`==` vs `<=` in BST validation**: BSTs typically require strict inequality (`left < root < right`). If the problem allows duplicates, clarify which side they go on.
- **Preorder build: shared index via `int[]`**: Java doesn't support pass-by-reference for primitives. The `int[] idx = {0}` trick wraps the index in an array so recursive calls share and advance it.
- **k-th smallest off-by-one**: `++count == k` (pre-increment) checks *after* incrementing. Using `count++ == k` would be off by one.

## FAANG follow-up questions

> "What if kthSmallest is called frequently and the BST is updated often?" — Augment the BST: store the subtree size at each node. Then k-th smallest becomes O(log n) without traversal.
>
> "Can you build a BST from postorder traversal?" — Yes. Process the array in reverse to get the root first; use the same bounds trick with decremented index.
>
> "What's the difference between a BST and a heap?" — BST: ordered at every node, O(log n) search. Heap: ordered only parent-to-child, O(1) min/max, O(log n) insert/extract.
>
> "Why use `Long` bounds instead of `Integer.MIN_VALUE - 1`?" — `Integer.MIN_VALUE - 1` overflows back to `Integer.MAX_VALUE`. `Long` arithmetic is safe in this range.

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
// Returns true if the tree satisfies the strict BST invariant.
// [2,1,3] -> true, [5,1,4,null,null,3,6] -> false
public static boolean isValidBST(TreeNode root)

// Returns the k-th smallest value in the BST (1-indexed).
// BST=[3,1,4,null,2], k=1 -> 1
public static int kthSmallest(TreeNode root, int k)

// Constructs and returns a BST from its preorder traversal.
// [8,5,1,7,10,12] -> BST with root 8, left subtree rooted at 5, right at 10
public static TreeNode buildBSTFromPreorder(int[] preorder)
```
