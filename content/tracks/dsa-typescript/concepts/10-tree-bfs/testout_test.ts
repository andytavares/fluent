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

// Helper: perfect binary tree of the given depth, values = heap indexes 1..2^depth - 1.
function buildPerfect(depth: number, index = 1): TreeNode | null {
  if (depth === 0) return null;
  return {
    val: index,
    left: buildPerfect(depth - 1, index * 2),
    right: buildPerfect(depth - 1, index * 2 + 1),
  };
}

// Helper: chain of `length` nodes alternating left/right children, values 0..length-1.
function buildChain(length: number): TreeNode | null {
  if (length === 0) return null;
  const root: TreeNode = { val: 0, left: null, right: null };
  let node = root;
  for (let v = 1; v < length; v++) {
    const child: TreeNode = { val: v, left: null, right: null };
    if (v % 2 === 0) node.left = child;
    else node.right = child;
    node = child;
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
test("levelOrder: perfect depth-10 tree — every level complete and ordered", () => {
  const result = levelOrder(buildPerfect(10));
  if (result.length !== 10) throw new Error(`expected 10 levels, got ${result.length}`);
  for (let d = 0; d < 10; d++) {
    const expected = Array.from({ length: 2 ** d }, (_, i) => 2 ** d + i);
    assertDeepEqual(result[d], expected);
  }
});
test("levelOrder: 1500-node zigzag chain — one value per level", () => {
  const result = levelOrder(buildChain(1500));
  if (result.length !== 1500) throw new Error(`expected 1500 levels, got ${result.length}`);
  assertDeepEqual(result[0], [0]);
  assertDeepEqual(result[1499], [1499]);
  assertDeepEqual(result[777], [777]);
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
  const root = buildTree([1, 2, 3, 4]);
  assertDeepEqual(rightSideView(root), [1, 3, 4]);
});
test("rightSideView: view switches between subtrees on the way down", () => {
  // depth 3 exists only under the *left* child's right branch
  const root = buildTree([1, 2, 3, null, 4, null, null, 5]);
  assertDeepEqual(rightSideView(root), [1, 3, 4, 5]);
});
test("rightSideView: perfect depth-10 tree — rightmost heap indexes", () => {
  const expected = Array.from({ length: 10 }, (_, d) => 2 ** (d + 1) - 1);
  assertDeepEqual(rightSideView(buildPerfect(10)), expected);
});
test("rightSideView: 1500-node chain shows every value", () => {
  const expected = Array.from({ length: 1500 }, (_, i) => i);
  assertDeepEqual(rightSideView(buildChain(1500)), expected);
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
test("zigzagLevelOrder: perfect depth-10 tree — odd levels reversed", () => {
  const result = zigzagLevelOrder(buildPerfect(10));
  if (result.length !== 10) throw new Error(`expected 10 levels, got ${result.length}`);
  for (let d = 0; d < 10; d++) {
    const level = Array.from({ length: 2 ** d }, (_, i) => 2 ** d + i);
    if (d % 2 === 1) level.reverse();
    assertDeepEqual(result[d], level);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
