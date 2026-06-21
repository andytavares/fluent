const assert = require("assert");
const { MinHeap, kLargestElements, mergeKSortedLists, ListNode, listFromArray, listToArray } = require("./stub");

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

// MinHeap
test("MinHeap: peek returns minimum after pushes", () => {
  const h = new MinHeap();
  h.push(3); h.push(1); h.push(4);
  assert.strictEqual(h.peek(), 1);
});
test("MinHeap: pop returns minimum and removes it", () => {
  const h = new MinHeap();
  h.push(3); h.push(1); h.push(4);
  assert.strictEqual(h.pop(), 1);
  assert.strictEqual(h.peek(), 3);
});
test("MinHeap: size tracks correctly", () => {
  const h = new MinHeap();
  assert.strictEqual(h.size(), 0);
  h.push(5); assert.strictEqual(h.size(), 1);
  h.pop();   assert.strictEqual(h.size(), 0);
});
test("MinHeap: pop all in sorted order", () => {
  const h = new MinHeap();
  [5, 2, 8, 1, 9, 3].forEach(v => h.push(v));
  const result = [];
  while (h.size()) result.push(h.pop());
  assert.deepStrictEqual(result, [1, 2, 3, 5, 8, 9]);
});
test("MinHeap: single element push and pop", () => {
  const h = new MinHeap();
  h.push(42);
  assert.strictEqual(h.pop(), 42);
  assert.strictEqual(h.size(), 0);
});
test("MinHeap: duplicate values", () => {
  const h = new MinHeap();
  h.push(2); h.push(2); h.push(2);
  assert.strictEqual(h.pop(), 2);
  assert.strictEqual(h.size(), 2);
});
test("MinHeap: negative values", () => {
  const h = new MinHeap();
  h.push(-1); h.push(-5); h.push(3);
  assert.strictEqual(h.pop(), -5);
  assert.strictEqual(h.peek(), -1);
});

// kLargestElements
test("kLargestElements: k=2", () => {
  const result = kLargestElements([3, 2, 1, 5, 6, 4], 2).sort((a, b) => a - b);
  assert.deepStrictEqual(result, [5, 6]);
});
test("kLargestElements: k=4 with duplicates", () => {
  const result = kLargestElements([3, 2, 3, 1, 2, 4, 5, 5, 6], 4).sort((a, b) => a - b);
  assert.deepStrictEqual(result, [4, 5, 5, 6]);
});
test("kLargestElements: k equals length", () => {
  const result = kLargestElements([3, 1, 2], 3).sort((a, b) => a - b);
  assert.deepStrictEqual(result, [1, 2, 3]);
});
test("kLargestElements: k=1", () => {
  assert.deepStrictEqual(kLargestElements([1], 1), [1]);
});
test("kLargestElements: negative numbers", () => {
  const result = kLargestElements([-5, -3, -1, -4, -2], 2).sort((a, b) => a - b);
  assert.deepStrictEqual(result, [-2, -1]);
});

// mergeKSortedLists
test("mergeKSortedLists: three lists", () => {
  const lists = [listFromArray([1, 4, 5]), listFromArray([1, 3, 4]), listFromArray([2, 6])];
  assert.deepStrictEqual(listToArray(mergeKSortedLists(lists)), [1, 1, 2, 3, 4, 4, 5, 6]);
});
test("mergeKSortedLists: empty lists array", () => {
  assert.strictEqual(mergeKSortedLists([]), null);
});
test("mergeKSortedLists: single list", () => {
  assert.deepStrictEqual(listToArray(mergeKSortedLists([listFromArray([1, 2, 3])])), [1, 2, 3]);
});
test("mergeKSortedLists: one empty list among others", () => {
  const lists = [listFromArray([1, 3]), null, listFromArray([2, 4])];
  assert.deepStrictEqual(listToArray(mergeKSortedLists(lists)), [1, 2, 3, 4]);
});
test("mergeKSortedLists: all single-element lists", () => {
  const lists = [listFromArray([3]), listFromArray([1]), listFromArray([2])];
  assert.deepStrictEqual(listToArray(mergeKSortedLists(lists)), [1, 2, 3]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
