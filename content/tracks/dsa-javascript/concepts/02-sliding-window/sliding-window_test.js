const assert = require("assert");
const { longestUniqueSubstring, maxSumSubarray, minWindowSubstring } = require("./stub");

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

// longestUniqueSubstring
test("longestUniqueSubstring: classic abcabcbb", () => {
  assert.strictEqual(longestUniqueSubstring("abcabcbb"), 3);
});
test("longestUniqueSubstring: all same character", () => {
  assert.strictEqual(longestUniqueSubstring("bbbbb"), 1);
});
test("longestUniqueSubstring: pwwkew", () => {
  assert.strictEqual(longestUniqueSubstring("pwwkew"), 3);
});
test("longestUniqueSubstring: empty string", () => {
  assert.strictEqual(longestUniqueSubstring(""), 0);
});
test("longestUniqueSubstring: all unique", () => {
  assert.strictEqual(longestUniqueSubstring("abcdef"), 6);
});
test("longestUniqueSubstring: single character", () => {
  assert.strictEqual(longestUniqueSubstring("z"), 1);
});
test("longestUniqueSubstring: duplicate not adjacent (dvdf)", () => {
  assert.strictEqual(longestUniqueSubstring("dvdf"), 3);
});
test("longestUniqueSubstring: two chars alternating", () => {
  assert.strictEqual(longestUniqueSubstring("abababab"), 2);
});

// maxSumSubarray
test("maxSumSubarray: window in middle", () => {
  assert.strictEqual(maxSumSubarray([2, 1, 5, 1, 3, 2], 3), 9);
});
test("maxSumSubarray: window of 2", () => {
  assert.strictEqual(maxSumSubarray([2, 3, 4, 1, 5], 2), 7);
});
test("maxSumSubarray: window equals array length", () => {
  assert.strictEqual(maxSumSubarray([1, 1, 1, 1], 4), 4);
});
test("maxSumSubarray: window of 1", () => {
  assert.strictEqual(maxSumSubarray([3, 1, 4, 1, 5], 1), 5);
});
test("maxSumSubarray: negative numbers", () => {
  assert.strictEqual(maxSumSubarray([-1, -2, -3, -4], 2), -3);
});
test("maxSumSubarray: best at start", () => {
  assert.strictEqual(maxSumSubarray([9, 1, 1, 1], 2), 10);
});
test("maxSumSubarray: best at end", () => {
  assert.strictEqual(maxSumSubarray([1, 1, 1, 9], 2), 10);
});

// minWindowSubstring
test("minWindowSubstring: classic ADOBECODEBANC", () => {
  assert.strictEqual(minWindowSubstring("ADOBECODEBANC", "ABC"), "BANC");
});
test("minWindowSubstring: exact match", () => {
  assert.strictEqual(minWindowSubstring("a", "a"), "a");
});
test("minWindowSubstring: no valid window", () => {
  assert.strictEqual(minWindowSubstring("a", "b"), "");
});
test("minWindowSubstring: t has duplicates", () => {
  assert.strictEqual(minWindowSubstring("aa", "aa"), "aa");
});
test("minWindowSubstring: t longer than s", () => {
  assert.strictEqual(minWindowSubstring("a", "aa"), "");
});
test("minWindowSubstring: window is full string", () => {
  assert.strictEqual(minWindowSubstring("abc", "abc"), "abc");
});
test("minWindowSubstring: multiple valid windows picks shortest", () => {
  // "a...c" covers ABC but "BANC" is shorter
  assert.strictEqual(minWindowSubstring("ADOBECODEBANC", "ABC"), "BANC");
});
test("minWindowSubstring: single char t repeated in s", () => {
  assert.strictEqual(minWindowSubstring("aabc", "b"), "b");
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
