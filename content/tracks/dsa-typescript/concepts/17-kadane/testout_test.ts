import assert from "assert";
import { maxSubArray, maxSubarraySumCircular } from "./stub";

let passed = 0, failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`  FAIL: ${name} — ${e.message}`);
    failed++;
  }
}

// ── maxSubArray ──
test("maxSubArray: classic example", () => {
  assert.strictEqual(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6);
});
test("maxSubArray: single element", () => {
  assert.strictEqual(maxSubArray([1]), 1);
});
test("maxSubArray: single negative element", () => {
  assert.strictEqual(maxSubArray([-7]), -7);
});
test("maxSubArray: all positive — the whole array", () => {
  assert.strictEqual(maxSubArray([5, 4, -1, 7, 8]), 23);
});
test("maxSubArray: all negative — largest element, never 0", () => {
  assert.strictEqual(maxSubArray([-3, -1, -2]), -1);
});
test("maxSubArray: negative prefix must be dropped", () => {
  assert.strictEqual(maxSubArray([-5, 3, 4]), 7);
});
test("maxSubArray: negative suffix must be ignored", () => {
  assert.strictEqual(maxSubArray([3, 4, -10]), 7);
});
test("maxSubArray: zeros mixed with negatives", () => {
  assert.strictEqual(maxSubArray([-1, 0, -2]), 0);
});
test("maxSubArray: dip worth crossing", () => {
  assert.strictEqual(maxSubArray([4, -1, 5]), 8);
});
test("maxSubArray: dip not worth crossing", () => {
  assert.strictEqual(maxSubArray([5, -10, 6]), 6);
});
test("maxSubArray: large input — one positive block hidden in noise", () => {
  // 2000 × (-1), then 100 × 10, then 2000 × (-1): best is the block = 1000
  const nums = [
    ...new Array(2000).fill(-1),
    ...new Array(100).fill(10),
    ...new Array(2000).fill(-1),
  ];
  assert.strictEqual(maxSubArray(nums), 1000);
});
test("maxSubArray: large alternating input", () => {
  // [1,-2,1,-2,...]: no run beats a single 1
  const nums = Array.from({ length: 10000 }, (_, i) => (i % 2 === 0 ? 1 : -2));
  assert.strictEqual(maxSubArray(nums), 1);
});
test("maxSubArray: two blocks joined by a shallow dip", () => {
  // 500-sum block, dip of -3, 500-sum block → cross the dip: 997
  const nums = [
    ...new Array(50).fill(10),
    -3,
    ...new Array(50).fill(10),
  ];
  assert.strictEqual(maxSubArray(nums), 997);
});

// ── maxSubarraySumCircular ──
test("maxSubarraySumCircular: no wrap needed", () => {
  assert.strictEqual(maxSubarraySumCircular([1, -2, 3, -2]), 3);
});
test("maxSubarraySumCircular: wrap wins", () => {
  assert.strictEqual(maxSubarraySumCircular([5, -3, 5]), 10);
});
test("maxSubarraySumCircular: all negative — single element, not 0", () => {
  assert.strictEqual(maxSubarraySumCircular([-3, -2, -3]), -2);
});
test("maxSubarraySumCircular: single element", () => {
  assert.strictEqual(maxSubarraySumCircular([7]), 7);
});
test("maxSubarraySumCircular: single negative element", () => {
  assert.strictEqual(maxSubarraySumCircular([-4]), -4);
});
test("maxSubarraySumCircular: wrap combining suffix and prefix", () => {
  assert.strictEqual(maxSubarraySumCircular([3, -1, 2, -1]), 4); // [2,-1,3]
});
test("maxSubarraySumCircular: all positive — whole circle", () => {
  assert.strictEqual(maxSubarraySumCircular([1, 2, 3, 4]), 10);
});
test("maxSubarraySumCircular: wrap skips the minimum middle", () => {
  // total 9, min middle [-5,4,-5] = -6 → wrap [9,4,-2,4] = 15 beats non-wrap [9,4] = 13
  assert.strictEqual(maxSubarraySumCircular([-2, 4, -5, 4, -5, 9, 4]), 15);
});
test("maxSubarraySumCircular: all zeros", () => {
  assert.strictEqual(maxSubarraySumCircular([0, 0, 0]), 0);
});
test("maxSubarraySumCircular: -2 and -1 only", () => {
  assert.strictEqual(maxSubarraySumCircular([-2, -1]), -1);
});
test("maxSubarraySumCircular: large input — block split across the boundary", () => {
  // 50 tens at each end, -1s in the middle: wrap = 1000, non-wrap = 500
  const nums = [
    ...new Array(50).fill(10),
    ...new Array(5000).fill(-1),
    ...new Array(50).fill(10),
  ];
  assert.strictEqual(maxSubarraySumCircular(nums), 1000);
});
test("maxSubarraySumCircular: large all-negative input", () => {
  // -1000, -999, ..., wrapped formula would give 0 — the answer is the max element
  const nums = Array.from({ length: 5000 }, (_, i) => -(i + 1));
  assert.strictEqual(maxSubarraySumCircular(nums), -1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
