// Run: tsx exemplar.ts
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

/**
 * In-order traversal of a BST is ascending, and the closest pair in a
 * sorted sequence is adjacent — so track only the previously visited value
 * and fold each in-order gap into the running minimum.
 * O(n) time, O(h) stack.
 */
export function getMinimumDifference(root: TreeNode): number {
  let prev: number | null = null;
  let best = Infinity;
  const walk = (node: TreeNode | null): void => {
    if (node === null) return;
    walk(node.left);
    if (prev !== null) best = Math.min(best, node.val - prev);
    prev = node.val;
    walk(node.right);
  };
  walk(root);
  return best;
}

/**
 * Iterative in-order with early exit: slide down the left spine pushing
 * ancestors, pop the next value in sorted order, stop at the k-th pop.
 * Nodes past the k-th are never touched.
 * O(h + k) time, O(h) stack.
 */
export function kthSmallest(root: TreeNode, k: number): number {
  const stack: TreeNode[] = [];
  let node: TreeNode | null = root;
  while (node !== null || stack.length > 0) {
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop()!;
    k--;
    if (k === 0) return node.val;
    node = node.right;
  }
  return -1; // unreachable when 1 <= k <= node count
}

/**
 * Range propagation: every value in a subtree must lie strictly inside
 * (lo, hi). Recursing left tightens hi, recursing right tightens lo — that
 * is how a violation several levels below an ancestor is still caught.
 * The <= / >= comparisons reject duplicates.
 * O(n) time, O(h) stack.
 */
export function isValidBST(root: TreeNode | null): boolean {
  const valid = (node: TreeNode | null, lo: number, hi: number): boolean => {
    if (node === null) return true;
    if (node.val <= lo || node.val >= hi) return false;
    return valid(node.left, lo, node.val) && valid(node.right, node.val, hi);
  };
  return valid(root, -Infinity, Infinity);
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
