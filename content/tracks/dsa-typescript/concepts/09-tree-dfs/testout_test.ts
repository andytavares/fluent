import { maxDepth, isSameTree, invertTree, hasPathSum } from "./stub";
import type { TreeNode } from "./stub";

let passed = 0, failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL: ${name} — ${msg}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T): void {
  if (actual !== expected) throw new Error(`expected ${expected}, got ${actual}`);
}

function assertDeepEqual<T>(actual: T, expected: T): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

function buildTree(values: (number | null)[]): TreeNode | null {
  if (values.length === 0 || values[0] === null) return null;
  const root: TreeNode = { val: values[0], left: null, right: null };
  const queue: TreeNode[] = [root];
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

function treeToArray(root: TreeNode | null): (number | null)[] {
  if (root === null) return [];
  const out: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];
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
function leftChain(n: number): TreeNode | null {
  let root: TreeNode | null = null;
  for (let v = n; v >= 1; v--) root = { val: v, left: root, right: null };
  return root;
}

/** Perfect binary tree of the given depth; every node valued `val`. */
function perfectTree(depth: number, val: number): TreeNode | null {
  if (depth === 0) return null;
  return { val, left: perfectTree(depth - 1, val), right: perfectTree(depth - 1, val) };
}

// ── maxDepth ──
test("maxDepth: classic tree", () => {
  assertEqual(maxDepth(buildTree([3, 9, 20, null, null, 15, 7])), 3);
});
test("maxDepth: empty tree", () => {
  assertEqual(maxDepth(null), 0);
});
test("maxDepth: single node", () => {
  assertEqual(maxDepth(buildTree([1])), 1);
});
test("maxDepth: right-skewed chain", () => {
  assertEqual(maxDepth(buildTree([1, null, 2, null, 3])), 3);
});
test("maxDepth: left-skewed chain", () => {
  assertEqual(maxDepth(buildTree([1, 2, null, 3, null, 4])), 4);
});
test("maxDepth: deeper branch on one side", () => {
  assertEqual(maxDepth(buildTree([1, 2, 2, 3, null, null, 3, 4])), 4);
});
test("maxDepth: 2000-node skewed chain", () => {
  assertEqual(maxDepth(leftChain(2000)), 2000);
});
test("maxDepth: perfect tree of depth 12", () => {
  assertEqual(maxDepth(perfectTree(12, 7)), 12);
});

// ── isSameTree ──
test("isSameTree: identical trees", () => {
  assertEqual(isSameTree(buildTree([1, 2, 3]), buildTree([1, 2, 3])), true);
});
test("isSameTree: mirrored shape, same values", () => {
  assertEqual(isSameTree(buildTree([1, 2]), buildTree([1, null, 2])), false);
});
test("isSameTree: same shape, swapped values", () => {
  assertEqual(isSameTree(buildTree([1, 2, 1]), buildTree([1, 1, 2])), false);
});
test("isSameTree: both empty", () => {
  assertEqual(isSameTree(null, null), true);
});
test("isSameTree: one empty", () => {
  assertEqual(isSameTree(buildTree([1]), null), false);
  assertEqual(isSameTree(null, buildTree([1])), false);
});
test("isSameTree: equal multi-level trees", () => {
  const a = buildTree([5, 4, 8, 11, null, 13, 4]);
  const b = buildTree([5, 4, 8, 11, null, 13, 4]);
  assertEqual(isSameTree(a, b), true);
});
test("isSameTree: differ at a deep leaf", () => {
  const a = buildTree([5, 4, 8, 11, null, 13, 4]);
  const b = buildTree([5, 4, 8, 11, null, 13, 99]);
  assertEqual(isSameTree(a, b), false);
});
test("isSameTree: equal perfect trees of depth 12", () => {
  assertEqual(isSameTree(perfectTree(12, 3), perfectTree(12, 3)), true);
});
test("isSameTree: large trees differing at one deep leaf", () => {
  const a = perfectTree(12, 3);
  const b = perfectTree(12, 3);
  let node = b;
  while (node !== null && node.right !== null) node = node.right; // deepest rightmost leaf
  if (node !== null) node.val = 4;
  assertEqual(isSameTree(a, b), false);
});
test("isSameTree: extra node deep in one tree", () => {
  const a = leftChain(500);
  const b = leftChain(501);
  assertEqual(isSameTree(a, b), false);
});

// ── invertTree ──
test("invertTree: classic full tree", () => {
  const result = invertTree(buildTree([4, 2, 7, 1, 3, 6, 9]));
  assertDeepEqual(treeToArray(result), [4, 7, 2, 9, 6, 3, 1]);
});
test("invertTree: empty tree", () => {
  assertEqual(invertTree(null), null);
});
test("invertTree: single node", () => {
  assertDeepEqual(treeToArray(invertTree(buildTree([1]))), [1]);
});
test("invertTree: three nodes", () => {
  assertDeepEqual(treeToArray(invertTree(buildTree([2, 1, 3]))), [2, 3, 1]);
});
test("invertTree: lone left child moves right", () => {
  assertDeepEqual(treeToArray(invertTree(buildTree([1, 2]))), [1, null, 2]);
});
test("invertTree: lone right child moves left", () => {
  assertDeepEqual(treeToArray(invertTree(buildTree([1, null, 2]))), [1, 2]);
});
test("invertTree: mutates in place and returns the same root", () => {
  const root = buildTree([4, 2, 7]);
  const result = invertTree(root);
  assertEqual(result, root); // same object, not a copy
  assertDeepEqual(treeToArray(root), [4, 7, 2]);
});
test("invertTree: inverting twice restores the tree", () => {
  const original: (number | null)[] = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1];
  const root = buildTree(original);
  invertTree(invertTree(root));
  assertDeepEqual(treeToArray(root), original);
});
test("invertTree: 1500-node skewed chain flips side", () => {
  let root = invertTree(leftChain(1500));
  let node = root, count = 0;
  while (node !== null) {
    assertEqual(node.left, null); // every child now hangs right
    count++;
    node = node.right;
  }
  assertEqual(count, 1500);
});

// ── hasPathSum ──
test("hasPathSum: classic tree, target 22", () => {
  const root = buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);
  assertEqual(hasPathSum(root, 22), true);
});
test("hasPathSum: no path hits the target", () => {
  assertEqual(hasPathSum(buildTree([1, 2, 3]), 5), false);
});
test("hasPathSum: empty tree, target 0", () => {
  assertEqual(hasPathSum(null, 0), false);
});
test("hasPathSum: partial path does not count (1 is not a leaf)", () => {
  assertEqual(hasPathSum(buildTree([1, 2]), 1), false);
});
test("hasPathSum: path through a one-child node", () => {
  assertEqual(hasPathSum(buildTree([1, 2]), 3), true);
});
test("hasPathSum: single node equals target", () => {
  assertEqual(hasPathSum(buildTree([1]), 1), true);
});
test("hasPathSum: single node misses target", () => {
  assertEqual(hasPathSum(buildTree([1]), 0), false);
});
test("hasPathSum: negative values reach a negative target", () => {
  const root = buildTree([1, -2, -3, 1, 3, -2, null, -1]);
  assertEqual(hasPathSum(root, -1), true); // 1 → -2 → 1 → -1
});
test("hasPathSum: all-negative chain", () => {
  assertEqual(hasPathSum(buildTree([-2, null, -3]), -5), true);
});
test("hasPathSum: 2000-node chain, full-path sum", () => {
  const root = leftChain(2000); // values 1..2000 down the chain
  assertEqual(hasPathSum(root, (2000 * 2001) / 2), true);
});
test("hasPathSum: 2000-node chain, prefix sum is not a path", () => {
  const root = leftChain(2000);
  assertEqual(hasPathSum(root, 1), false); // stops mid-chain, not at the leaf
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
