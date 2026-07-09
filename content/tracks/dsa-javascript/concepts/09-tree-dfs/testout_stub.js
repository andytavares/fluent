// Nodes are plain { val, left, right } objects; missing children are null.
// An empty tree is null.

/**
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {number}
 */
function maxDepth(root) {
  return 0;
}

/**
 * @param {object|null} p
 * @param {object|null} q
 * @returns {boolean}
 */
function isSameTree(p, q) {
  return false;
}

/**
 * @param {object|null} root
 * @returns {object|null}
 */
function invertTree(root) {
  return null;
}

/**
 * @param {object|null} root
 * @param {number} targetSum
 * @returns {boolean}
 */
function hasPathSum(root, targetSum) {
  return false;
}

module.exports = { maxDepth, isSameTree, invertTree, hasPathSum };
