// Run: tsx exemplar.ts

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

export function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

export function hasPathSum(root: TreeNode | null, target: number): boolean {
  if (root === null) return false;

  const remaining = target - root.val;

  // Only count a path that reaches a leaf
  if (root.left === null && root.right === null) return remaining === 0;

  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}

export function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  // Base cases: empty subtree or found one of the targets
  if (root === null || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  // p in left subtree, q in right subtree → current node is the LCA
  if (left !== null && right !== null) return root;

  // Only one side contains a target; propagate it upward
  return left ?? right;
}
