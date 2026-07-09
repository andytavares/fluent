import { getMinimumDifference, kthSmallest, isValidBST } from "./stub";
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

// Helper: builds a { val, left, right } tree from a level-order array with
// nulls for missing children, e.g. [4, 2, 6, 1, 3].
function buildTree(values: (number | null)[]): TreeNode | null {
  if (values.length === 0 || values[0] === null) return null;
  const root: TreeNode = { val: values[0], left: null, right: null };
  const queue: TreeNode[] = [root];
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
  assertEqual(getMinimumDifference(buildTree([4, 2, 6, 1, 3])!), 1);
});
test("getMinimumDifference: closest pair deep on the right", () => {
  assertEqual(getMinimumDifference(buildTree([1, 0, 48, null, null, 12, 49])!), 1);
});
test("getMinimumDifference: exactly two nodes", () => {
  assertEqual(getMinimumDifference(buildTree([1, null, 5])!), 4);
});
test("getMinimumDifference: negative values", () => {
  assertEqual(getMinimumDifference(buildTree([0, -3])!), 3);
});
test("getMinimumDifference: evenly spaced values", () => {
  assertEqual(getMinimumDifference(buildTree([10, 5, 15])!), 5);
});
test("getMinimumDifference: closest pair crosses subtrees", () => {
  // in-order 1, 3, 4, 5, 8 — the pair (4, 5) is neither parent-child nor siblings
  assertEqual(getMinimumDifference(buildTree([5, 3, 8, 1, 4])!), 1);
});

// ── kthSmallest ──
test("kthSmallest: k = 1 returns the minimum", () => {
  assertEqual(kthSmallest(buildTree([3, 1, 4, null, 2])!, 1), 1);
});
test("kthSmallest: middle k", () => {
  assertEqual(kthSmallest(buildTree([5, 3, 6, 2, 4, null, null, 1])!, 3), 3);
});
test("kthSmallest: k = node count returns the maximum", () => {
  assertEqual(kthSmallest(buildTree([4, 2, 6, 1, 3])!, 5), 6);
});
test("kthSmallest: single-node tree", () => {
  assertEqual(kthSmallest(buildTree([7])!, 1), 7);
});
test("kthSmallest: left-skewed chain", () => {
  assertEqual(kthSmallest(buildTree([3, 2, null, 1])!, 2), 2);
});
test("kthSmallest: right-skewed chain", () => {
  assertEqual(kthSmallest(buildTree([1, null, 2, null, 3])!, 3), 3);
});

// ── isValidBST ──
test("isValidBST: simple valid tree", () => {
  assertEqual(isValidBST(buildTree([2, 1, 3])), true);
});
test("isValidBST: classic invalid tree", () => {
  assertEqual(isValidBST(buildTree([5, 1, 4, null, null, 3, 6])), false);
});
test("isValidBST: violation against an ancestor, not the parent", () => {
  assertEqual(isValidBST(buildTree([5, 4, 6, null, null, 3, 7])), false);
});
test("isValidBST: value in right subtree smaller than the root", () => {
  assertEqual(isValidBST(buildTree([10, 5, 15, null, null, 6, 20])), false);
});
test("isValidBST: empty tree is valid", () => {
  assertEqual(isValidBST(null), true);
});
test("isValidBST: single node is valid", () => {
  assertEqual(isValidBST(buildTree([1])), true);
});
test("isValidBST: duplicate child is invalid", () => {
  assertEqual(isValidBST(buildTree([2, 2])), false);
});
test("isValidBST: larger valid tree", () => {
  assertEqual(isValidBST(buildTree([8, 4, 12, 2, 6, 10, 14])), true);
});
test("isValidBST: single node at the 32-bit integer maximum", () => {
  assertEqual(isValidBST(buildTree([2147483647])), true);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
