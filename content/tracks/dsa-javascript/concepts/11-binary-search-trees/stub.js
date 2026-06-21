// Run: node stub.js

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Returns true if the binary tree is a valid BST.
 * @param {TreeNode|null} root
 * @returns {boolean}
 */
function isValidBST(root) {
  // TODO: helper(node, min, max); root.val must be > min AND < max
  // left child: tighten max to root.val; right child: tighten min to root.val
  return false;
}

/**
 * Returns the kth smallest value in the BST (1-indexed).
 * @param {TreeNode} root
 * @param {number} k
 * @returns {number}
 */
function kthSmallest(root, k) {
  // TODO: in-order DFS; use closure variables count and result for early exit
  return 0;
}

/**
 * Reconstructs the BST from its preorder traversal. Returns the root.
 * @param {number[]} preorder
 * @returns {TreeNode|null}
 */
function buildBSTFromPreorder(preorder) {
  // TODO: closure variable i; build(min, max) — consume preorder[i] if in range
  // node.left = build(min, val); node.right = build(val, max)
  return null;
}

module.exports = { TreeNode, isValidBST, kthSmallest, buildBSTFromPreorder };

function main() {
  console.log(isValidBST(new TreeNode(2, new TreeNode(1), new TreeNode(3)))); // true
  const bst = new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4));
  console.log(kthSmallest(bst, 1)); // 1
  console.log(buildBSTFromPreorder([8, 5, 1, 7, 10, 12]) !== null); // true
}

main();
