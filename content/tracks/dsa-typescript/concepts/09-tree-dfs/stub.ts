// Run: tsx stub.ts

export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Return the maximum depth of the binary tree.
export function maxDepth(root: TreeNode | null): number {
  // TODO: null → 0; 1 + max(depth of left, depth of right)
  return 0;
}

// Return true if there is a root-to-leaf path summing to target.
export function hasPathSum(root: TreeNode | null, target: number): boolean {
  // TODO: decrement target as you recurse; at a leaf, check remainder === 0
  return false;
}

// Return the lowest common ancestor of nodes p and q (both guaranteed to exist).
export function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  // TODO: if root is null/p/q return root;
  // recurse left and right; if both return non-null, current node is the LCA
  return null;
}

// Usage example (uncomment to test manually):
// const t = new TreeNode(3, new TreeNode(9), new TreeNode(20));
// console.log(maxDepth(t));           // 2
// console.log(hasPathSum(t, 23));     // true (3+20)
