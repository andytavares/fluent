const assert = require("assert");
const { searchInsert, findPeakElement, searchRotated, searchRange } = require("./stub");

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

// Helper: assert idx is a valid peak of nums (edges border -Infinity)
function assertIsPeak(nums, idx) {
  assert.ok(Number.isInteger(idx) && idx >= 0 && idx < nums.length,
    `index ${idx} out of range for length ${nums.length}`);
  const leftOk = idx === 0 || nums[idx] > nums[idx - 1];
  const rightOk = idx === nums.length - 1 || nums[idx] > nums[idx + 1];
  assert.ok(leftOk && rightOk, `index ${idx} (value ${nums[idx]}) is not a peak`);
}

// ── searchInsert ──
test("searchInsert: target present", () => {
  assert.strictEqual(searchInsert([1, 3, 5, 6], 5), 2);
});
test("searchInsert: target between elements", () => {
  assert.strictEqual(searchInsert([1, 3, 5, 6], 2), 1);
});
test("searchInsert: target larger than everything", () => {
  assert.strictEqual(searchInsert([1, 3, 5, 6], 7), 4);
});
test("searchInsert: target smaller than everything", () => {
  assert.strictEqual(searchInsert([1, 3, 5, 6], 0), 0);
});
test("searchInsert: empty array", () => {
  assert.strictEqual(searchInsert([], 4), 0);
});
test("searchInsert: single element, found", () => {
  assert.strictEqual(searchInsert([5], 5), 0);
});
test("searchInsert: single element, insert after", () => {
  assert.strictEqual(searchInsert([5], 9), 1);
});
test("searchInsert: negative values", () => {
  assert.strictEqual(searchInsert([-10, -3, 0, 4], -3), 1);
  assert.strictEqual(searchInsert([-10, -3, 0, 4], -2), 2);
});

// ── findPeakElement ──
test("findPeakElement: single interior peak", () => {
  assert.strictEqual(findPeakElement([1, 2, 3, 1]), 2);
});
test("findPeakElement: two peaks, either accepted", () => {
  const nums = [1, 2, 1, 3, 5, 6, 4];
  assertIsPeak(nums, findPeakElement(nums));
});
test("findPeakElement: single element", () => {
  assert.strictEqual(findPeakElement([1]), 0);
});
test("findPeakElement: two elements, descending", () => {
  assert.strictEqual(findPeakElement([2, 1]), 0);
});
test("findPeakElement: two elements, ascending", () => {
  assert.strictEqual(findPeakElement([1, 2]), 1);
});
test("findPeakElement: strictly ascending — peak at the end", () => {
  assert.strictEqual(findPeakElement([1, 2, 3, 4, 5]), 4);
});
test("findPeakElement: strictly descending — peak at the start", () => {
  assert.strictEqual(findPeakElement([5, 4, 3, 2, 1]), 0);
});
test("findPeakElement: negative values", () => {
  const nums = [-5, -1, -3, -7];
  assertIsPeak(nums, findPeakElement(nums));
});

// ── searchRotated ──
test("searchRotated: target in the rotated tail", () => {
  assert.strictEqual(searchRotated([4, 5, 6, 7, 0, 1, 2], 0), 4);
});
test("searchRotated: target absent", () => {
  assert.strictEqual(searchRotated([4, 5, 6, 7, 0, 1, 2], 3), -1);
});
test("searchRotated: target in the sorted head", () => {
  assert.strictEqual(searchRotated([4, 5, 6, 7, 0, 1, 2], 5), 1);
});
test("searchRotated: not rotated at all", () => {
  assert.strictEqual(searchRotated([1, 2, 3], 2), 1);
});
test("searchRotated: single element, found", () => {
  assert.strictEqual(searchRotated([1], 1), 0);
});
test("searchRotated: single element, absent", () => {
  assert.strictEqual(searchRotated([1], 0), -1);
});
test("searchRotated: two elements rotated", () => {
  assert.strictEqual(searchRotated([3, 1], 1), 1);
  assert.strictEqual(searchRotated([3, 1], 3), 0);
});
test("searchRotated: target at the pivot (minimum)", () => {
  assert.strictEqual(searchRotated([5, 6, 7, 1, 2, 3], 1), 3);
});
test("searchRotated: target at both ends", () => {
  assert.strictEqual(searchRotated([6, 7, 8, 1, 2, 3], 6), 0);
  assert.strictEqual(searchRotated([6, 7, 8, 1, 2, 3], 3), 5);
});

// ── searchRange ──
test("searchRange: run in the middle", () => {
  assert.deepStrictEqual(searchRange([5, 7, 7, 8, 8, 10], 8), [3, 4]);
});
test("searchRange: target absent inside value range", () => {
  assert.deepStrictEqual(searchRange([5, 7, 7, 8, 8, 10], 6), [-1, -1]);
});
test("searchRange: empty array", () => {
  assert.deepStrictEqual(searchRange([], 0), [-1, -1]);
});
test("searchRange: whole array equals target", () => {
  assert.deepStrictEqual(searchRange([2, 2, 2], 2), [0, 2]);
});
test("searchRange: single occurrence", () => {
  assert.deepStrictEqual(searchRange([1, 4], 4), [1, 1]);
});
test("searchRange: target smaller than everything", () => {
  assert.deepStrictEqual(searchRange([3, 4, 5], 1), [-1, -1]);
});
test("searchRange: target larger than everything", () => {
  assert.deepStrictEqual(searchRange([3, 4, 5], 9), [-1, -1]);
});
test("searchRange: run at the start", () => {
  assert.deepStrictEqual(searchRange([1, 1, 2, 3], 1), [0, 1]);
});
test("searchRange: run at the end", () => {
  assert.deepStrictEqual(searchRange([1, 2, 3, 3, 3], 3), [2, 4]);
});
test("searchRange: negative values", () => {
  assert.deepStrictEqual(searchRange([-4, -4, -2, 0], -4), [0, 1]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
