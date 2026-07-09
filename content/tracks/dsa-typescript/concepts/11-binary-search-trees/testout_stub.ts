// Binary tree nodes are plain objects: { val, left, right }.
// left/right are child nodes or null; an empty tree is null.
// BST invariant: for every node, ALL left-subtree values < node.val < ALL
// right-subtree values (strict — duplicates are invalid).

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function getMinimumDifference(root: TreeNode): number {
  return 0;
}

export function kthSmallest(root: TreeNode, k: number): number {
  return 0;
}

export function isValidBST(root: TreeNode | null): boolean {
  return false;
}
