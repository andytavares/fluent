# Tree DFS

## What you'll learn

How depth-first search on a binary tree decomposes into three recursive choices (pre/in/post order) and how the postorder pattern — "compute from children, combine at current node" — solves most tree aggregation problems. You'll implement `maxDepth`, `hasPathSum`, and `lowestCommonAncestor`.

## Key concepts

### The three DFS orderings

```typescript
function preorder(node: TreeNode | null, result: number[]): void {
  if (node === null) return;
  result.push(node.val);       // process first
  preorder(node.left, result);
  preorder(node.right, result);
}

function inorder(node: TreeNode | null, result: number[]): void {
  if (node === null) return;
  inorder(node.left, result);
  result.push(node.val);       // process between children
  inorder(node.right, result);
}

function postorder(node: TreeNode | null, result: number[]): void {
  if (node === null) return;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.val);       // process last (after children)
}
```

Most aggregation problems are postorder: recurse into both children first, then combine their results at the current node.

### Postorder aggregation — max depth

```typescript
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;            // base case: empty subtree has depth 0
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  return 1 + Math.max(leftDepth, rightDepth); // combine + add current node
}
```

### Path condition — hasPathSum

Carry the remaining target down through the recursion. Check at leaves.

```typescript
function hasPathSum(root: TreeNode | null, target: number): boolean {
  if (root === null) return false; // no node, no path

  const remaining = target - root.val;

  // Leaf node check: both children are null
  if (root.left === null && root.right === null) return remaining === 0;

  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}
```

**Why check at leaves, not at every node**: a non-leaf node's path continues downward. Checking `remaining === 0` mid-path would incorrectly match nodes whose values happen to sum to the target before reaching a leaf.

### Lowest Common Ancestor (LCA)

The LCA of nodes `p` and `q` is the deepest node that is an ancestor of both. The key insight for DFS: if a recursive call returns non-null, `p` or `q` (or their LCA) was found in that subtree. When both left and right return non-null, the current node is the LCA.

```typescript
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  if (root === null) return null;

  // If current node is p or q, it could be the LCA (or ancestor is above)
  if (root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  // p found in left subtree, q in right subtree → current node is LCA
  if (left !== null && right !== null) return root;

  // Only one side found something — propagate it upward
  return left ?? right;
}
```

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `maxDepth` | O(n) | O(h) | h = height; O(log n) balanced, O(n) skewed |
| `hasPathSum` | O(n) | O(h) | Same stack depth |
| `lowestCommonAncestor` | O(n) | O(h) | Visits each node once |

## Common variations

- **Diameter of binary tree** — postorder; at each node, max path = left height + right height
- **Balance check** — postorder; return -1 to signal imbalance, height otherwise
- **Path sum II (all paths)** — DFS with backtracking; collect paths in a list
- **Serialize and deserialize** — preorder DFS with a sentinel for null nodes

## vs other languages

Recursive DFS is natural in any language. In Python, the implicit call stack handles recursion; maximum recursion depth is 1000 by default (adjustable). In TypeScript/JavaScript, the default stack is typically 10,000–15,000 frames. For very deep or skewed trees, an iterative DFS using an explicit stack is safer:

```typescript
// Iterative inorder using an explicit stack
function inorderIterative(root: TreeNode | null): number[] {
  const result: number[] = [];
  const stack: TreeNode[] = [];
  let curr: TreeNode | null = root;

  while (curr !== null || stack.length > 0) {
    while (curr !== null) { stack.push(curr); curr = curr.left; }
    curr = stack.pop()!;
    result.push(curr.val);
    curr = curr.right;
  }
  return result;
}
```

## Watch out

- **Leaf check**: `root.left === null && root.right === null` is a leaf. A node with one child is NOT a leaf — `hasPathSum` must not return `remaining === 0` at such a node.
- **LCA when p or q is the root**: the first `if (root === p || root === q) return root` handles this. If p is an ancestor of q, `root === p` fires before we recurse into the subtree containing q — correctly identifying p as the LCA.
- **LCA assumes p and q both exist in the tree**: if one is absent, the function may incorrectly return the other as a "LCA". Guard with a contains-check if this isn't guaranteed.
- **Stack overflow on skewed trees**: a tree with 10,000 nodes in a single chain will overflow the call stack recursively. Switch to iterative DFS for production code on unbounded input.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you implement LCA for a BST?" (For a BST, you can compare values: if both p and q are greater than root, recurse right; if both less, recurse left; otherwise root is the LCA. O(h) and avoids visiting unrelated subtrees.)
> - "How would you find all root-to-leaf paths that sum to a target?" (DFS with a running path list; push on entry, pop on backtrack — covered in the backtracking concept.)
> - "What is the time complexity of LCA if the tree is balanced vs skewed?" (Both cases are O(n) worst case — you might need to visit all nodes. But O(h) average if p and q are deep.)
> - "How do you serialize and deserialize a binary tree?" (Preorder DFS; write null as a sentinel like "#"; deserialize by consuming the preorder sequence.)

## The task

Implement the `TreeNode` class and three functions:

```typescript
// The node class — export it so the test can build trees.
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number, left?: TreeNode | null, right?: TreeNode | null)
}

// Return the maximum depth of the binary tree (number of nodes on the longest path).
// [3,9,20,null,null,15,7] → 3
// null → 0
function maxDepth(root: TreeNode | null): number

// Return true if there is a root-to-leaf path whose node values sum to target.
// [5,4,8,11,null,13,4,7,2], target=22 → true (5→4→11→2)
function hasPathSum(root: TreeNode | null, target: number): boolean

// Return the lowest common ancestor of nodes p and q in the tree.
// Both p and q are guaranteed to exist in the tree.
// Tree: [3,5,1,6,2,0,8,null,null,7,4]; p=5, q=1 → node(3)
// Tree: [3,5,1,6,2,0,8,null,null,7,4]; p=5, q=4 → node(5)
function lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null
```
