// Run: tsx stub.ts
//
// Binary tree nodes are plain objects: { val, left, right }.
// left/right are child nodes or null; an empty tree is null.
// BST invariant: for every node, ALL left-subtree values < node.val < ALL
// right-subtree values (strict — duplicates are invalid).

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/** Returns the smallest absolute difference between any two node values. root is a valid BST with at least two nodes. */
export function getMinimumDifference(root: TreeNode): number {
  // TODO: in-order traversal with a prev tracker — the closest pair in a
  // sorted sequence is adjacent, so compare each value only to prev
  return 0;
}

/** Returns the k-th smallest value in the BST (k is 1-indexed, 1 <= k <= node count). */
export function kthSmallest(root: TreeNode, k: number): number {
  // TODO: iterative in-order with an explicit stack; slide left, pop,
  // decrement k — return the popped value when k hits 0 (early exit)
  return 0;
}

/** Returns true if the tree satisfies the BST invariant. */
export function isValidBST(root: TreeNode | null): boolean {
  // TODO: propagate (lo, hi) bounds — left tightens hi, right tightens lo;
  // checking only parent vs child misses violations against an ancestor
  return false;
}

function node(val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode {
  return { val, left, right };
}

function main(): void {
  const bst = node(4, node(2, node(1), node(3)), node(6));
  console.log(getMinimumDifference(bst)); // 1
  console.log(kthSmallest(bst, 3)); // 3
  console.log(isValidBST(bst)); // true
  console.log(isValidBST(node(5, node(1), node(4, node(3), node(6))))); // false
}

main();
