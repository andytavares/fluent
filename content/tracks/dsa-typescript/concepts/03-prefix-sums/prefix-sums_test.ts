import { buildPrefixSum, rangeSum, subarraySumEqualsK } from "./stub";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL: ${name} — ${msg}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`expected ${b}, got ${a}`);
}

// --- buildPrefixSum ---

test("buildPrefixSum: basic", () => {
  assertEqual(buildPrefixSum([1, 2, 3, 4]), [1, 3, 6, 10]);
});

test("buildPrefixSum: single element", () => {
  assertEqual(buildPrefixSum([5]), [5]);
});

test("buildPrefixSum: with zeros", () => {
  assertEqual(buildPrefixSum([0, 0, 1]), [0, 0, 1]);
});

test("buildPrefixSum: negative numbers", () => {
  assertEqual(buildPrefixSum([1, -1, 2]), [1, 0, 2]);
});

test("buildPrefixSum: empty array", () => {
  assertEqual(buildPrefixSum([]), []);
});

// --- rangeSum ---

test("rangeSum: full range starting at 0", () => {
  assertEqual(rangeSum([1, 3, 6, 10], 0, 3), 10);
});

test("rangeSum: range starting at 0, partial", () => {
  assertEqual(rangeSum([1, 3, 6, 10], 0, 2), 6);
});

test("rangeSum: middle range", () => {
  assertEqual(rangeSum([1, 3, 6, 10], 1, 3), 9);
});

test("rangeSum: single element query i=j", () => {
  // rangeSum at position 2 should return 3 (the original nums[2])
  assertEqual(rangeSum([1, 3, 6, 10], 2, 2), 3);
});

test("rangeSum: i=0, j=0 single element", () => {
  assertEqual(rangeSum([5, 10, 15], 0, 0), 5);
});

// --- subarraySumEqualsK ---

test("subarraySumEqualsK: all ones k=2", () => {
  assertEqual(subarraySumEqualsK([1, 1, 1], 2), 2);
});

test("subarraySumEqualsK: [1,2,3] k=3 → two matches", () => {
  assertEqual(subarraySumEqualsK([1, 2, 3], 3), 2);
});

test("subarraySumEqualsK: no match", () => {
  assertEqual(subarraySumEqualsK([1, 2, 3], 7), 0);
});

test("subarraySumEqualsK: negative numbers", () => {
  assertEqual(subarraySumEqualsK([1, -1, 1], 0), 2);
});

test("subarraySumEqualsK: single element match", () => {
  assertEqual(subarraySumEqualsK([3], 3), 1);
});

test("subarraySumEqualsK: whole array sums to k", () => {
  assertEqual(subarraySumEqualsK([1, 2, 3], 6), 1);
});

test("subarraySumEqualsK: zeros with k=0", () => {
  assertEqual(subarraySumEqualsK([0, 0, 0], 0), 6);
});

test("subarraySumEqualsK: subarray starting at index 0", () => {
  // [3] sums to 3 — tests the seeded {0: 1} case
  assertEqual(subarraySumEqualsK([3, 1, 2], 3), 2);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
