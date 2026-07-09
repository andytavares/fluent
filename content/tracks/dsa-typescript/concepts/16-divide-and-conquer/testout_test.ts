import { sortedArrayToBST, sortList, mergeKLists } from "./stub";
import type { TreeNode, ListNode } from "./stub";

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

function assertEqual<T>(actual: T, expected: T, msg?: string): void {
  if (actual !== expected) throw new Error(msg ?? `expected ${expected}, got ${actual}`);
}

function assertDeepEqual<T>(actual: T, expected: T, msg?: string): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(msg ?? `expected ${b}, got ${a}`);
}

function assertTrue(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

// ── helpers: linked list { val, next } ──
function fromArray(values: number[]): ListNode | null {
  let head: ListNode | null = null;
  let tail: ListNode | null = null;
  for (const v of values) {
    const node: ListNode = { val: v, next: null };
    if (head === null) head = node;
    else tail!.next = node;
    tail = node;
  }
  return head;
}
function toArray(head: ListNode | null): number[] {
  const out: number[] = [];
  for (let n = head; n !== null; n = n.next) out.push(n.val);
  return out;
}
function collectNodes(head: ListNode | null): Set<ListNode> {
  const set = new Set<ListNode>();
  for (let n = head; n !== null; n = n.next) set.add(n);
  return set;
}
function assertReusesNodes(head: ListNode | null, allowed: Set<ListNode>): void {
  let count = 0;
  for (let n = head; n !== null; n = n.next) {
    assertTrue(allowed.has(n), `node with val ${n.val} is not an original input node`);
    count++;
  }
  assertEqual(count, allowed.size, "result must contain every input node exactly once");
}

// ── helpers: binary tree { val, left, right } ──
function inorder(root: TreeNode | null, out: number[] = []): number[] {
  if (root === null) return out;
  inorder(root.left, out);
  out.push(root.val);
  inorder(root.right, out);
  return out;
}
function balancedHeight(root: TreeNode | null): number {
  if (root === null) return 0;
  const l = balancedHeight(root.left);
  if (l === -1) return -1;
  const r = balancedHeight(root.right);
  if (r === -1) return -1;
  if (Math.abs(l - r) > 1) return -1;
  return Math.max(l, r) + 1;
}
function assertBalancedBST(root: TreeNode | null, sortedValues: number[]): void {
  assertDeepEqual(inorder(root), sortedValues, "inorder traversal must equal the sorted input");
  assertTrue(balancedHeight(root) !== -1, "tree must be height-balanced at every node");
}

// Deterministic shuffle (Park–Miller LCG Fisher–Yates)
function shuffled(values: number[]): number[] {
  const arr = [...values];
  let x = 42;
  for (let i = arr.length - 1; i > 0; i--) {
    x = (x * 48271) % 2147483647;
    const j = x % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── sortedArrayToBST ──
test("sortedArrayToBST: empty array returns null", () => {
  assertEqual(sortedArrayToBST([]), null);
});
test("sortedArrayToBST: single element is a leaf", () => {
  const root = sortedArrayToBST([7])!;
  assertEqual(root.val, 7);
  assertEqual(root.left, null);
  assertEqual(root.right, null);
});
test("sortedArrayToBST: two elements", () => {
  assertBalancedBST(sortedArrayToBST([1, 2]), [1, 2]);
});
test("sortedArrayToBST: three elements", () => {
  assertBalancedBST(sortedArrayToBST([1, 2, 3]), [1, 2, 3]);
});
test("sortedArrayToBST: classic [-10,-3,0,5,9]", () => {
  assertBalancedBST(sortedArrayToBST([-10, -3, 0, 5, 9]), [-10, -3, 0, 5, 9]);
});
test("sortedArrayToBST: 15 elements build a balanced tree", () => {
  const nums = Array.from({ length: 15 }, (_, i) => i + 1);
  assertBalancedBST(sortedArrayToBST(nums), nums);
});
test("sortedArrayToBST: 100 elements — unbalanced insertion would fail here", () => {
  const nums = Array.from({ length: 100 }, (_, i) => i * 3 - 50);
  const root = sortedArrayToBST(nums);
  assertBalancedBST(root, nums);
  assertTrue(balancedHeight(root) <= 9, "height must be logarithmic");
});
test("sortedArrayToBST: 1023 elements stay balanced and logarithmic", () => {
  const nums = Array.from({ length: 1023 }, (_, i) => i);
  const root = sortedArrayToBST(nums);
  assertBalancedBST(root, nums);
  const h = balancedHeight(root);
  assertTrue(h >= 10 && h <= 14, `height ${h} out of balanced range`);
});

// ── sortList ──
test("sortList: null returns null", () => {
  assertEqual(sortList(null), null);
});
test("sortList: single node returned as-is", () => {
  const head = fromArray([5])!;
  const sorted = sortList(head);
  assertEqual(sorted, head);
  assertDeepEqual(toArray(sorted), [5]);
});
test("sortList: two nodes out of order", () => {
  assertDeepEqual(toArray(sortList(fromArray([2, 1]))), [1, 2]);
});
test("sortList: classic 4→2→1→3", () => {
  assertDeepEqual(toArray(sortList(fromArray([4, 2, 1, 3]))), [1, 2, 3, 4]);
});
test("sortList: negatives and duplicates", () => {
  assertDeepEqual(
    toArray(sortList(fromArray([-1, 5, 3, 4, 0, 3]))),
    [-1, 0, 3, 3, 4, 5],
  );
});
test("sortList: already sorted", () => {
  assertDeepEqual(toArray(sortList(fromArray([1, 2, 3, 4, 5]))), [1, 2, 3, 4, 5]);
});
test("sortList: reverse sorted", () => {
  assertDeepEqual(toArray(sortList(fromArray([5, 4, 3, 2, 1]))), [1, 2, 3, 4, 5]);
});
test("sortList: relinks the original nodes (no new allocation)", () => {
  const head = fromArray([3, 1, 2]);
  const original = collectNodes(head);
  const sorted = sortList(head);
  assertDeepEqual(toArray(sorted), [1, 2, 3]);
  assertReusesNodes(sorted, original);
});
test("sortList: 2000 shuffled values — O(n log n) or bust", () => {
  const expected = Array.from({ length: 2000 }, (_, i) => i);
  const head = fromArray(shuffled(expected));
  const original = collectNodes(head);
  const sorted = sortList(head);
  assertDeepEqual(toArray(sorted), expected);
  assertReusesNodes(sorted, original);
});
test("sortList: all values equal", () => {
  assertDeepEqual(toArray(sortList(fromArray([9, 9, 9, 9]))), [9, 9, 9, 9]);
});

// ── mergeKLists ──
test("mergeKLists: empty array returns null", () => {
  assertEqual(mergeKLists([]), null);
});
test("mergeKLists: [null] returns null", () => {
  assertEqual(mergeKLists([null]), null);
});
test("mergeKLists: all entries null returns null", () => {
  assertEqual(mergeKLists([null, null, null]), null);
});
test("mergeKLists: classic three lists", () => {
  const lists = [fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])];
  assertDeepEqual(toArray(mergeKLists(lists)), [1, 1, 2, 3, 4, 4, 5, 6]);
});
test("mergeKLists: single list passes through", () => {
  const lists = [fromArray([1, 2, 3])];
  assertDeepEqual(toArray(mergeKLists(lists)), [1, 2, 3]);
});
test("mergeKLists: nulls mixed with real lists", () => {
  const lists = [null, fromArray([2, 4]), null, fromArray([1, 3])];
  assertDeepEqual(toArray(mergeKLists(lists)), [1, 2, 3, 4]);
});
test("mergeKLists: k single-node lists", () => {
  const lists = [5, 1, 4, 2, 3].map((v) => fromArray([v]));
  assertDeepEqual(toArray(mergeKLists(lists)), [1, 2, 3, 4, 5]);
});
test("mergeKLists: duplicates across lists", () => {
  const lists = [fromArray([1, 1, 2]), fromArray([1, 2, 2])];
  assertDeepEqual(toArray(mergeKLists(lists)), [1, 1, 1, 2, 2, 2]);
});
test("mergeKLists: reuses the original nodes (no new allocation)", () => {
  const lists = [fromArray([1, 4]), fromArray([2, 3])];
  const original = new Set([...collectNodes(lists[0]), ...collectNodes(lists[1])]);
  const merged = mergeKLists(lists);
  assertDeepEqual(toArray(merged), [1, 2, 3, 4]);
  assertReusesNodes(merged, original);
});
test("mergeKLists: 64 interleaved lists of 50 nodes each", () => {
  const k = 64, len = 50;
  const lists: (ListNode | null)[] = [];
  const allNodes = new Set<ListNode>();
  for (let i = 0; i < k; i++) {
    // list i holds i, i+k, i+2k, ... — merged result is 0..k*len-1
    const head = fromArray(Array.from({ length: len }, (_, j) => i + j * k));
    for (const n of collectNodes(head)) allNodes.add(n);
    lists.push(head);
  }
  const merged = mergeKLists(lists);
  assertDeepEqual(toArray(merged), Array.from({ length: k * len }, (_, i) => i));
  assertReusesNodes(merged, allNodes);
});
test("mergeKLists: lists of wildly different lengths", () => {
  const lists = [
    fromArray([100]),
    fromArray(Array.from({ length: 99 }, (_, i) => i)),
    null,
    fromArray([50, 150]),
  ];
  const expected = [...Array.from({ length: 99 }, (_, i) => i), 50, 100, 150]
    .sort((a, b) => a - b);
  assertDeepEqual(toArray(mergeKLists(lists)), expected);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
