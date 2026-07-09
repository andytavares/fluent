// Binary tree nodes are plain objects: { val, left, right }.
// left/right are child nodes or null; an empty tree is null.
// BST invariant: for every node, ALL left-subtree values < node.val < ALL
// right-subtree values (strict — duplicates are invalid).

/**
 * @param {{val: number, left: object|null, right: object|null}} root
 *   a valid BST with at least two nodes
 * @returns {number}
 */
function getMinimumDifference(root) {
  return 0;
}

/**
 * @param {{val: number, left: object|null, right: object|null}} root
 *   a valid BST
 * @param {number} k  1 <= k <= number of nodes
 * @returns {number}
 */
function kthSmallest(root, k) {
  return 0;
}

/**
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {boolean}
 */
function isValidBST(root) {
  return false;
}

module.exports = { getMinimumDifference, kthSmallest, isValidBST };
