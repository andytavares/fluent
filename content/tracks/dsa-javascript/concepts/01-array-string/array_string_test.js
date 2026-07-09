const assert = require("assert");
const { merge, removeDuplicates, majorityElement, rotate } = require("./stub");

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

// ── merge — always assert on the mutated nums1, never on the return value ──
test("merge: classic example mutates nums1 in place", () => {
  const nums1 = [1, 2, 3, 0, 0, 0];
  merge(nums1, 3, [2, 5, 6], 3);
  assert.deepStrictEqual(nums1, [1, 2, 2, 3, 5, 6]);
});
test("merge: n = 0 leaves nums1 unchanged", () => {
  const nums1 = [1];
  merge(nums1, 1, [], 0);
  assert.deepStrictEqual(nums1, [1]);
});
test("merge: m = 0 copies nums2 across", () => {
  const nums1 = [0];
  merge(nums1, 0, [2], 1);
  assert.deepStrictEqual(nums1, [2]);
});
test("merge: all of nums2 smaller than nums1", () => {
  const nums1 = [4, 5, 6, 0, 0, 0];
  merge(nums1, 3, [1, 2, 3], 3);
  assert.deepStrictEqual(nums1, [1, 2, 3, 4, 5, 6]);
});
test("merge: duplicates across both arrays", () => {
  const nums1 = [1, 1, 3, 0, 0, 0];
  merge(nums1, 3, [1, 3, 3], 3);
  assert.deepStrictEqual(nums1, [1, 1, 1, 3, 3, 3]);
});
test("merge: negative numbers", () => {
  const nums1 = [-5, 0, 2, 0, 0];
  merge(nums1, 3, [-10, 1], 2);
  assert.deepStrictEqual(nums1, [-10, -5, 0, 1, 2]);
});
test("merge: works even if the return value is discarded", () => {
  const nums1 = [2, 0];
  void merge(nums1, 1, [1], 1);
  assert.deepStrictEqual(nums1, [1, 2]);
});

// ── removeDuplicates — assert return k AND the mutated prefix ──
test("removeDuplicates: simple duplicates", () => {
  const nums = [1, 1, 2];
  const k = removeDuplicates(nums);
  assert.strictEqual(k, 2);
  assert.deepStrictEqual(nums.slice(0, k), [1, 2]);
});
test("removeDuplicates: longer example mutates prefix in place", () => {
  const nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
  const k = removeDuplicates(nums);
  assert.strictEqual(k, 5);
  assert.deepStrictEqual(nums.slice(0, k), [0, 1, 2, 3, 4]);
});
test("removeDuplicates: no duplicates", () => {
  const nums = [1, 2, 3];
  const k = removeDuplicates(nums);
  assert.strictEqual(k, 3);
  assert.deepStrictEqual(nums.slice(0, k), [1, 2, 3]);
});
test("removeDuplicates: all elements identical", () => {
  const nums = [7, 7, 7];
  const k = removeDuplicates(nums);
  assert.strictEqual(k, 1);
  assert.deepStrictEqual(nums.slice(0, k), [7]);
});
test("removeDuplicates: single element", () => {
  const nums = [5];
  const k = removeDuplicates(nums);
  assert.strictEqual(k, 1);
  assert.deepStrictEqual(nums.slice(0, k), [5]);
});
test("removeDuplicates: empty array returns 0", () => {
  assert.strictEqual(removeDuplicates([]), 0);
});
test("removeDuplicates: negative values", () => {
  const nums = [-3, -3, -1, 0, 0];
  const k = removeDuplicates(nums);
  assert.strictEqual(k, 3);
  assert.deepStrictEqual(nums.slice(0, k), [-3, -1, 0]);
});

// ── majorityElement ──
test("majorityElement: simple majority", () => {
  assert.strictEqual(majorityElement([3, 2, 3]), 3);
});
test("majorityElement: majority split across the array", () => {
  assert.strictEqual(majorityElement([2, 2, 1, 1, 1, 2, 2]), 2);
});
test("majorityElement: single element", () => {
  assert.strictEqual(majorityElement([5]), 5);
});
test("majorityElement: all elements identical", () => {
  assert.strictEqual(majorityElement([4, 4, 4, 4]), 4);
});
test("majorityElement: negative majority", () => {
  assert.strictEqual(majorityElement([-1, -1, 2, -1, 3]), -1);
});
test("majorityElement: majority concentrated at the end", () => {
  assert.strictEqual(majorityElement([1, 2, 9, 9, 9]), 9);
});

// ── rotate — always assert on the mutated array, never on the return value ──
test("rotate: classic example mutates in place", () => {
  const nums = [1, 2, 3, 4, 5, 6, 7];
  rotate(nums, 3);
  assert.deepStrictEqual(nums, [5, 6, 7, 1, 2, 3, 4]);
});
test("rotate: negatives", () => {
  const nums = [-1, -100, 3, 99];
  rotate(nums, 2);
  assert.deepStrictEqual(nums, [3, 99, -1, -100]);
});
test("rotate: k = 0 is a no-op", () => {
  const nums = [1, 2, 3];
  rotate(nums, 0);
  assert.deepStrictEqual(nums, [1, 2, 3]);
});
test("rotate: k equal to length is a no-op", () => {
  const nums = [1, 2, 3];
  rotate(nums, 3);
  assert.deepStrictEqual(nums, [1, 2, 3]);
});
test("rotate: k larger than length wraps", () => {
  const nums = [1, 2];
  rotate(nums, 5); // 5 % 2 === 1
  assert.deepStrictEqual(nums, [2, 1]);
});
test("rotate: single element", () => {
  const nums = [42];
  rotate(nums, 10);
  assert.deepStrictEqual(nums, [42]);
});
test("rotate: works even if the return value is discarded", () => {
  const nums = [1, 2, 3, 4];
  void rotate(nums, 1);
  assert.deepStrictEqual(nums, [4, 1, 2, 3]);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
