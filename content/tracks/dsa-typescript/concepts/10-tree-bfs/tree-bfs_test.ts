import { levelOrder, rightSideView, zigzagLevelOrder } from "./stub";
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

function assertDeepEqual<T>(actual: T, expected: T): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

// Helper: builds a { val, left, right } tree from a level-order array with
// nulls for missing children, e.g. [3, 9, 20, null, null, 15, 7].
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

// ── levelOrder ──
test("levelOrder: classic three-level tree", () => {
  const root = buildTree([3, 9, 20, null, null, 15, 7]);
  assertDeepEqual(levelOrder(root), [[3], [9, 20], [15, 7]]);
});
test("levelOrder: empty tree returns []", () => {
  assertDeepEqual(levelOrder(null), []);
});
test("levelOrder: single node", () => {
  assertDeepEqual(levelOrder(buildTree([1])), [[1]]);
});
test("levelOrder: left-skewed chain — one node per level", () => {
  const root = buildTree([1, 2, null, 3]);
  assertDeepEqual(levelOrder(root), [[1], [2], [3]]);
});
test("levelOrder: right-skewed chain", () => {
  const root = buildTree([1, null, 2, null, 3]);
  assertDeepEqual(levelOrder(root), [[1], [2], [3]]);
});
test("levelOrder: negative values", () => {
  const root = buildTree([-1, -2, -3]);
  assertDeepEqual(levelOrder(root), [[-1], [-2, -3]]);
});
test("levelOrder: full three-level tree keeps left-to-right order", () => {
  const root = buildTree([1, 2, 3, 4, 5, 6, 7]);
  assertDeepEqual(levelOrder(root), [[1], [2, 3], [4, 5, 6, 7]]);
});

// ── rightSideView ──
test("rightSideView: classic example", () => {
  const root = buildTree([1, 2, 3, null, 5, null, 4]);
  assertDeepEqual(rightSideView(root), [1, 3, 4]);
});
test("rightSideView: empty tree returns []", () => {
  assertDeepEqual(rightSideView(null), []);
});
test("rightSideView: single node", () => {
  assertDeepEqual(rightSideView(buildTree([7])), [7]);
});
test("rightSideView: right-only chain", () => {
  assertDeepEqual(rightSideView(buildTree([1, null, 3])), [1, 3]);
});
test("rightSideView: left-only chain is fully visible", () => {
  assertDeepEqual(rightSideView(buildTree([1, 2, null, 3])), [1, 2, 3]);
});
test("rightSideView: left-subtree node visible when right side ends", () => {
  // 1 → (2, 3), 2.left = 4, 3 is a leaf: depth 2 only contains 4
  const root = buildTree([1, 2, 3, 4]);
  assertDeepEqual(rightSideView(root), [1, 3, 4]);
});

// ── zigzagLevelOrder ──
test("zigzagLevelOrder: classic three-level tree", () => {
  const root = buildTree([3, 9, 20, null, null, 15, 7]);
  assertDeepEqual(zigzagLevelOrder(root), [[3], [20, 9], [15, 7]]);
});
test("zigzagLevelOrder: empty tree returns []", () => {
  assertDeepEqual(zigzagLevelOrder(null), []);
});
test("zigzagLevelOrder: single node", () => {
  assertDeepEqual(zigzagLevelOrder(buildTree([1])), [[1]]);
});
test("zigzagLevelOrder: full three-level tree", () => {
  const root = buildTree([1, 2, 3, 4, 5, 6, 7]);
  assertDeepEqual(zigzagLevelOrder(root), [[1], [3, 2], [4, 5, 6, 7]]);
});
test("zigzagLevelOrder: four levels flip direction twice", () => {
  const root = buildTree([1, 2, 3, 4, null, null, 5, 6, null, null, 7]);
  assertDeepEqual(zigzagLevelOrder(root), [[1], [3, 2], [4, 5], [7, 6]]);
});
test("zigzagLevelOrder: single-node levels are unaffected by direction", () => {
  const root = buildTree([1, 2, null, 3]);
  assertDeepEqual(zigzagLevelOrder(root), [[1], [2], [3]]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
