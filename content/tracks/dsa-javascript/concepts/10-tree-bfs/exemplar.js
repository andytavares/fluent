// Run: node exemplar.js

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Returns level-order values as an array of arrays.
 * Key: snapshot levelSize before each level's loop.
 * O(n) time, O(w) space — w = max level width.
 * @param {TreeNode|null} root
 * @returns {number[][]}
 */
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const levelSize = queue.length; // snapshot
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

/**
 * Returns the last value at each level (right side view).
 * Same BFS; record node.val only at i === levelSize - 1.
 * O(n) time, O(w) space.
 * @param {TreeNode|null} root
 * @returns {number[]}
 */
function rightSideView(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (i === levelSize - 1) result.push(node.val); // last in level
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return result;
}

/**
 * Returns level-order values alternating left-to-right and right-to-left.
 * Same BFS; reverse the level array on odd-numbered levels.
 * O(n) time, O(w) space.
 * @param {TreeNode|null} root
 * @returns {number[][]}
 */
function zigzagLevelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  let leftToRight = true;
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(leftToRight ? level : level.reverse());
    leftToRight = !leftToRight;
  }
  return result;
}

module.exports = { TreeNode, levelOrder, rightSideView, zigzagLevelOrder };

function main() {
  const tree = new TreeNode(3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7))
  );
  console.log(JSON.stringify(levelOrder(tree)));         // [[3],[9,20],[15,7]]
  console.log(rightSideView(tree));                      // [3, 20, 7]
  console.log(JSON.stringify(zigzagLevelOrder(tree)));   // [[3],[20,9],[15,7]]
}

main();
