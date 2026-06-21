// Run: node exemplar.js

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Returns true if the tree satisfies the BST property.
 * Propagates min/max bounds — catches violations where a node in the right
 * subtree is smaller than an ancestor (not just the immediate parent).
 * O(n) time, O(h) space.
 * @param {TreeNode|null} root
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}

/**
 * Returns the kth smallest value in the BST (1-indexed).
 * In-order traversal yields sorted order; stop at the kth node visited.
 * Shared closure variables count and result enable early exit.
 * O(h + k) time, O(h) space.
 * @param {TreeNode} root
 * @param {number} k
 * @returns {number}
 */
function kthSmallest(root, k) {
  let count = 0, result = null;
  function inorder(node) {
    if (!node || result !== null) return; // early exit once found
    inorder(node.left);
    if (++count === k) { result = node.val; return; }
    inorder(node.right);
  }
  inorder(root);
  return result;
}

/**
 * Reconstructs the BST from its preorder traversal. Returns the root.
 * Uses a shared index i and range bounds to assign each element to the
 * correct subtree in O(n) without finding split points explicitly.
 * O(n) time, O(h) space.
 * @param {number[]} preorder
 * @returns {TreeNode|null}
 */
function buildBSTFromPreorder(preorder) {
  let i = 0;
  function build(min, max) {
    if (i === preorder.length || preorder[i] < min || preorder[i] > max) return null;
    const val = preorder[i++];
    const node = new TreeNode(val);
    node.left  = build(min, val);  // left: must be in (min, val)
    node.right = build(val, max);  // right: must be in (val, max)
    return node;
  }
  return build(-Infinity, Infinity);
}

/** Helper: collect in-order values from a tree */
function inorderValues(root) {
  const res = [];
  function dfs(n) { if (!n) return; dfs(n.left); res.push(n.val); dfs(n.right); }
  dfs(root);
  return res;
}

module.exports = { TreeNode, isValidBST, kthSmallest, buildBSTFromPreorder };

function main() {
  console.log(isValidBST(new TreeNode(2, new TreeNode(1), new TreeNode(3)))); // true
  console.log(isValidBST(new TreeNode(5, new TreeNode(1), new TreeNode(4, new TreeNode(3), new TreeNode(6))))); // false

  const bst = new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4));
  console.log(kthSmallest(bst, 1)); // 1
  console.log(kthSmallest(bst, 3)); // 3

  const tree = buildBSTFromPreorder([8, 5, 1, 7, 10, 12]);
  console.log(inorderValues(tree)); // [1, 5, 7, 8, 10, 12]
}

main();
