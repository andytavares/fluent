// Run: tsx stub.ts
//
// Every tree node is a plain object { val, left, right }; missing children
// are null. An empty tree is null.

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/** Returns the number of nodes on the longest root-to-leaf path. */
export function maxDepth(root: TreeNode | null): number {
  // TODO: bottom-up — null is 0; otherwise 1 + max of the children's depths
  return 0;
}

/** Returns true if p and q are structurally identical with equal values. */
export function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  // TODO: lockstep — both null true; one null false; compare vals,
  // then recurse on (p.left, q.left) and (p.right, q.right)
  return false;
}

/** Mirrors the tree in place (swaps every node's children). Returns the root. */
export function invertTree(root: TreeNode | null): TreeNode | null {
  // TODO: swap root.left and root.right (use a temp!), recurse into both,
  // return root
  return null;
}

/** Returns true if some root-to-leaf path sums exactly to targetSum. */
export function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  // TODO: top-down — null is false; at a leaf (no children) compare
  // targetSum === root.val; otherwise recurse with targetSum - root.val
  return false;
}

function main(): void {
  const node = (val: number, left: TreeNode | null = null, right: TreeNode | null = null): TreeNode => ({ val, left, right });

  const t = node(3, node(9), node(20, node(15), node(7)));
  console.log(maxDepth(t)); // 3
  console.log(isSameTree(node(1, node(2), node(3)), node(1, node(2), node(3)))); // true
  console.log(JSON.stringify(invertTree(node(2, node(1), node(3))))); // 2 with left 3, right 1
  console.log(hasPathSum(node(1, node(2), node(3)), 4)); // true (1 → 3)
}

main();
