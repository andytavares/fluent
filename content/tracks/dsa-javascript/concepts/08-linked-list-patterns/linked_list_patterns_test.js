const assert = require("assert");
const { hasCycle, addTwoNumbers, mergeTwoLists, reverseBetween } = require("./stub");

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

// Helpers: nodes are plain { val, next } objects, next === null at the tail.
function arrayToList(arr) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  for (const v of arr) {
    tail.next = { val: v, next: null };
    tail = tail.next;
  }
  return dummy.next;
}

function listToArray(head, limit = 100000) {
  const out = [];
  let node = head;
  while (node !== null && out.length < limit) {
    out.push(node.val);
    node = node.next;
  }
  if (node !== null) throw new Error("list longer than limit — possible cycle");
  return out;
}

/** Returns the node at 0-based index i. */
function nodeAt(head, i) {
  let node = head;
  while (i-- > 0) node = node.next;
  return node;
}

// ── hasCycle ──
test("hasCycle: cycle back into the middle", () => {
  const head = arrayToList([3, 2, 0, -4]);
  nodeAt(head, 3).next = nodeAt(head, 1); // -4 → 2
  assert.strictEqual(hasCycle(head), true);
});
test("hasCycle: two-node cycle", () => {
  const head = arrayToList([1, 2]);
  nodeAt(head, 1).next = head;
  assert.strictEqual(hasCycle(head), true);
});
test("hasCycle: acyclic list", () => {
  assert.strictEqual(hasCycle(arrayToList([1, 2])), false);
});
test("hasCycle: empty list", () => {
  assert.strictEqual(hasCycle(null), false);
});
test("hasCycle: single node, no cycle", () => {
  assert.strictEqual(hasCycle(arrayToList([1])), false);
});
test("hasCycle: single node self-loop", () => {
  const node = { val: 1, next: null };
  node.next = node;
  assert.strictEqual(hasCycle(node), true);
});
test("hasCycle: repeated values without a cycle (identity, not value)", () => {
  assert.strictEqual(hasCycle(arrayToList([1, 1, 1])), false);
});
test("hasCycle: tail loops back to the head", () => {
  const head = arrayToList([5, 6, 7, 8]);
  nodeAt(head, 3).next = head;
  assert.strictEqual(hasCycle(head), true);
});

// ── addTwoNumbers ──
test("addTwoNumbers: 342 + 465 = 807", () => {
  const sum = addTwoNumbers(arrayToList([2, 4, 3]), arrayToList([5, 6, 4]));
  assert.deepStrictEqual(listToArray(sum), [7, 0, 8]);
});
test("addTwoNumbers: 0 + 0 = 0", () => {
  const sum = addTwoNumbers(arrayToList([0]), arrayToList([0]));
  assert.deepStrictEqual(listToArray(sum), [0]);
});
test("addTwoNumbers: final carry adds a digit (99 + 1)", () => {
  const sum = addTwoNumbers(arrayToList([9, 9]), arrayToList([1]));
  assert.deepStrictEqual(listToArray(sum), [0, 0, 1]);
});
test("addTwoNumbers: carry chain across many digits", () => {
  const sum = addTwoNumbers(
    arrayToList([9, 9, 9, 9, 9, 9, 9]),
    arrayToList([9, 9, 9, 9]),
  );
  assert.deepStrictEqual(listToArray(sum), [8, 9, 9, 9, 0, 0, 0, 1]);
});
test("addTwoNumbers: no carry at all", () => {
  const sum = addTwoNumbers(arrayToList([1, 2]), arrayToList([3, 4]));
  assert.deepStrictEqual(listToArray(sum), [4, 6]);
});
test("addTwoNumbers: single digits with carry (5 + 5)", () => {
  const sum = addTwoNumbers(arrayToList([5]), arrayToList([5]));
  assert.deepStrictEqual(listToArray(sum), [0, 1]);
});

// ── mergeTwoLists ──
test("mergeTwoLists: classic interleave", () => {
  const merged = mergeTwoLists(arrayToList([1, 2, 4]), arrayToList([1, 3, 4]));
  assert.deepStrictEqual(listToArray(merged), [1, 1, 2, 3, 4, 4]);
});
test("mergeTwoLists: both empty", () => {
  assert.strictEqual(mergeTwoLists(null, null), null);
});
test("mergeTwoLists: first empty", () => {
  assert.deepStrictEqual(listToArray(mergeTwoLists(null, arrayToList([0]))), [0]);
});
test("mergeTwoLists: second empty", () => {
  assert.deepStrictEqual(listToArray(mergeTwoLists(arrayToList([7]), null)), [7]);
});
test("mergeTwoLists: disjoint ranges", () => {
  const merged = mergeTwoLists(arrayToList([1, 2, 3]), arrayToList([4, 5, 6]));
  assert.deepStrictEqual(listToArray(merged), [1, 2, 3, 4, 5, 6]);
});
test("mergeTwoLists: negatives and duplicates", () => {
  const merged = mergeTwoLists(arrayToList([-3, 0, 0, 5]), arrayToList([-3, 2]));
  assert.deepStrictEqual(listToArray(merged), [-3, -3, 0, 0, 2, 5]);
});
test("mergeTwoLists: splices existing nodes, no new allocations", () => {
  const l1 = arrayToList([1, 3, 5]);
  const l2 = arrayToList([2, 4]);
  const inputNodes = new Set();
  for (let n = l1; n !== null; n = n.next) inputNodes.add(n);
  for (let n = l2; n !== null; n = n.next) inputNodes.add(n);
  const merged = mergeTwoLists(l1, l2);
  assert.deepStrictEqual(listToArray(merged), [1, 2, 3, 4, 5]);
  for (let n = merged; n !== null; n = n.next) {
    assert.ok(inputNodes.has(n), `node with val ${n.val} was not an input node`);
  }
});

// ── reverseBetween ──
test("reverseBetween: middle window", () => {
  const head = reverseBetween(arrayToList([1, 2, 3, 4, 5]), 2, 4);
  assert.deepStrictEqual(listToArray(head), [1, 4, 3, 2, 5]);
});
test("reverseBetween: single node, left === right", () => {
  const head = reverseBetween(arrayToList([5]), 1, 1);
  assert.deepStrictEqual(listToArray(head), [5]);
});
test("reverseBetween: whole list", () => {
  const head = reverseBetween(arrayToList([1, 2, 3]), 1, 3);
  assert.deepStrictEqual(listToArray(head), [3, 2, 1]);
});
test("reverseBetween: window starts at the head", () => {
  const head = reverseBetween(arrayToList([1, 2, 3, 4]), 1, 2);
  assert.deepStrictEqual(listToArray(head), [2, 1, 3, 4]);
});
test("reverseBetween: window ends at the tail", () => {
  const head = reverseBetween(arrayToList([1, 2, 3, 4]), 3, 4);
  assert.deepStrictEqual(listToArray(head), [1, 2, 4, 3]);
});
test("reverseBetween: left === right in the middle is a no-op", () => {
  const head = reverseBetween(arrayToList([1, 2, 3]), 2, 2);
  assert.deepStrictEqual(listToArray(head), [1, 2, 3]);
});
test("reverseBetween: two-node full reversal", () => {
  const head = reverseBetween(arrayToList([3, 5]), 1, 2);
  assert.deepStrictEqual(listToArray(head), [5, 3]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
