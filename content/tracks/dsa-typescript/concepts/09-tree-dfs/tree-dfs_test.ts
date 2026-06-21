import { TreeNode, maxDepth, hasPathSum, lowestCommonAncestor } from "./stub";

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

// Build a tree from level-order array (null = missing node)
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

// --- maxDepth ---

test("maxDepth: depth-3 tree", () => {
  assertEqual(maxDepth(buildTree([3, 9, 20, null, null, 15, 7])), 3);
});

test("maxDepth: null tree", () => {
  assertEqual(maxDepth(null), 0);
});

test("maxDepth: single node", () => {
  assertEqual(maxDepth(new TreeNode(1)), 1);
});

test("maxDepth: left-skewed", () => {
  const t = new TreeNode(1, new TreeNode(2, new TreeNode(3)));
  assertEqual(maxDepth(t), 3);
});

test("maxDepth: balanced depth 2", () => {
  assertEqual(maxDepth(buildTree([1, 2, 3])), 2);
});

// --- hasPathSum ---

test("hasPathSum: path exists (5→4→11→2=22)", () => {
  const tree = buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);
  assertEqual(hasPathSum(tree, 22), true);
});

test("hasPathSum: path does not exist", () => {
  assertEqual(hasPathSum(buildTree([1, 2, 3]), 5), false);
});

test("hasPathSum: null tree", () => {
  assertEqual(hasPathSum(null, 0), false);
});

test("hasPathSum: single node match", () => {
  assertEqual(hasPathSum(new TreeNode(7), 7), true);
});

test("hasPathSum: single node no match", () => {
  assertEqual(hasPathSum(new TreeNode(7), 5), false);
});

test("hasPathSum: target matches internal node but not leaf path", () => {
  // Tree: root=1, left=2, right=3; path to left leaf = 3, path to right leaf = 4
  const t = buildTree([1, 2, 3]);
  // 1 itself is not a leaf; target=1 should not match
  assertEqual(hasPathSum(t, 1), false);
});

// --- lowestCommonAncestor ---

test("lowestCommonAncestor: p and q in different subtrees", () => {
  // Tree:    3
  //        /   \
  //       5     1
  //      / \   / \
  //     6   2 0   8
  //        / \
  //       7   4
  const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
  // Build node references manually to use with LCA
  const p = root!.left!;      // node 5
  const q = root!.right!;     // node 1
  const lca = lowestCommonAncestor(root, p, q);
  assertEqual(lca?.val ?? null, 3);
});

test("lowestCommonAncestor: one is ancestor of the other", () => {
  const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
  const p = root!.left!;              // node 5
  const q = root!.left!.right!.right!; // node 4
  const lca = lowestCommonAncestor(root, p, q);
  assertEqual(lca?.val ?? null, 5);
});

test("lowestCommonAncestor: p and q are both root's children", () => {
  const root = new TreeNode(1, new TreeNode(2), new TreeNode(3));
  const p = root.left!;
  const q = root.right!;
  assertEqual(lowestCommonAncestor(root, p, q)?.val, 1);
});

test("lowestCommonAncestor: single-node tree, p === q === root", () => {
  const root = new TreeNode(1);
  assertEqual(lowestCommonAncestor(root, root, root)?.val, 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
