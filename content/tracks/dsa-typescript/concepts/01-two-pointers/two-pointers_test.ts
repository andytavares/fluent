import { isPalindrome, containerWithMostWater, threeSum } from "./stub";

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

function assertEqual<T>(actual: T, expected: T, msg?: string): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(msg ?? `expected ${b}, got ${a}`);
}

// Sort triplets for order-independent comparison
function normalizeTriples(arr: number[][]): number[][] {
  return arr
    .map((t) => [...t].sort((a, b) => a - b))
    .sort((a, b) => {
      for (let i = 0; i < 3; i++) {
        if (a[i] !== b[i]) return a[i] - b[i];
      }
      return 0;
    });
}

// --- isPalindrome ---

test("isPalindrome: classic phrase", () => {
  assertEqual(isPalindrome("A man, a plan, a canal: Panama"), true);
});

test("isPalindrome: non-palindrome", () => {
  assertEqual(isPalindrome("race a car"), false);
});

test("isPalindrome: empty string", () => {
  assertEqual(isPalindrome(""), true);
});

test("isPalindrome: single character", () => {
  assertEqual(isPalindrome("a"), true);
});

test("isPalindrome: numeric palindrome", () => {
  assertEqual(isPalindrome("12321"), true);
});

test("isPalindrome: punctuation only becomes empty", () => {
  assertEqual(isPalindrome(".,!"), true);
});

test("isPalindrome: mixed case", () => {
  assertEqual(isPalindrome("AbBa"), true);
});

test("isPalindrome: two chars not palindrome", () => {
  assertEqual(isPalindrome("ab"), false);
});

// --- containerWithMostWater ---

test("containerWithMostWater: standard LeetCode case", () => {
  assertEqual(containerWithMostWater([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
});

test("containerWithMostWater: two elements", () => {
  assertEqual(containerWithMostWater([1, 1]), 1);
});

test("containerWithMostWater: decreasing heights", () => {
  assertEqual(containerWithMostWater([4, 3, 2, 1]), 4);
});

test("containerWithMostWater: equal heights", () => {
  assertEqual(containerWithMostWater([3, 3, 3, 3]), 9);
});

test("containerWithMostWater: tall walls at ends", () => {
  assertEqual(containerWithMostWater([10, 1, 1, 1, 10]), 40);
});

test("containerWithMostWater: one tall wall in middle", () => {
  assertEqual(containerWithMostWater([1, 10, 1]), 2);
});

// --- threeSum ---

test("threeSum: standard case", () => {
  const result = normalizeTriples(threeSum([-1, 0, 1, 2, -1, -4]));
  const expected = normalizeTriples([[-1, -1, 2], [-1, 0, 1]]);
  assertEqual(result, expected);
});

test("threeSum: no valid triplets", () => {
  assertEqual(threeSum([1, 2, 3]).length, 0);
});

test("threeSum: all zeros", () => {
  const result = normalizeTriples(threeSum([0, 0, 0]));
  assertEqual(result, [[0, 0, 0]]);
});

test("threeSum: empty array", () => {
  assertEqual(threeSum([]).length, 0);
});

test("threeSum: fewer than 3 elements", () => {
  assertEqual(threeSum([0, 1]).length, 0);
});

test("threeSum: duplicates do not produce duplicate triplets", () => {
  const result = normalizeTriples(threeSum([0, 0, 0, 0]));
  assertEqual(result, [[0, 0, 0]]);
});

test("threeSum: negatives and positives", () => {
  const result = normalizeTriples(threeSum([-4, -1, -1, 0, 1, 2]));
  const expected = normalizeTriples([[-1, -1, 2], [-1, 0, 1]]);
  assertEqual(result, expected);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
