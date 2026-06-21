// Run: node exemplar.js

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Returns the maximum depth of the binary tree.
 * Post-order: compute subtree depths first, then take max + 1 at root.
 * O(n) time, O(h) space.
 * @param {TreeNode|null} root
 * @returns {number}
 */
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

/**
 * Returns true if any root-to-leaf path sums to target.
 * Pre-order: subtract node value as we descend; check at leaves.
 * O(n) time, O(h) space.
 * @param {TreeNode|null} root
 * @param {number} target
 * @returns {boolean}
 */
function hasPathSum(root, target) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === target; // leaf
  const remaining = target - root.val;
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}

/**
 * Returns the lowest common ancestor of nodes p and q in the binary tree.
 *
 * Post-order: recurse left and right first. Return logic:
 *   - If root is null, p, or q: return root (base case / found one target)
 *   - If both left and right returned non-null: root is the LCA (p and q split)
 *   - Otherwise: return whichever side is non-null (both targets are in that subtree)
 *
 * O(n) time, O(h) space.
 * @param {TreeNode|null} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @returns {TreeNode|null}
 */
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left  = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root; // p in left subtree, q in right subtree
  return left ?? right;           // both in the same subtree
}

module.exports = { TreeNode, maxDepth, hasPathSum, lowestCommonAncestor };

function main() {
  const tree = new TreeNode(3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7))
  );
  console.log(maxDepth(tree)); // 3
  console.log(hasPathSum(tree, 38)); // true (3+20+15)

  //       3
  //      / \
  //     5   1
  //    / \ / \
  //   6  2 0  8
  const n5 = new TreeNode(5, new TreeNode(6), new TreeNode(2));
  const n1 = new TreeNode(1, new TreeNode(0), new TreeNode(8));
  const root = new TreeNode(3, n5, n1);
  console.log(lowestCommonAncestor(root, n5, n1).val); // 3
  console.log(lowestCommonAncestor(root, n5, new TreeNode(6, null, null)).val); // 5 -- not found edge; test with actual node ref
}

main();
