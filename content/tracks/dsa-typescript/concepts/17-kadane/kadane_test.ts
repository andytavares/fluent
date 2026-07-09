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
  // [4, -1, 5] beats [4] and [5] alone
  assert.strictEqual(maxSubArray([4, -1, 5]), 8);
});
test("maxSubArray: dip not worth crossing", () => {
  // crossing -10 never pays: best is [6]
  assert.strictEqual(maxSubArray([5, -10, 6]), 6);
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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
