const assert = require("assert");
const { uniquePaths, longestCommonSubsequence, editDistance } = require("./stub");

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

// uniquePaths
test("uniquePaths: 3x7", () => {
  assert.strictEqual(uniquePaths(3, 7), 28);
});
test("uniquePaths: 3x2", () => {
  assert.strictEqual(uniquePaths(3, 2), 3);
});
test("uniquePaths: 1x1", () => {
  assert.strictEqual(uniquePaths(1, 1), 1);
});
test("uniquePaths: 1xN — only one path (go right)", () => {
  assert.strictEqual(uniquePaths(1, 5), 1);
});
test("uniquePaths: Mx1 — only one path (go down)", () => {
  assert.strictEqual(uniquePaths(5, 1), 1);
});
test("uniquePaths: 2x2", () => {
  assert.strictEqual(uniquePaths(2, 2), 2);
});
test("uniquePaths: 3x3", () => {
  assert.strictEqual(uniquePaths(3, 3), 6);
});

// longestCommonSubsequence
test("LCS: 'abcde' vs 'ace' = 3", () => {
  assert.strictEqual(longestCommonSubsequence("abcde", "ace"), 3);
});
test("LCS: identical strings", () => {
  assert.strictEqual(longestCommonSubsequence("abc", "abc"), 3);
});
test("LCS: no common characters", () => {
  assert.strictEqual(longestCommonSubsequence("abc", "def"), 0);
});
test("LCS: one empty string", () => {
  assert.strictEqual(longestCommonSubsequence("abc", ""), 0);
  assert.strictEqual(longestCommonSubsequence("", "abc"), 0);
});
test("LCS: both empty", () => {
  assert.strictEqual(longestCommonSubsequence("", ""), 0);
});
test("LCS: 'bl' vs 'yby' = 1", () => {
  assert.strictEqual(longestCommonSubsequence("bl", "yby"), 1);
});
test("LCS: 'bsbininm' vs 'jmjkbkjkv' = 2", () => {
  assert.strictEqual(longestCommonSubsequence("bsbininm", "jmjkbkjkv"), 2);
});

// editDistance
test("editDistance: 'horse' to 'ros' = 3", () => {
  assert.strictEqual(editDistance("horse", "ros"), 3);
});
test("editDistance: 'intention' to 'execution' = 5", () => {
  assert.strictEqual(editDistance("intention", "execution"), 5);
});
test("editDistance: identical strings = 0", () => {
  assert.strictEqual(editDistance("abc", "abc"), 0);
});
test("editDistance: empty to non-empty = length", () => {
  assert.strictEqual(editDistance("", "abc"), 3);
});
test("editDistance: non-empty to empty = length", () => {
  assert.strictEqual(editDistance("abc", ""), 3);
});
test("editDistance: both empty = 0", () => {
  assert.strictEqual(editDistance("", ""), 0);
});
test("editDistance: single char insert", () => {
  assert.strictEqual(editDistance("a", "ab"), 1);
});
test("editDistance: single char replace", () => {
  assert.strictEqual(editDistance("a", "b"), 1);
});
test("editDistance: 'kitten' to 'sitting' = 3", () => {
  assert.strictEqual(editDistance("kitten", "sitting"), 3);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
