// Run: node stub.js
//
// Every tree node is a plain object { val, left, right }; missing children
// are null. An empty tree is null.

/**
 * Returns the number of nodes on the longest root-to-leaf path.
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {number}
 */
function maxDepth(root) {
  // TODO: bottom-up — null is 0; otherwise 1 + max of the children's depths
  return 0;
}

/**
 * Returns true if p and q are structurally identical with equal values.
 * @param {object|null} p
 * @param {object|null} q
 * @returns {boolean}
 */
function isSameTree(p, q) {
  // TODO: lockstep — both null true; one null false; compare vals,
  // then recurse on (p.left, q.left) and (p.right, q.right)
  return false;
}

/**
 * Mirrors the tree in place (swaps every node's children). Returns the root.
 * @param {object|null} root
 * @returns {object|null}
 */
function invertTree(root) {
  // TODO: swap root.left and root.right (use a temp!), recurse into both,
  // return root
  return null;
}

/**
 * Returns true if some root-to-leaf path sums exactly to targetSum.
 * @param {object|null} root
 * @param {number} targetSum
 * @returns {boolean}
 */
function hasPathSum(root, targetSum) {
  // TODO: top-down — null is false; at a leaf (no children) compare
  // targetSum === root.val; otherwise recurse with targetSum - root.val
  return false;
}

module.exports = { maxDepth, isSameTree, invertTree, hasPathSum };

function main() {
  const node = (val, left = null, right = null) => ({ val, left, right });

  const t = node(3, node(9), node(20, node(15), node(7)));
  console.log(maxDepth(t)); // 3
  console.log(isSameTree(node(1, node(2), node(3)), node(1, node(2), node(3)))); // true
  console.log(JSON.stringify(invertTree(node(2, node(1), node(3))))); // 2 with left 3, right 1
  console.log(hasPathSum(node(1, node(2), node(3)), 4)); // true (1 → 3)
}

main();
