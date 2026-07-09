// Run: tsx exemplar.ts
//
// Every tree node is a plain object { val, left, right }; missing children
// are null. An empty tree is null.

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * Returns the number of nodes on the longest root-to-leaf path.
 * Bottom-up: each call answers for its whole subtree; null anchors at 0.
 * O(n) time, O(h) space.
 */
export function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

/**
 * Returns true if p and q are structurally identical with equal values.
 * Lockstep recursion on a pair of nodes; the null combinations come first,
 * and && short-circuits on the first mismatch.
 * O(min(m, n)) time, O(h) space.
 */
export function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (p === null && q === null) return true;
  if (p === null || q === null) return false;
  return p.val === q.val
    && isSameTree(p.left, q.left)
    && isSameTree(p.right, q.right);
}

/**
 * Mirrors the tree in place (swaps every node's children). Returns the root.
 * One swap per node; destructuring avoids the lost-subtree bug.
 * O(n) time, O(h) space.
 */
export function invertTree(root: TreeNode | null): TreeNode | null {
  if (root === null) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}

/**
 * Returns true if some root-to-leaf path sums exactly to targetSum.
 * Top-down: subtract while descending; decide only at a real leaf.
 * The null case doubles as "an empty tree has no paths".
 * O(n) time, O(h) space.
 */
export function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (root === null) return false;
  if (root.left === null && root.right === null) return targetSum === root.val;
  return hasPathSum(root.left, targetSum - root.val)
    || hasPathSum(root.right, targetSum - root.val);
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
