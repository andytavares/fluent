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

// Return true if the tree is a valid BST (strict inequalities, no duplicates).
export function isValidBST(root: TreeNode | null): boolean {
  // TODO: inner helper with (node, min, max) bounds narrowing as you descend
  return false;
}

// Return the kth smallest value in the BST (1-indexed).
export function kthSmallest(root: TreeNode | null, k: number): number {
  // TODO: inorder traversal; increment a counter; return when counter === k
  return 0;
}

// Reconstruct a BST from its preorder traversal. Return the root.
export function buildBSTFromPreorder(preorder: number[]): TreeNode | null {
  // TODO: use an index variable shared across calls;
  // pass maxVal to bound the subtree being built
  return null;
}

// Usage example (uncomment to test manually):
// const bst = new TreeNode(5, new TreeNode(3, new TreeNode(2), new TreeNode(4)), new TreeNode(6));
// console.log(isValidBST(bst));       // true
// console.log(kthSmallest(bst, 2));   // 3
