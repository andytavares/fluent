const assert = require("assert");
const { ListNode, listFromArray, listToArray, reverseList, hasCycle, mergeTwoSortedLists } = require("./stub");

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

// reverseList
test("reverseList: standard list", () => {
  assert.deepStrictEqual(listToArray(reverseList(listFromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);
});
test("reverseList: single node", () => {
  assert.deepStrictEqual(listToArray(reverseList(listFromArray([1]))), [1]);
});
test("reverseList: null input", () => {
  assert.strictEqual(reverseList(null), null);
});
test("reverseList: two nodes", () => {
  assert.deepStrictEqual(listToArray(reverseList(listFromArray([1, 2]))), [2, 1]);
});
test("reverseList: new head is old tail", () => {
  const newHead = reverseList(listFromArray([1, 2, 3]));
  assert.strictEqual(newHead.val, 3);
});

// hasCycle
test("hasCycle: no cycle", () => {
  assert.strictEqual(hasCycle(listFromArray([1, 2, 3, 4])), false);
});
test("hasCycle: null input", () => {
  assert.strictEqual(hasCycle(null), false);
});
test("hasCycle: single node no cycle", () => {
  assert.strictEqual(hasCycle(listFromArray([1])), false);
});
test("hasCycle: cycle back to head", () => {
  const n1 = new ListNode(1);
  const n2 = new ListNode(2);
  const n3 = new ListNode(3);
  n1.next = n2; n2.next = n3; n3.next = n1;
  assert.strictEqual(hasCycle(n1), true);
});
test("hasCycle: cycle to middle node", () => {
  const n1 = new ListNode(1);
  const n2 = new ListNode(2);
  const n3 = new ListNode(3);
  const n4 = new ListNode(4);
  n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2;
  assert.strictEqual(hasCycle(n1), true);
});

// mergeTwoSortedLists
test("mergeTwoSortedLists: standard merge", () => {
  assert.deepStrictEqual(
    listToArray(mergeTwoSortedLists(listFromArray([1, 2, 4]), listFromArray([1, 3, 4]))),
    [1, 1, 2, 3, 4, 4]
  );
});
test("mergeTwoSortedLists: both empty", () => {
  assert.strictEqual(mergeTwoSortedLists(null, null), null);
});
test("mergeTwoSortedLists: first empty", () => {
  assert.deepStrictEqual(listToArray(mergeTwoSortedLists(null, listFromArray([1, 3]))), [1, 3]);
});
test("mergeTwoSortedLists: second empty", () => {
  assert.deepStrictEqual(listToArray(mergeTwoSortedLists(listFromArray([2, 4]), null)), [2, 4]);
});
test("mergeTwoSortedLists: equal elements", () => {
  assert.deepStrictEqual(
    listToArray(mergeTwoSortedLists(listFromArray([1, 1]), listFromArray([1, 1]))),
    [1, 1, 1, 1]
  );
});
test("mergeTwoSortedLists: single elements", () => {
  assert.deepStrictEqual(
    listToArray(mergeTwoSortedLists(listFromArray([5]), listFromArray([2]))),
    [2, 5]
  );
});
test("mergeTwoSortedLists: disjoint ranges", () => {
  assert.deepStrictEqual(
    listToArray(mergeTwoSortedLists(listFromArray([1, 2, 3]), listFromArray([4, 5, 6]))),
    [1, 2, 3, 4, 5, 6]
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
