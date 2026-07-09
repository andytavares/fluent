const assert = require("assert");
const { sortedArrayToBST, sortList, mergeKLists } = require("./stub");

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

// ── helpers: linked list { val, next } ──
function fromArray(values) {
  let head = null, tail = null;
  for (const v of values) {
    const node = { val: v, next: null };
    if (head === null) head = node;
    else tail.next = node;
    tail = node;
  }
  return head;
}
function toArray(head) {
  const out = [];
  for (let n = head; n !== null; n = n.next) out.push(n.val);
  return out;
}
function collectNodes(head) {
  const set = new Set();
  for (let n = head; n !== null; n = n.next) set.add(n);
  return set;
}
// Asserts every node of `head` is one of `allowed` (relinked, not rebuilt)
function assertReusesNodes(head, allowed) {
  let count = 0;
  for (let n = head; n !== null; n = n.next) {
    assert.ok(allowed.has(n), `node with val ${n.val} is not an original input node`);
    count++;
  }
  assert.strictEqual(count, allowed.size, "result must contain every input node exactly once");
}

// ── helpers: binary tree { val, left, right } ──
function inorder(root, out = []) {
  if (root === null) return out;
  inorder(root.left, out);
  out.push(root.val);
  inorder(root.right, out);
  return out;
}
// Height if balanced at every node, -1 otherwise
function balancedHeight(root) {
  if (root === null) return 0;
  const l = balancedHeight(root.left);
  if (l === -1) return -1;
  const r = balancedHeight(root.right);
  if (r === -1) return -1;
  if (Math.abs(l - r) > 1) return -1;
  return Math.max(l, r) + 1;
}
// A tree's inorder equals the sorted input ⇔ it is a BST with those values
function assertBalancedBST(root, sortedValues) {
  assert.deepStrictEqual(inorder(root), sortedValues, "inorder traversal must equal the sorted input");
  assert.notStrictEqual(balancedHeight(root), -1, "tree must be height-balanced at every node");
}

// ── sortedArrayToBST ──
test("sortedArrayToBST: empty array returns null", () => {
  assert.strictEqual(sortedArrayToBST([]), null);
});
test("sortedArrayToBST: single element is a leaf", () => {
  const root = sortedArrayToBST([7]);
  assert.strictEqual(root.val, 7);
  assert.strictEqual(root.left, null);
  assert.strictEqual(root.right, null);
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
  // Middle-rooted build gives height 7 (2^7 - 1 = 127 ≥ 100); any
  // node-balanced tree with 100 nodes is at most height 9 (AVL bound) —
  // a degenerate insertion chain would be 100.
  assert.ok(balancedHeight(root) <= 9, "height must be logarithmic");
});

// ── sortList ──
test("sortList: null returns null", () => {
  assert.strictEqual(sortList(null), null);
});
test("sortList: single node returned as-is", () => {
  const head = fromArray([5]);
  const sorted = sortList(head);
  assert.strictEqual(sorted, head);
  assert.deepStrictEqual(toArray(sorted), [5]);
});
test("sortList: two nodes out of order", () => {
  assert.deepStrictEqual(toArray(sortList(fromArray([2, 1]))), [1, 2]);
});
test("sortList: classic 4→2→1→3", () => {
  assert.deepStrictEqual(toArray(sortList(fromArray([4, 2, 1, 3]))), [1, 2, 3, 4]);
});
test("sortList: negatives and duplicates", () => {
  assert.deepStrictEqual(
    toArray(sortList(fromArray([-1, 5, 3, 4, 0, 3]))),
    [-1, 0, 3, 3, 4, 5],
  );
});
test("sortList: already sorted", () => {
  assert.deepStrictEqual(toArray(sortList(fromArray([1, 2, 3, 4, 5]))), [1, 2, 3, 4, 5]);
});
test("sortList: reverse sorted", () => {
  assert.deepStrictEqual(toArray(sortList(fromArray([5, 4, 3, 2, 1]))), [1, 2, 3, 4, 5]);
});
test("sortList: relinks the original nodes (no new allocation)", () => {
  const head = fromArray([3, 1, 2]);
  const original = collectNodes(head);
  const sorted = sortList(head);
  assert.deepStrictEqual(toArray(sorted), [1, 2, 3]);
  assertReusesNodes(sorted, original);
});

// ── mergeKLists ──
test("mergeKLists: empty array returns null", () => {
  assert.strictEqual(mergeKLists([]), null);
});
test("mergeKLists: [null] returns null", () => {
  assert.strictEqual(mergeKLists([null]), null);
});
test("mergeKLists: all entries null returns null", () => {
  assert.strictEqual(mergeKLists([null, null, null]), null);
});
test("mergeKLists: classic three lists", () => {
  const lists = [fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])];
  assert.deepStrictEqual(toArray(mergeKLists(lists)), [1, 1, 2, 3, 4, 4, 5, 6]);
});
test("mergeKLists: single list passes through", () => {
  const lists = [fromArray([1, 2, 3])];
  assert.deepStrictEqual(toArray(mergeKLists(lists)), [1, 2, 3]);
});
test("mergeKLists: nulls mixed with real lists", () => {
  const lists = [null, fromArray([2, 4]), null, fromArray([1, 3])];
  assert.deepStrictEqual(toArray(mergeKLists(lists)), [1, 2, 3, 4]);
});
test("mergeKLists: k single-node lists", () => {
  const lists = [5, 1, 4, 2, 3].map((v) => fromArray([v]));
  assert.deepStrictEqual(toArray(mergeKLists(lists)), [1, 2, 3, 4, 5]);
});
test("mergeKLists: duplicates across lists", () => {
  const lists = [fromArray([1, 1, 2]), fromArray([1, 2, 2])];
  assert.deepStrictEqual(toArray(mergeKLists(lists)), [1, 1, 1, 2, 2, 2]);
});
test("mergeKLists: reuses the original nodes (no new allocation)", () => {
  const lists = [fromArray([1, 4]), fromArray([2, 3])];
  const original = new Set([...collectNodes(lists[0]), ...collectNodes(lists[1])]);
  const merged = mergeKLists(lists);
  assert.deepStrictEqual(toArray(merged), [1, 2, 3, 4]);
  assertReusesNodes(merged, original);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
