import assert from "assert";
import { isPalindrome, twoSumII, containerWithMostWater, threeSum } from "./stub";

let passed = 0, failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name} — ${(e as Error).message}`);
    failed++;
  }
}

// Helper: sort triplets for order-independent comparison
function sortTriplets(arr: number[][]): number[][] {
  return arr.map((t) => [...t].sort((a, b) => a - b)).sort((a, b) => {
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  });
}

// ── isPalindrome ──
test("isPalindrome: classic phrase", () => {
  assert.strictEqual(isPalindrome("A man, a plan, a canal: Panama"), true);
});
test("isPalindrome: not a palindrome", () => {
  assert.strictEqual(isPalindrome("race a car"), false);
});
test("isPalindrome: single space", () => {
  assert.strictEqual(isPalindrome(" "), true);
});
test("isPalindrome: empty string", () => {
  assert.strictEqual(isPalindrome(""), true);
});
test("isPalindrome: simple word", () => {
  assert.strictEqual(isPalindrome("racecar"), true);
});
test("isPalindrome: digits only", () => {
  assert.strictEqual(isPalindrome("12321"), true);
});
test("isPalindrome: digit vs letter is not a match", () => {
  assert.strictEqual(isPalindrome("0P"), false);
});
test("isPalindrome: mixed punctuation palindrome", () => {
  assert.strictEqual(isPalindrome("Was it a car or a cat I saw?"), true);
});
test("isPalindrome: single character", () => {
  assert.strictEqual(isPalindrome("a"), true);
});
test("isPalindrome: two different chars", () => {
  assert.strictEqual(isPalindrome("ab"), false);
});

// ── twoSumII ──
test("twoSumII: classic example", () => {
  assert.deepStrictEqual(twoSumII([2, 7, 11, 15], 9), [1, 2]);
});
test("twoSumII: pair not adjacent", () => {
  assert.deepStrictEqual(twoSumII([2, 3, 4], 6), [1, 3]);
});
test("twoSumII: negative numbers", () => {
  assert.deepStrictEqual(twoSumII([-1, 0], -1), [1, 2]);
});
test("twoSumII: duplicate values form the pair", () => {
  assert.deepStrictEqual(twoSumII([1, 1, 2], 2), [1, 2]);
});
test("twoSumII: pair at the two ends", () => {
  assert.deepStrictEqual(twoSumII([1, 3, 5, 10], 11), [1, 4]);
});
test("twoSumII: pair in the middle", () => {
  assert.deepStrictEqual(twoSumII([1, 4, 6, 20], 10), [2, 3]);
});

// ── containerWithMostWater ──
test("containerWithMostWater: classic example", () => {
  assert.strictEqual(containerWithMostWater([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
});
test("containerWithMostWater: two elements equal", () => {
  assert.strictEqual(containerWithMostWater([1, 1]), 1);
});
test("containerWithMostWater: two elements unequal", () => {
  assert.strictEqual(containerWithMostWater([4, 3]), 3);
});
test("containerWithMostWater: ascending heights", () => {
  assert.strictEqual(containerWithMostWater([1, 2, 3, 4, 5]), 6);
});
test("containerWithMostWater: all same height", () => {
  assert.strictEqual(containerWithMostWater([5, 5, 5, 5]), 15);
});
test("containerWithMostWater: best pair not at ends", () => {
  assert.strictEqual(containerWithMostWater([1, 5, 4, 5, 1]), 10);
});
test("containerWithMostWater: includes zero height", () => {
  assert.strictEqual(containerWithMostWater([0, 2, 0]), 0);
});

// ── threeSum ──
test("threeSum: classic example", () => {
  const result = sortTriplets(threeSum([-1, 0, 1, 2, -1, -4]));
  const expected = sortTriplets([[-1, -1, 2], [-1, 0, 1]]);
  assert.deepStrictEqual(result, expected);
});
test("threeSum: no valid triplets", () => {
  assert.deepStrictEqual(threeSum([0, 1, 1]), []);
});
test("threeSum: all zeros", () => {
  assert.deepStrictEqual(sortTriplets(threeSum([0, 0, 0])), [[0, 0, 0]]);
});
test("threeSum: heavy duplicates yield one triplet", () => {
  const result = sortTriplets(threeSum([-2, 0, 0, 2, 2]));
  assert.deepStrictEqual(result, [[-2, 0, 2]]);
});
test("threeSum: empty array", () => {
  assert.deepStrictEqual(threeSum([]), []);
});
test("threeSum: two elements", () => {
  assert.deepStrictEqual(threeSum([0, 0]), []);
});
test("threeSum: all positive no solution", () => {
  assert.deepStrictEqual(threeSum([1, 2, 3, 4]), []);
});
test("threeSum: all negative no solution", () => {
  assert.deepStrictEqual(threeSum([-4, -3, -2, -1]), []);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
