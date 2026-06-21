const assert = require("assert");
const { isPalindrome, containerWithMostWater, threeSum } = require("./stub");

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

// Helper: sort triplets for comparison
function sortTriplets(arr) {
  return arr.map(t => [...t].sort((a, b) => a - b)).sort((a, b) => {
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  });
}

// isPalindrome
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
test("isPalindrome: numbers only", () => {
  assert.strictEqual(isPalindrome("12321"), true);
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

// containerWithMostWater
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
  assert.strictEqual(containerWithMostWater([1, 5, 4, 5, 1]), 12);
});
test("containerWithMostWater: includes zero height", () => {
  assert.strictEqual(containerWithMostWater([0, 2, 0]), 0);
});

// threeSum
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
test("threeSum: multiple duplicates", () => {
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
