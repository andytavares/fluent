const assert = require("assert");
const { binarySearch, searchInsertPosition, findMinInRotatedArray } = require("./stub");

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

// binarySearch
test("binarySearch: found in middle", () => {
  assert.strictEqual(binarySearch([1, 3, 5, 7, 9], 5), 2);
});
test("binarySearch: found at start", () => {
  assert.strictEqual(binarySearch([1, 3, 5, 7, 9], 1), 0);
});
test("binarySearch: found at end", () => {
  assert.strictEqual(binarySearch([1, 3, 5, 7, 9], 9), 4);
});
test("binarySearch: not found between elements", () => {
  assert.strictEqual(binarySearch([1, 3, 5, 7, 9], 4), -1);
});
test("binarySearch: not found less than all", () => {
  assert.strictEqual(binarySearch([1, 3, 5, 7, 9], 0), -1);
});
test("binarySearch: not found greater than all", () => {
  assert.strictEqual(binarySearch([1, 3, 5, 7, 9], 10), -1);
});
test("binarySearch: empty array", () => {
  assert.strictEqual(binarySearch([], 1), -1);
});
test("binarySearch: single element found", () => {
  assert.strictEqual(binarySearch([42], 42), 0);
});
test("binarySearch: single element not found", () => {
  assert.strictEqual(binarySearch([42], 1), -1);
});

// searchInsertPosition
test("searchInsertPosition: exact match", () => {
  assert.strictEqual(searchInsertPosition([1, 3, 5, 6], 5), 2);
});
test("searchInsertPosition: insert in middle", () => {
  assert.strictEqual(searchInsertPosition([1, 3, 5, 6], 2), 1);
});
test("searchInsertPosition: insert at end", () => {
  assert.strictEqual(searchInsertPosition([1, 3, 5, 6], 7), 4);
});
test("searchInsertPosition: insert at start", () => {
  assert.strictEqual(searchInsertPosition([1, 3, 5, 6], 0), 0);
});
test("searchInsertPosition: single element array insert before", () => {
  assert.strictEqual(searchInsertPosition([3], 1), 0);
});
test("searchInsertPosition: single element array insert after", () => {
  assert.strictEqual(searchInsertPosition([3], 5), 1);
});

// findMinInRotatedArray
test("findMinInRotatedArray: rotated 2 times", () => {
  assert.strictEqual(findMinInRotatedArray([3, 4, 5, 1, 2]), 1);
});
test("findMinInRotatedArray: rotated 4 times", () => {
  assert.strictEqual(findMinInRotatedArray([4, 5, 6, 7, 0, 1, 2]), 0);
});
test("findMinInRotatedArray: single element", () => {
  assert.strictEqual(findMinInRotatedArray([1]), 1);
});
test("findMinInRotatedArray: two elements min at end", () => {
  assert.strictEqual(findMinInRotatedArray([2, 1]), 1);
});
test("findMinInRotatedArray: two elements min at start (not rotated)", () => {
  assert.strictEqual(findMinInRotatedArray([1, 2]), 1);
});
test("findMinInRotatedArray: min is last element", () => {
  assert.strictEqual(findMinInRotatedArray([2, 3, 4, 5, 1]), 1);
});
test("findMinInRotatedArray: already sorted (rotated n times)", () => {
  assert.strictEqual(findMinInRotatedArray([1, 2, 3, 4, 5]), 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
