const assert = require("assert");
const { levelOrder, rightSideView, zigzagLevelOrder } = require("./stub");

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name} — ${e.message}`);
    failed++;
  }
}

// Helper: builds a { val, left, right } tree from a level-order array with
// nulls for missing children, e.g. [3, 9, 20, null, null, 15, 7].
function buildTree(values) {
  if (values.length === 0 || values[0] === null) return null;
  const root = { val: values[0], left: null, right: null };
  const queue = [root];
  let head = 0;
  let i = 1;
  while (i < values.length) {
    const node = queue[head++];
    const l = values[i++];
    if (l !== null && l !== undefined) {
      node.left = { val: l, left: null, right: null };
      queue.push(node.left);
    }
    if (i < values.length) {
      const r = values[i++];
      if (r !== null && r !== undefined) {
        node.right = { val: r, left: null, right: null };
        queue.push(node.right);
      }
    }
  }
  return root;
}

// ── levelOrder ──
test("levelOrder: classic three-level tree", () => {
  const root = buildTree([3, 9, 20, null, null, 15, 7]);
  assert.deepStrictEqual(levelOrder(root), [[3], [9, 20], [15, 7]]);
});
test("levelOrder: empty tree returns []", () => {
  assert.deepStrictEqual(levelOrder(null), []);
});
test("levelOrder: single node", () => {
  assert.deepStrictEqual(levelOrder(buildTree([1])), [[1]]);
});
test("levelOrder: left-skewed chain — one node per level", () => {
  const root = buildTree([1, 2, null, 3]);
  assert.deepStrictEqual(levelOrder(root), [[1], [2], [3]]);
});
test("levelOrder: right-skewed chain", () => {
  const root = buildTree([1, null, 2, null, 3]);
  assert.deepStrictEqual(levelOrder(root), [[1], [2], [3]]);
});
test("levelOrder: negative values", () => {
  const root = buildTree([-1, -2, -3]);
  assert.deepStrictEqual(levelOrder(root), [[-1], [-2, -3]]);
});
test("levelOrder: full three-level tree keeps left-to-right order", () => {
  const root = buildTree([1, 2, 3, 4, 5, 6, 7]);
  assert.deepStrictEqual(levelOrder(root), [[1], [2, 3], [4, 5, 6, 7]]);
});

// ── rightSideView ──
test("rightSideView: classic example", () => {
  const root = buildTree([1, 2, 3, null, 5, null, 4]);
  assert.deepStrictEqual(rightSideView(root), [1, 3, 4]);
});
test("rightSideView: empty tree returns []", () => {
  assert.deepStrictEqual(rightSideView(null), []);
});
test("rightSideView: single node", () => {
  assert.deepStrictEqual(rightSideView(buildTree([7])), [7]);
});
test("rightSideView: right-only chain", () => {
  assert.deepStrictEqual(rightSideView(buildTree([1, null, 3])), [1, 3]);
});
test("rightSideView: left-only chain is fully visible", () => {
  assert.deepStrictEqual(rightSideView(buildTree([1, 2, null, 3])), [1, 2, 3]);
});
test("rightSideView: left-subtree node visible when right side ends", () => {
  // 1 → (2, 3), 2.left = 4, 3 is a leaf: depth 2 only contains 4
  const root = buildTree([1, 2, 3, 4]);
  assert.deepStrictEqual(rightSideView(root), [1, 3, 4]);
});

// ── zigzagLevelOrder ──
test("zigzagLevelOrder: classic three-level tree", () => {
  const root = buildTree([3, 9, 20, null, null, 15, 7]);
  assert.deepStrictEqual(zigzagLevelOrder(root), [[3], [20, 9], [15, 7]]);
});
test("zigzagLevelOrder: empty tree returns []", () => {
  assert.deepStrictEqual(zigzagLevelOrder(null), []);
});
test("zigzagLevelOrder: single node", () => {
  assert.deepStrictEqual(zigzagLevelOrder(buildTree([1])), [[1]]);
});
test("zigzagLevelOrder: full three-level tree", () => {
  const root = buildTree([1, 2, 3, 4, 5, 6, 7]);
  assert.deepStrictEqual(zigzagLevelOrder(root), [[1], [3, 2], [4, 5, 6, 7]]);
});
test("zigzagLevelOrder: four levels flip direction twice", () => {
  const root = buildTree([1, 2, 3, 4, null, null, 5, 6, null, null, 7]);
  assert.deepStrictEqual(zigzagLevelOrder(root), [[1], [3, 2], [4, 5], [7, 6]]);
});
test("zigzagLevelOrder: single-node levels are unaffected by direction", () => {
  const root = buildTree([1, 2, null, 3]);
  assert.deepStrictEqual(zigzagLevelOrder(root), [[1], [2], [3]]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
