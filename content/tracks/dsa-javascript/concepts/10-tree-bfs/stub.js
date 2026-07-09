// Run: node stub.js
//
// Binary tree nodes are plain objects: { val, left, right }.
// left/right are child nodes or null; an empty tree is null.

/**
 * Returns node values grouped by depth, top to bottom, left to right.
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {number[][]}
 */
function levelOrder(root) {
  // TODO: queue BFS; snapshot the queue length before draining each level
  // so children pushed mid-level land in the *next* level
  return [];
}

/**
 * Returns the rightmost node value at each depth, top to bottom.
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {number[]}
 */
function rightSideView(root) {
  // TODO: same level loop; record only the value drained last in each level
  // (not the right spine — a left-subtree node can be visible)
  return [];
}

/**
 * Returns the level order traversal with alternating direction per level.
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {number[][]}
 */
function zigzagLevelOrder(root) {
  // TODO: enqueue left-then-right at every depth; reverse the collected
  // level array on odd depths (never reorder the queue itself)
  return [];
}

module.exports = { levelOrder, rightSideView, zigzagLevelOrder };

function node(val, left = null, right = null) {
  return { val, left, right };
}

function main() {
  const root = node(3, node(9), node(20, node(15), node(7)));
  console.log(JSON.stringify(levelOrder(root)));       // [[3],[9,20],[15,7]]
  console.log(JSON.stringify(rightSideView(root)));    // [3,20,7]
  console.log(JSON.stringify(zigzagLevelOrder(root))); // [[3],[20,9],[15,7]]
}

main();
