const assert = require("assert");
const { TreeNode, isValidBST, kthSmallest, buildBSTFromPreorder } = require("./stub");

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

function inorderValues(root) {
  const res = [];
  function dfs(n) { if (!n) return; dfs(n.left); res.push(n.val); dfs(n.right); }
  dfs(root);
  return res;
}

// isValidBST
test("isValidBST: valid 3-node BST", () => {
  assert.strictEqual(isValidBST(new TreeNode(2, new TreeNode(1), new TreeNode(3))), true);
});
test("isValidBST: invalid — right subtree < root", () => {
  const t = new TreeNode(5, new TreeNode(1), new TreeNode(4, new TreeNode(3), new TreeNode(6)));
  assert.strictEqual(isValidBST(t), false);
});
test("isValidBST: null is valid", () => {
  assert.strictEqual(isValidBST(null), true);
});
test("isValidBST: single node is valid", () => {
  assert.strictEqual(isValidBST(new TreeNode(1)), true);
});
test("isValidBST: equal values are invalid", () => {
  assert.strictEqual(isValidBST(new TreeNode(2, new TreeNode(2))), false);
});
test("isValidBST: catches ancestor violation", () => {
  // 6 is in right subtree of 10 but 6 < 10
  const t = new TreeNode(10, new TreeNode(5), new TreeNode(15, new TreeNode(6), new TreeNode(20)));
  assert.strictEqual(isValidBST(t), false);
});
test("isValidBST: large valid BST", () => {
  const t = new TreeNode(6,
    new TreeNode(2, new TreeNode(0), new TreeNode(4, new TreeNode(3), new TreeNode(5))),
    new TreeNode(8, new TreeNode(7), new TreeNode(9))
  );
  assert.strictEqual(isValidBST(t), true);
});

// kthSmallest
const bst3 = new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4));
test("kthSmallest: 1st smallest", () => {
  assert.strictEqual(kthSmallest(bst3, 1), 1);
});
test("kthSmallest: 2nd smallest", () => {
  assert.strictEqual(kthSmallest(bst3, 2), 2);
});
test("kthSmallest: 3rd smallest (root)", () => {
  assert.strictEqual(kthSmallest(bst3, 3), 3);
});
test("kthSmallest: last element", () => {
  assert.strictEqual(kthSmallest(bst3, 4), 4);
});
test("kthSmallest: single node", () => {
  assert.strictEqual(kthSmallest(new TreeNode(42), 1), 42);
});

// buildBSTFromPreorder
test("buildBSTFromPreorder: produces valid BST", () => {
  const root = buildBSTFromPreorder([8, 5, 1, 7, 10, 12]);
  assert.strictEqual(isValidBST(root), true);
});
test("buildBSTFromPreorder: in-order matches sorted input", () => {
  const preorder = [8, 5, 1, 7, 10, 12];
  const root = buildBSTFromPreorder(preorder);
  assert.deepStrictEqual(inorderValues(root), [...preorder].sort((a, b) => a - b));
});
test("buildBSTFromPreorder: single element", () => {
  const root = buildBSTFromPreorder([5]);
  assert.strictEqual(root.val, 5);
  assert.strictEqual(root.left, null);
  assert.strictEqual(root.right, null);
});
test("buildBSTFromPreorder: ascending order (right-skewed)", () => {
  const root = buildBSTFromPreorder([1, 2, 3, 4]);
  assert.deepStrictEqual(inorderValues(root), [1, 2, 3, 4]);
});
test("buildBSTFromPreorder: descending order (left-skewed)", () => {
  const root = buildBSTFromPreorder([4, 3, 2, 1]);
  assert.deepStrictEqual(inorderValues(root), [1, 2, 3, 4]);
});
test("buildBSTFromPreorder: root is correct", () => {
  const root = buildBSTFromPreorder([8, 5, 1, 7, 10, 12]);
  assert.strictEqual(root.val, 8);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
