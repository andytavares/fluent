import { TreeNode, levelOrder, rightSideView, zigzagLevelOrder } from "./stub";

let passed = 0;
let failed = 0;

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
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

function buildTree(vals: (number | null)[]): TreeNode | null {
  if (vals.length === 0 || vals[0] === null) return null;
  const root = new TreeNode(vals[0]);
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < vals.length) {
    const node = queue.shift()!;
    if (i < vals.length && vals[i] !== null) {
      node.left = new TreeNode(vals[i] as number);
      queue.push(node.left);
    }
    i++;
    if (i < vals.length && vals[i] !== null) {
      node.right = new TreeNode(vals[i] as number);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

// --- levelOrder ---

test("levelOrder: 3-level tree", () => {
  assertEqual(levelOrder(buildTree([3, 9, 20, null, null, 15, 7])), [[3], [9, 20], [15, 7]]);
});

test("levelOrder: single node", () => {
  assertEqual(levelOrder(new TreeNode(1)), [[1]]);
});

test("levelOrder: null", () => {
  assertEqual(levelOrder(null), []);
});

test("levelOrder: two levels", () => {
  assertEqual(levelOrder(buildTree([1, 2, 3])), [[1], [2, 3]]);
});

test("levelOrder: left-skewed", () => {
  const t = new TreeNode(1, new TreeNode(2, new TreeNode(3)));
  assertEqual(levelOrder(t), [[1], [2], [3]]);
});

// --- rightSideView ---

test("rightSideView: standard case", () => {
  assertEqual(rightSideView(buildTree([1, 2, 3, null, 5, null, 4])), [1, 3, 4]);
});

test("rightSideView: single node", () => {
  assertEqual(rightSideView(new TreeNode(1)), [1]);
});

test("rightSideView: null", () => {
  assertEqual(rightSideView(null), []);
});

test("rightSideView: left-only subtree visible at deepest level", () => {
  const t = new TreeNode(1, new TreeNode(2, new TreeNode(3)));
  assertEqual(rightSideView(t), [1, 2, 3]);
});

test("rightSideView: right child extends deeper", () => {
  assertEqual(rightSideView(buildTree([1, 2, 3, null, 5])), [1, 3, 5]);
});

// --- zigzagLevelOrder ---

test("zigzagLevelOrder: 3-level tree", () => {
  assertEqual(
    zigzagLevelOrder(buildTree([3, 9, 20, null, null, 15, 7])),
    [[3], [20, 9], [15, 7]]
  );
});

test("zigzagLevelOrder: single node", () => {
  assertEqual(zigzagLevelOrder(new TreeNode(1)), [[1]]);
});

test("zigzagLevelOrder: null", () => {
  assertEqual(zigzagLevelOrder(null), []);
});

test("zigzagLevelOrder: two levels", () => {
  // Level 0 (L→R): [1]; Level 1 (R→L): [3, 2]
  assertEqual(zigzagLevelOrder(buildTree([1, 2, 3])), [[1], [3, 2]]);
});

test("zigzagLevelOrder: three levels full tree", () => {
  // Level 0 (L→R): [1]; Level 1 (R→L): [3,2]; Level 2 (L→R): [4,5,6,7]
  const t = buildTree([1, 2, 3, 4, 5, 6, 7]);
  assertEqual(zigzagLevelOrder(t), [[1], [3, 2], [4, 5, 6, 7]]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
