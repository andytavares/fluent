const assert = require("assert");
const { TreeNode, levelOrder, rightSideView, zigzagLevelOrder } = require("./stub");

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

// levelOrder
test("levelOrder: null", () => {
  assert.deepStrictEqual(levelOrder(null), []);
});
test("levelOrder: single node", () => {
  assert.deepStrictEqual(levelOrder(new TreeNode(1)), [[1]]);
});
test("levelOrder: classic tree", () => {
  const t = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
  assert.deepStrictEqual(levelOrder(t), [[3], [9, 20], [15, 7]]);
});
test("levelOrder: perfect binary tree", () => {
  const t = new TreeNode(1,
    new TreeNode(2, new TreeNode(4), new TreeNode(5)),
    new TreeNode(3, new TreeNode(6), new TreeNode(7))
  );
  assert.deepStrictEqual(levelOrder(t), [[1], [2, 3], [4, 5, 6, 7]]);
});
test("levelOrder: left-skewed", () => {
  const t = new TreeNode(1, new TreeNode(2, new TreeNode(3)));
  assert.deepStrictEqual(levelOrder(t), [[1], [2], [3]]);
});
test("levelOrder: right-skewed", () => {
  const t = new TreeNode(1, null, new TreeNode(2, null, new TreeNode(3)));
  assert.deepStrictEqual(levelOrder(t), [[1], [2], [3]]);
});

// rightSideView
test("rightSideView: null", () => {
  assert.deepStrictEqual(rightSideView(null), []);
});
test("rightSideView: single node", () => {
  assert.deepStrictEqual(rightSideView(new TreeNode(1)), [1]);
});
test("rightSideView: classic example", () => {
  const t = new TreeNode(1, new TreeNode(2, null, new TreeNode(5)), new TreeNode(3));
  assert.deepStrictEqual(rightSideView(t), [1, 3, 5]);
});
test("rightSideView: all right children", () => {
  const t = new TreeNode(1, null, new TreeNode(2, null, new TreeNode(3)));
  assert.deepStrictEqual(rightSideView(t), [1, 2, 3]);
});
test("rightSideView: left-side node visible at its depth", () => {
  const t = new TreeNode(1, new TreeNode(2, new TreeNode(4)), new TreeNode(3));
  assert.deepStrictEqual(rightSideView(t), [1, 3, 4]);
});
test("rightSideView: balanced tree", () => {
  const t = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
  assert.deepStrictEqual(rightSideView(t), [3, 20, 7]);
});

// zigzagLevelOrder
test("zigzagLevelOrder: null", () => {
  assert.deepStrictEqual(zigzagLevelOrder(null), []);
});
test("zigzagLevelOrder: single node", () => {
  assert.deepStrictEqual(zigzagLevelOrder(new TreeNode(1)), [[1]]);
});
test("zigzagLevelOrder: classic tree", () => {
  const t = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
  assert.deepStrictEqual(zigzagLevelOrder(t), [[3], [20, 9], [15, 7]]);
});
test("zigzagLevelOrder: two levels", () => {
  const t = new TreeNode(1, new TreeNode(2), new TreeNode(3));
  assert.deepStrictEqual(zigzagLevelOrder(t), [[1], [3, 2]]);
});
test("zigzagLevelOrder: four levels", () => {
  const t = new TreeNode(1,
    new TreeNode(2, new TreeNode(4), new TreeNode(5)),
    new TreeNode(3, new TreeNode(6), new TreeNode(7))
  );
  // level 0: [1], level 1 reversed: [3,2], level 2: [4,5,6,7]
  assert.deepStrictEqual(zigzagLevelOrder(t), [[1], [3, 2], [4, 5, 6, 7]]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
