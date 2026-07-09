const assert = require("assert");
const { getMinimumDifference, kthSmallest, isValidBST } = require("./stub");

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
// nulls for missing children, e.g. [4, 2, 6, 1, 3].
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

// ── getMinimumDifference ──
test("getMinimumDifference: classic example", () => {
  assert.strictEqual(getMinimumDifference(buildTree([4, 2, 6, 1, 3])), 1);
});
test("getMinimumDifference: closest pair deep on the right", () => {
  assert.strictEqual(getMinimumDifference(buildTree([1, 0, 48, null, null, 12, 49])), 1);
});
test("getMinimumDifference: exactly two nodes", () => {
  assert.strictEqual(getMinimumDifference(buildTree([1, null, 5])), 4);
});
test("getMinimumDifference: negative values", () => {
  assert.strictEqual(getMinimumDifference(buildTree([0, -3])), 3);
});
test("getMinimumDifference: evenly spaced values", () => {
  assert.strictEqual(getMinimumDifference(buildTree([10, 5, 15])), 5);
});
test("getMinimumDifference: closest pair crosses subtrees", () => {
  // in-order 1, 3, 4, 5, 8 — the pair (4, 5) is neither parent-child nor siblings
  assert.strictEqual(getMinimumDifference(buildTree([5, 3, 8, 1, 4])), 1);
});

// ── kthSmallest ──
test("kthSmallest: k = 1 returns the minimum", () => {
  assert.strictEqual(kthSmallest(buildTree([3, 1, 4, null, 2]), 1), 1);
});
test("kthSmallest: middle k", () => {
  assert.strictEqual(kthSmallest(buildTree([5, 3, 6, 2, 4, null, null, 1]), 3), 3);
});
test("kthSmallest: k = node count returns the maximum", () => {
  assert.strictEqual(kthSmallest(buildTree([4, 2, 6, 1, 3]), 5), 6);
});
test("kthSmallest: single-node tree", () => {
  assert.strictEqual(kthSmallest(buildTree([7]), 1), 7);
});
test("kthSmallest: left-skewed chain", () => {
  assert.strictEqual(kthSmallest(buildTree([3, 2, null, 1]), 2), 2);
});
test("kthSmallest: right-skewed chain", () => {
  assert.strictEqual(kthSmallest(buildTree([1, null, 2, null, 3]), 3), 3);
});

// ── isValidBST ──
test("isValidBST: simple valid tree", () => {
  assert.strictEqual(isValidBST(buildTree([2, 1, 3])), true);
});
test("isValidBST: classic invalid tree", () => {
  assert.strictEqual(isValidBST(buildTree([5, 1, 4, null, null, 3, 6])), false);
});
test("isValidBST: violation against an ancestor, not the parent", () => {
  // every parent-child pair is locally fine, but 3 sits in 5's right subtree
  assert.strictEqual(isValidBST(buildTree([5, 4, 6, null, null, 3, 7])), false);
});
test("isValidBST: value in right subtree smaller than the root", () => {
  assert.strictEqual(isValidBST(buildTree([10, 5, 15, null, null, 6, 20])), false);
});
test("isValidBST: empty tree is valid", () => {
  assert.strictEqual(isValidBST(null), true);
});
test("isValidBST: single node is valid", () => {
  assert.strictEqual(isValidBST(buildTree([1])), true);
});
test("isValidBST: duplicate child is invalid", () => {
  assert.strictEqual(isValidBST(buildTree([2, 2])), false);
});
test("isValidBST: larger valid tree", () => {
  assert.strictEqual(isValidBST(buildTree([8, 4, 12, 2, 6, 10, 14])), true);
});
test("isValidBST: single node at the 32-bit integer maximum", () => {
  assert.strictEqual(isValidBST(buildTree([2147483647])), true);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
