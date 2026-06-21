# Binary Search Trees

## What you'll learn

How the BST invariant (left < node < right) enables O(h) search, validation, and LCA that would require O(n) on a general tree. You'll implement `isValidBST`, `kthSmallest`, and `buildBSTFromPreorder`.

## Key concepts

### BST validation with range narrowing

A common mistake: only comparing a node to its direct parent misses cases like a node in the left subtree with a value greater than the grandparent. The fix: track a valid `[min, max]` range and narrow it as you descend.

```typescript
function isValidBST(root: TreeNode | null): boolean {
  function validate(node: TreeNode | null, min: number, max: number): boolean {
    if (node === null) return true;
    // Strict inequalities: no equal values in a standard BST
    if (node.val <= min || node.val >= max) return false;
    // Going left: current val becomes the new max bound
    // Going right: current val becomes the new min bound
    return (
      validate(node.left, min, node.val) &&
      validate(node.right, node.val, max)
    );
  }
  return validate(root, -Infinity, Infinity);
}
```

**Classic wrong answer**: `node.left.val < node.val && node.right.val > node.val`. This fails for the tree `10 → left: 5 → right: 15` (15 > 10 but it's in the left subtree of 10 — invalid BST).

### Inorder traversal yields sorted order

The kth smallest element in a BST is the kth element of the inorder traversal. Stop early when count reaches k.

```typescript
function kthSmallest(root: TreeNode | null, k: number): number {
  let count = 0;
  let result = 0;

  function inorder(node: TreeNode | null): void {
    if (node === null || count >= k) return; // early exit
    inorder(node.left);
    count++;
    if (count === k) { result = node.val; return; }
    inorder(node.right);
  }

  inorder(root);
  return result;
}
```

### Build BST from preorder

In a preorder sequence, the first element is the root. All elements less than the root come before all elements greater (because the original BST generated them that way). Use an index pointer and upper-bound narrowing to reconstruct in O(n).

```typescript
function buildBSTFromPreorder(preorder: number[]): TreeNode | null {
  let idx = 0;

  function build(maxVal: number): TreeNode | null {
    if (idx === preorder.length || preorder[idx] > maxVal) return null;

    const root = new TreeNode(preorder[idx++]);
    root.left  = build(root.val);  // left children must be < root.val
    root.right = build(maxVal);    // right children must be < maxVal
    return root;
  }

  return build(Infinity);
}
```

**Why this is O(n)**: the index `idx` only moves forward — each element is processed exactly once across all recursive calls.

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `isValidBST` | O(n) | O(h) | Must visit every node |
| `kthSmallest` | O(h + k) | O(h) | Stops at kth inorder element |
| `buildBSTFromPreorder` | O(n) | O(h) | One-pass with index pointer |
| LCA on BST (iterative) | O(h) | O(1) | Compare to root, go left/right |

h = height of tree (O(log n) balanced, O(n) skewed).

## Common variations

- **Validate BST with duplicates allowed** — change `<=` to `<` in the validation (allow equal values in left subtree, depending on convention)
- **BST LCA** — if both targets < root, go left; if both > root, go right; else root is LCA (O(h), O(1) space)
- **Floor and ceiling in BST** — binary search with tracking of best candidate
- **Convert sorted array to BST** — always pick the midpoint as root to keep the tree balanced

## vs other languages

TypeScript closures over mutable variables (`let count = 0`) capture the variable by reference — `count` in the closure and `count` in the outer scope are the same storage. This pattern is idiomatic for stateful DFS in TypeScript. In Go, you'd pass a pointer `*int` or use a method with a receiver. In Java, you'd use an int array `int[] count = {0}` as a workaround for "effectively final" closure rules.

## Watch out

- **`node.val <= min || node.val >= max`**: both bounds are exclusive (strict BST). If the problem allows duplicates, adjust to `<` / `>`. Confusion here is the most common BST validation bug.
- **`count >= k` early exit in `kthSmallest`**: guards against continuing the inorder traversal after the kth element is found. Without it, the traversal completes the full tree.
- **`buildBSTFromPreorder` index by reference**: `idx` is captured from the outer scope and shared across all recursive calls. If you pass it as a parameter by value (e.g., returning it), each branch would use a stale index — you'd build the wrong tree.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "What is the worst case for `kthSmallest`?" (O(n) for a skewed tree with k = n — must traverse the full tree. A balanced BST gives O(log n + k).)
> - "How would you support O(log n) `kthSmallest` with frequent insertions?" (Augment each node with the size of its subtree. This is a "order-statistic tree".)
> - "How do you convert a BST to a doubly linked list in-place?" (Inorder traversal; maintain a `prev` pointer; link each visited node to prev and update prev.)
> - "Can you build the BST from postorder instead of preorder?" (Yes — process the array right-to-left and track a min bound instead of a max bound.)

## The task

Implement the `TreeNode` class and three functions:

```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number, left?: TreeNode | null, right?: TreeNode | null)
}

// Return true if the tree is a valid BST (strict: left < node < right, no duplicates).
// Invalid example: [5,1,4,null,null,3,6] — node 4 is right child of 5 but 4 < 5.
function isValidBST(root: TreeNode | null): boolean

// Return the kth smallest value in the BST (1-indexed).
// [3,1,4,null,2], k=1 → 1
// [5,3,6,2,4], k=3   → 4
function kthSmallest(root: TreeNode | null, k: number): number

// Reconstruct a BST from its preorder traversal and return the root.
// preorder=[8,5,1,7,10,12] → the BST with root 8
function buildBSTFromPreorder(preorder: number[]): TreeNode | null
```
