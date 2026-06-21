import { TreeNode, isValidBST, kthSmallest, buildBSTFromPreorder } from "./stub";

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
  if (actual !== expected) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Inorder traversal helper for verifying buildBSTFromPreorder
function inorder(root: TreeNode | null): number[] {
  if (root === null) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}

// --- isValidBST ---

test("isValidBST: valid BST", () => {
  const bst = new TreeNode(2, new TreeNode(1), new TreeNode(3));
  assertEqual(isValidBST(bst), true);
});

test("isValidBST: right child smaller than root", () => {
  const t = new TreeNode(5, new TreeNode(1), new TreeNode(4, new TreeNode(3), new TreeNode(6)));
  assertEqual(isValidBST(t), false);
});

test("isValidBST: null tree", () => {
  assertEqual(isValidBST(null), true);
});

test("isValidBST: single node", () => {
  assertEqual(isValidBST(new TreeNode(1)), true);
});

test("isValidBST: node violates ancestor bound (classic trap)", () => {
  // root=10, left=5, left.right=15 — 15 is in left subtree but > root 10
  const t = new TreeNode(10, new TreeNode(5, null, new TreeNode(15)), new TreeNode(20));
  assertEqual(isValidBST(t), false);
});

test("isValidBST: larger valid BST", () => {
  const bst = new TreeNode(5,
    new TreeNode(3, new TreeNode(2), new TreeNode(4)),
    new TreeNode(6)
  );
  assertEqual(isValidBST(bst), true);
});

test("isValidBST: equal values (not a strict BST)", () => {
  const t = new TreeNode(2, new TreeNode(2), null);
  assertEqual(isValidBST(t), false);
});

// --- kthSmallest ---

test("kthSmallest: k=1 is minimum", () => {
  const bst = new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4));
  assertEqual(kthSmallest(bst, 1), 1);
});

test("kthSmallest: k=2", () => {
  const bst = new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4));
  assertEqual(kthSmallest(bst, 2), 2);
});

test("kthSmallest: k=3 (root)", () => {
  const bst = new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4));
  assertEqual(kthSmallest(bst, 3), 3);
});

test("kthSmallest: k=n (maximum)", () => {
  const bst = new TreeNode(5, new TreeNode(3), new TreeNode(6));
  assertEqual(kthSmallest(bst, 3), 6);
});

test("kthSmallest: single node", () => {
  assertEqual(kthSmallest(new TreeNode(42), 1), 42);
});

// --- buildBSTFromPreorder ---

test("buildBSTFromPreorder: inorder of result is sorted", () => {
  const preorder = [8, 5, 1, 7, 10, 12];
  const root = buildBSTFromPreorder(preorder);
  // Inorder of a valid BST must be sorted
  const result = inorder(root);
  const expected = [...preorder].sort((a, b) => a - b);
  assertEqual(JSON.stringify(result), JSON.stringify(expected));
});

test("buildBSTFromPreorder: root is preorder[0]", () => {
  const root = buildBSTFromPreorder([8, 5, 1, 7, 10, 12]);
  assertEqual(root?.val ?? null, 8);
});

test("buildBSTFromPreorder: single element", () => {
  const root = buildBSTFromPreorder([5]);
  assertEqual(root?.val ?? null, 5);
  assertEqual(root?.left ?? null, null);
  assertEqual(root?.right ?? null, null);
});

test("buildBSTFromPreorder: result is a valid BST", () => {
  const root = buildBSTFromPreorder([8, 5, 1, 7, 10, 12]);
  assertEqual(isValidBST(root), true);
});

test("buildBSTFromPreorder: right-skewed preorder", () => {
  // Ascending preorder → right-skewed BST
  const root = buildBSTFromPreorder([1, 2, 3]);
  assertEqual(inorder(root).join(","), "1,2,3");
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
