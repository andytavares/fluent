// Nodes are plain { val, left, right } objects; missing children are null.
// An empty tree is null.

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function maxDepth(root: TreeNode | null): number {
  return 0;
}

export function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  return false;
}

export function invertTree(root: TreeNode | null): TreeNode | null {
  return null;
}

export function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  return false;
}
