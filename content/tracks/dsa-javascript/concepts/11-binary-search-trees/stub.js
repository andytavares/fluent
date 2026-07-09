// Run: node stub.js
//
// Binary tree nodes are plain objects: { val, left, right }.
// left/right are child nodes or null; an empty tree is null.
// BST invariant: for every node, ALL left-subtree values < node.val < ALL
// right-subtree values (strict — duplicates are invalid).

/**
 * Returns the smallest absolute difference between any two node values.
 * @param {{val: number, left: object|null, right: object|null}} root
 *   a valid BST with at least two nodes
 * @returns {number}
 */
function getMinimumDifference(root) {
  // TODO: in-order traversal with a prev tracker — the closest pair in a
  // sorted sequence is adjacent, so compare each value only to prev
  return 0;
}

/**
 * Returns the k-th smallest value in the BST (k is 1-indexed).
 * @param {{val: number, left: object|null, right: object|null}} root
 *   a valid BST
 * @param {number} k  1 <= k <= number of nodes
 * @returns {number}
 */
function kthSmallest(root, k) {
  // TODO: iterative in-order with an explicit stack; slide left, pop,
  // decrement k — return the popped value when k hits 0 (early exit)
  return 0;
}

/**
 * Returns true if the tree satisfies the BST invariant.
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {boolean}
 */
function isValidBST(root) {
  // TODO: propagate (lo, hi) bounds — left tightens hi, right tightens lo;
  // checking only parent vs child misses violations against an ancestor
  return false;
}

module.exports = { getMinimumDifference, kthSmallest, isValidBST };

function node(val, left = null, right = null) {
  return { val, left, right };
}

function main() {
  const bst = node(4, node(2, node(1), node(3)), node(6));
  console.log(getMinimumDifference(bst)); // 1
  console.log(kthSmallest(bst, 3)); // 3
  console.log(isValidBST(bst)); // true
  console.log(isValidBST(node(5, node(1), node(4, node(3), node(6))))); // false
}

main();
