const assert = require("assert");
const { TreeNode, maxDepth, hasPathSum, lowestCommonAncestor } = require("./stub");

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

// maxDepth tests
test("maxDepth: null tree", () => {
  assert.strictEqual(maxDepth(null), 0);
});
test("maxDepth: single node", () => {
  assert.strictEqual(maxDepth(new TreeNode(1)), 1);
});
test("maxDepth: balanced depth 3", () => {
  const tree = new TreeNode(3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7))
  );
  assert.strictEqual(maxDepth(tree), 3);
});
test("maxDepth: left-skewed depth 3", () => {
  const tree = new TreeNode(1, new TreeNode(2, new TreeNode(3)));
  assert.strictEqual(maxDepth(tree), 3);
});
test("maxDepth: right-skewed depth 4", () => {
  const tree = new TreeNode(1, null, new TreeNode(2, null, new TreeNode(3, null, new TreeNode(4))));
  assert.strictEqual(maxDepth(tree), 4);
});

// hasPathSum tests
test("hasPathSum: null tree", () => {
  assert.strictEqual(hasPathSum(null, 0), false);
});
test("hasPathSum: single node exact match", () => {
  assert.strictEqual(hasPathSum(new TreeNode(5), 5), true);
});
test("hasPathSum: single node no match", () => {
  assert.strictEqual(hasPathSum(new TreeNode(5), 4), false);
});
test("hasPathSum: path exists", () => {
  // 5->4->11->2 = 22
  const n11 = new TreeNode(11, new TreeNode(7), new TreeNode(2));
  const tree = new TreeNode(5,
    new TreeNode(4, n11),
    new TreeNode(8, new TreeNode(13), new TreeNode(4, null, new TreeNode(1)))
  );
  assert.strictEqual(hasPathSum(tree, 22), true);
});
test("hasPathSum: path does not exist", () => {
  const tree = new TreeNode(5,
    new TreeNode(4, new TreeNode(11, new TreeNode(7), new TreeNode(2))),
    new TreeNode(8, new TreeNode(13))
  );
  assert.strictEqual(hasPathSum(tree, 5), false);
});
test("hasPathSum: negative target", () => {
  const tree = new TreeNode(-2, null, new TreeNode(-3));
  assert.strictEqual(hasPathSum(tree, -5), true);
});

// lowestCommonAncestor tests
const n6 = new TreeNode(6);
const n2t = new TreeNode(2);
const n5 = new TreeNode(5, n6, n2t);
const n8 = new TreeNode(8);
const n1 = new TreeNode(1, null, n8);
const lcaRoot = new TreeNode(3, n5, n1);

test("lowestCommonAncestor: p and q in different subtrees", () => {
  assert.strictEqual(lowestCommonAncestor(lcaRoot, n5, n1).val, 3);
});
test("lowestCommonAncestor: p is ancestor of q", () => {
  assert.strictEqual(lowestCommonAncestor(lcaRoot, n5, n6).val, 5);
});
test("lowestCommonAncestor: p and q are siblings", () => {
  assert.strictEqual(lowestCommonAncestor(lcaRoot, n6, n2t).val, 5);
});
test("lowestCommonAncestor: one node is root", () => {
  assert.strictEqual(lowestCommonAncestor(lcaRoot, lcaRoot, n5).val, 3);
});
test("lowestCommonAncestor: single level tree", () => {
  const a = new TreeNode(1);
  const b = new TreeNode(2);
  const root = new TreeNode(3, a, b);
  assert.strictEqual(lowestCommonAncestor(root, a, b).val, 3);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
