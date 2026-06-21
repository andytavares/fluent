const assert = require("assert");
const { buildPrefixSum, rangeSum, subarraySumEqualsK } = require("./stub");

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

// buildPrefixSum
test("buildPrefixSum: basic array", () => {
  assert.deepStrictEqual(buildPrefixSum([1, 2, 3, 4]), [0, 1, 3, 6, 10]);
});
test("buildPrefixSum: empty array", () => {
  assert.deepStrictEqual(buildPrefixSum([]), [0]);
});
test("buildPrefixSum: single element", () => {
  assert.deepStrictEqual(buildPrefixSum([5]), [0, 5]);
});
test("buildPrefixSum: negative numbers", () => {
  assert.deepStrictEqual(buildPrefixSum([-1, -2, 3]), [0, -1, -3, 0]);
});
test("buildPrefixSum: all zeros", () => {
  assert.deepStrictEqual(buildPrefixSum([0, 0, 0]), [0, 0, 0, 0]);
});

// rangeSum
test("rangeSum: middle range", () => {
  const p = buildPrefixSum([1, 2, 3, 4]);
  assert.strictEqual(rangeSum(p, 1, 3), 9);
});
test("rangeSum: full array", () => {
  const p = buildPrefixSum([1, 2, 3, 4]);
  assert.strictEqual(rangeSum(p, 0, 3), 10);
});
test("rangeSum: single element first", () => {
  const p = buildPrefixSum([1, 2, 3, 4]);
  assert.strictEqual(rangeSum(p, 0, 0), 1);
});
test("rangeSum: single element last", () => {
  const p = buildPrefixSum([1, 2, 3, 4]);
  assert.strictEqual(rangeSum(p, 3, 3), 4);
});
test("rangeSum: negative values in range", () => {
  const p = buildPrefixSum([-1, -2, 3, 4]);
  assert.strictEqual(rangeSum(p, 0, 1), -3);
});

// subarraySumEqualsK
test("subarraySumEqualsK: [1,1,1] k=2", () => {
  assert.strictEqual(subarraySumEqualsK([1, 1, 1], 2), 2);
});
test("subarraySumEqualsK: [1,2,3] k=3", () => {
  assert.strictEqual(subarraySumEqualsK([1, 2, 3], 3), 2);
});
test("subarraySumEqualsK: negatives k=0", () => {
  assert.strictEqual(subarraySumEqualsK([1, -1, 1, -1], 0), 4);
});
test("subarraySumEqualsK: entire array is one match", () => {
  assert.strictEqual(subarraySumEqualsK([1, 2, 3], 6), 1);
});
test("subarraySumEqualsK: no match", () => {
  assert.strictEqual(subarraySumEqualsK([1, 2, 3], 7), 0);
});
test("subarraySumEqualsK: all zeros k=0", () => {
  assert.strictEqual(subarraySumEqualsK([0, 0, 0], 0), 6);
});
test("subarraySumEqualsK: single element match", () => {
  assert.strictEqual(subarraySumEqualsK([3], 3), 1);
});
test("subarraySumEqualsK: single element no match", () => {
  assert.strictEqual(subarraySumEqualsK([1], 2), 0);
});
test("subarraySumEqualsK: negative k", () => {
  assert.strictEqual(subarraySumEqualsK([-1, -2, -3], -3), 2);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
