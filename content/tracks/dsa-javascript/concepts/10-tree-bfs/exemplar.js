// Run: node exemplar.js
//
// Binary tree nodes are plain objects: { val, left, right }.
// left/right are child nodes or null; an empty tree is null.

/**
 * Level order traversal via BFS with a head-index queue (shift() is O(n);
 * reading queue[head++] keeps the whole traversal linear). The levelEnd
 * snapshot marks the boundary: children pushed while draining land at
 * indexes >= levelEnd, so they always belong to the next level.
 * O(n) time, O(w) space where w is the widest level.
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {number[][]}
 */
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const levelEnd = queue.length; // snapshot: [head, levelEnd) is one level
    const level = [];
    while (head < levelEnd) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

/**
 * Rightmost node per level: same level loop, but only the last node drained
 * from each level is recorded. Enqueue order is left-to-right, so the last
 * node of a level is its rightmost — even when it lives in a left subtree.
 * O(n) time, O(w) space.
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {number[]}
 */
function rightSideView(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const levelEnd = queue.length;
    while (head < levelEnd) {
      const node = queue[head++];
      if (head === levelEnd) result.push(node.val); // last of this level
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return result;
}

/**
 * Zigzag is a presentation change, not a traversal change: children are
 * always enqueued left-then-right, and only the collected level array is
 * reversed on odd depths.
 * O(n) time, O(w) space.
 * @param {{val: number, left: object|null, right: object|null}|null} root
 * @returns {number[][]}
 */
function zigzagLevelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  let head = 0;
  let leftToRight = true;
  while (head < queue.length) {
    const levelEnd = queue.length;
    const level = [];
    while (head < levelEnd) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(leftToRight ? level : level.reverse());
    leftToRight = !leftToRight;
  }
  return result;
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
