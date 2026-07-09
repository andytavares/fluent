const assert = require("assert");
const { maxDepth, isSameTree, invertTree, hasPathSum } = require("./stub");

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

// Helpers: nodes are plain { val, left, right } objects, null children.
// buildTree takes a level-order array where null marks an absent child
// (children of absent nodes are omitted).
function buildTree(values) {
  if (values.length === 0 || values[0] === null) return null;
  const root = { val: values[0], left: null, right: null };
  const queue = [root];
  let i = 1;
  let q = 0;
  while (q < queue.length && i < values.length) {
    const node = queue[q++];
    if (i < values.length) {
      const v = values[i++];
      if (v !== null) {
        node.left = { val: v, left: null, right: null };
        queue.push(node.left);
      }
    }
    if (i < values.length) {
      const v = values[i++];
      if (v !== null) {
        node.right = { val: v, left: null, right: null };
        queue.push(node.right);
      }
    }
  }
  return root;
}

// Level-order serialization with trailing nulls trimmed — the inverse of buildTree.
function treeToArray(root) {
  if (root === null) return [];
  const out = [];
  const queue = [root];
  let q = 0;
  while (q < queue.length) {
    const node = queue[q++];
    if (node === null) {
      out.push(null);
      continue;
    }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length > 0 && out[out.length - 1] === null) out.pop();
  return out;
}

/** Left-skewed chain of n nodes valued 1..n. */
function leftChain(n) {
  let root = null;
  for (let v = n; v >= 1; v--) root = { val: v, left: root, right: null };
  return root;
}

/** Perfect binary tree of the given depth; every node valued `val`. */
function perfectTree(depth, val) {
  if (depth === 0) return null;
  return { val, left: perfectTree(depth - 1, val), right: perfectTree(depth - 1, val) };
}

// ── maxDepth ──
test("maxDepth: classic tree", () => {
  assert.strictEqual(maxDepth(buildTree([3, 9, 20, null, null, 15, 7])), 3);
});
test("maxDepth: empty tree", () => {
  assert.strictEqual(maxDepth(null), 0);
});
test("maxDepth: single node", () => {
  assert.strictEqual(maxDepth(buildTree([1])), 1);
});
test("maxDepth: right-skewed chain", () => {
  assert.strictEqual(maxDepth(buildTree([1, null, 2, null, 3])), 3);
});
test("maxDepth: left-skewed chain", () => {
  assert.strictEqual(maxDepth(buildTree([1, 2, null, 3, null, 4])), 4);
});
test("maxDepth: deeper branch on one side", () => {
  assert.strictEqual(maxDepth(buildTree([1, 2, 2, 3, null, null, 3, 4])), 4);
});
test("maxDepth: 2000-node skewed chain", () => {
  assert.strictEqual(maxDepth(leftChain(2000)), 2000);
});
test("maxDepth: perfect tree of depth 12", () => {
  assert.strictEqual(maxDepth(perfectTree(12, 7)), 12);
});

// ── isSameTree ──
test("isSameTree: identical trees", () => {
  assert.strictEqual(isSameTree(buildTree([1, 2, 3]), buildTree([1, 2, 3])), true);
});
test("isSameTree: mirrored shape, same values", () => {
  assert.strictEqual(isSameTree(buildTree([1, 2]), buildTree([1, null, 2])), false);
});
test("isSameTree: same shape, swapped values", () => {
  assert.strictEqual(isSameTree(buildTree([1, 2, 1]), buildTree([1, 1, 2])), false);
});
test("isSameTree: both empty", () => {
  assert.strictEqual(isSameTree(null, null), true);
});
test("isSameTree: one empty", () => {
  assert.strictEqual(isSameTree(buildTree([1]), null), false);
  assert.strictEqual(isSameTree(null, buildTree([1])), false);
});
test("isSameTree: equal multi-level trees", () => {
  const a = buildTree([5, 4, 8, 11, null, 13, 4]);
  const b = buildTree([5, 4, 8, 11, null, 13, 4]);
  assert.strictEqual(isSameTree(a, b), true);
});
test("isSameTree: differ at a deep leaf", () => {
  const a = buildTree([5, 4, 8, 11, null, 13, 4]);
  const b = buildTree([5, 4, 8, 11, null, 13, 99]);
  assert.strictEqual(isSameTree(a, b), false);
});
test("isSameTree: equal perfect trees of depth 12", () => {
  assert.strictEqual(isSameTree(perfectTree(12, 3), perfectTree(12, 3)), true);
});
test("isSameTree: large trees differing at one deep leaf", () => {
  const a = perfectTree(12, 3);
  const b = perfectTree(12, 3);
  let node = b;
  while (node.right !== null) node = node.right; // deepest rightmost leaf
  node.val = 4;
  assert.strictEqual(isSameTree(a, b), false);
});
test("isSameTree: extra node deep in one tree", () => {
  const a = leftChain(500);
  const b = leftChain(501);
  assert.strictEqual(isSameTree(a, b), false);
});

// ── invertTree ──
test("invertTree: classic full tree", () => {
  const result = invertTree(buildTree([4, 2, 7, 1, 3, 6, 9]));
  assert.deepStrictEqual(treeToArray(result), [4, 7, 2, 9, 6, 3, 1]);
});
test("invertTree: empty tree", () => {
  assert.strictEqual(invertTree(null), null);
});
test("invertTree: single node", () => {
  assert.deepStrictEqual(treeToArray(invertTree(buildTree([1]))), [1]);
});
test("invertTree: three nodes", () => {
  assert.deepStrictEqual(treeToArray(invertTree(buildTree([2, 1, 3]))), [2, 3, 1]);
});
test("invertTree: lone left child moves right", () => {
  assert.deepStrictEqual(treeToArray(invertTree(buildTree([1, 2]))), [1, null, 2]);
});
test("invertTree: lone right child moves left", () => {
  assert.deepStrictEqual(treeToArray(invertTree(buildTree([1, null, 2]))), [1, 2]);
});
test("invertTree: mutates in place and returns the same root", () => {
  const root = buildTree([4, 2, 7]);
  const result = invertTree(root);
  assert.strictEqual(result, root); // same object, not a copy
  assert.deepStrictEqual(treeToArray(root), [4, 7, 2]);
});
test("invertTree: inverting twice restores the tree", () => {
  const original = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1];
  const root = buildTree(original);
  invertTree(invertTree(root));
  assert.deepStrictEqual(treeToArray(root), original);
});
test("invertTree: 1500-node skewed chain flips side", () => {
  const root = invertTree(leftChain(1500));
  let node = root, count = 0;
  while (node !== null) {
    assert.strictEqual(node.left, null); // every child now hangs right
    count++;
    node = node.right;
  }
  assert.strictEqual(count, 1500);
});

// ── hasPathSum ──
test("hasPathSum: classic tree, target 22", () => {
  const root = buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);
  assert.strictEqual(hasPathSum(root, 22), true);
});
test("hasPathSum: no path hits the target", () => {
  assert.strictEqual(hasPathSum(buildTree([1, 2, 3]), 5), false);
});
test("hasPathSum: empty tree, target 0", () => {
  assert.strictEqual(hasPathSum(null, 0), false);
});
test("hasPathSum: partial path does not count (1 is not a leaf)", () => {
  assert.strictEqual(hasPathSum(buildTree([1, 2]), 1), false);
});
test("hasPathSum: path through a one-child node", () => {
  assert.strictEqual(hasPathSum(buildTree([1, 2]), 3), true);
});
test("hasPathSum: single node equals target", () => {
  assert.strictEqual(hasPathSum(buildTree([1]), 1), true);
});
test("hasPathSum: single node misses target", () => {
  assert.strictEqual(hasPathSum(buildTree([1]), 0), false);
});
test("hasPathSum: negative values reach a negative target", () => {
  const root = buildTree([1, -2, -3, 1, 3, -2, null, -1]);
  assert.strictEqual(hasPathSum(root, -1), true); // 1 → -2 → 1 → -1
});
test("hasPathSum: all-negative chain", () => {
  assert.strictEqual(hasPathSum(buildTree([-2, null, -3]), -5), true);
});
test("hasPathSum: 2000-node chain, full-path sum", () => {
  const root = leftChain(2000); // values 1..2000 down the chain
  assert.strictEqual(hasPathSum(root, (2000 * 2001) / 2), true);
});
test("hasPathSum: 2000-node chain, prefix sum is not a path", () => {
  const root = leftChain(2000);
  assert.strictEqual(hasPathSum(root, 1), false); // stops mid-chain, not at the leaf
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
