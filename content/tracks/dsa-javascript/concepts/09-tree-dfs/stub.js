// Run: node stub.js

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Returns the maximum depth of the binary tree.
 * @param {TreeNode|null} root
 * @returns {number}
 */
function maxDepth(root) {
  // TODO: post-order — return 1 + max(maxDepth(left), maxDepth(right))
  return 0;
}

/**
 * Returns true if any root-to-leaf path sums to target.
 * @param {TreeNode|null} root
 * @param {number} target
 * @returns {boolean}
 */
function hasPathSum(root, target) {
  // TODO: pre-order — subtract root.val from target, recurse on children
  // leaf base case: no children && root.val === target
  return false;
}

/**
 * Returns the lowest common ancestor of p and q in a binary tree.
 * @param {TreeNode|null} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @returns {TreeNode|null}
 */
function lowestCommonAncestor(root, p, q) {
  // TODO: if !root || root === p || root === q, return root
  // recurse left and right; if both non-null, root is LCA
  // otherwise return whichever side is non-null
  return null;
}

module.exports = { TreeNode, maxDepth, hasPathSum, lowestCommonAncestor };

function main() {
  const tree = new TreeNode(3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7))
  );
  console.log(maxDepth(tree)); // 3

  const root = new TreeNode(3,
    new TreeNode(5, new TreeNode(6), new TreeNode(2)),
    new TreeNode(1, null, new TreeNode(8))
  );
  console.log(lowestCommonAncestor(root, root.left, root.right).val); // 3
}

main();
