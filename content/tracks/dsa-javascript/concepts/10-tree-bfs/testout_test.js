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

// Helper: perfect binary tree of the given depth, values = heap indexes 1..2^depth - 1.
function buildPerfect(depth, index = 1) {
  if (depth === 0) return null;
  return {
    val: index,
    left: buildPerfect(depth - 1, index * 2),
    right: buildPerfect(depth - 1, index * 2 + 1),
  };
}

// Helper: chain of `length` nodes alternating left/right children, values 0..length-1.
function buildChain(length) {
  if (length === 0) return null;
  const root = { val: 0, left: null, right: null };
  let node = root;
  for (let v = 1; v < length; v++) {
    const child = { val: v, left: null, right: null };
    if (v % 2 === 0) node.left = child;
    else node.right = child;
    node = child;
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
test("levelOrder: perfect depth-10 tree — every level complete and ordered", () => {
  const result = levelOrder(buildPerfect(10));
  assert.strictEqual(result.length, 10);
  for (let d = 0; d < 10; d++) {
    const expected = Array.from({ length: 2 ** d }, (_, i) => 2 ** d + i);
    assert.deepStrictEqual(result[d], expected);
  }
});
test("levelOrder: 1500-node zigzag chain — one value per level", () => {
  const result = levelOrder(buildChain(1500));
  assert.strictEqual(result.length, 1500);
  assert.deepStrictEqual(result[0], [0]);
  assert.deepStrictEqual(result[1499], [1499]);
  assert.deepStrictEqual(result[777], [777]);
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
  const root = buildTree([1, 2, 3, 4]);
  assert.deepStrictEqual(rightSideView(root), [1, 3, 4]);
});
test("rightSideView: view switches between subtrees on the way down", () => {
  // depth 3 exists only under the *left* child's right branch
  const root = buildTree([1, 2, 3, null, 4, null, null, 5]);
  assert.deepStrictEqual(rightSideView(root), [1, 3, 4, 5]);
});
test("rightSideView: perfect depth-10 tree — rightmost heap indexes", () => {
  const expected = Array.from({ length: 10 }, (_, d) => 2 ** (d + 1) - 1);
  assert.deepStrictEqual(rightSideView(buildPerfect(10)), expected);
});
test("rightSideView: 1500-node chain shows every value", () => {
  const expected = Array.from({ length: 1500 }, (_, i) => i);
  assert.deepStrictEqual(rightSideView(buildChain(1500)), expected);
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
test("zigzagLevelOrder: perfect depth-10 tree — odd levels reversed", () => {
  const result = zigzagLevelOrder(buildPerfect(10));
  assert.strictEqual(result.length, 10);
  for (let d = 0; d < 10; d++) {
    const level = Array.from({ length: 2 ** d }, (_, i) => 2 ** d + i);
    if (d % 2 === 1) level.reverse();
    assert.deepStrictEqual(result[d], level);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
