// Run: node stub.js

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Returns an array of arrays with values at each depth level.
 * @param {TreeNode|null} root
 * @returns {number[][]}
 */
function levelOrder(root) {
  // TODO: BFS with queue; snapshot levelSize before each level's loop
  return [];
}

/**
 * Returns values visible from the right side (last node at each level).
 * @param {TreeNode|null} root
 * @returns {number[]}
 */
function rightSideView(root) {
  // TODO: BFS; push node.val to result only when i === levelSize - 1
  return [];
}

/**
 * Returns level-order values alternating left-to-right and right-to-left.
 * @param {TreeNode|null} root
 * @returns {number[][]}
 */
function zigzagLevelOrder(root) {
  // TODO: same as levelOrder; on odd levels, reverse the level array before pushing
  return [];
}

module.exports = { TreeNode, levelOrder, rightSideView, zigzagLevelOrder };

function main() {
  const tree = new TreeNode(3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7))
  );
  console.log(JSON.stringify(levelOrder(tree)));        // [[3],[9,20],[15,7]]
  console.log(rightSideView(tree));                     // [3, 20, 7]
  console.log(JSON.stringify(zigzagLevelOrder(tree)));  // [[3],[20,9],[15,7]]
}

main();
