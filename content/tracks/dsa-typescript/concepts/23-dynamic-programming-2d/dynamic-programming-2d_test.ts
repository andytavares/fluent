import assert from "assert";
import {
  minPathSum,
  uniquePathsWithObstacles,
  longestPalindrome,
  minDistance,
  maximalSquare,
} from "./stub";

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

// Helper: ties are allowed in longestPalindrome — validate by property.
function checkLongestPalindrome(s: string, expectedLen: number) {
  const result = longestPalindrome(s);
  assert.strictEqual(typeof result, "string", `expected a string, got ${typeof result}`);
  assert.strictEqual(
    result.length,
    expectedLen,
    `expected a palindrome of length ${expectedLen}, got "${result}" (length ${result.length})`
  );
  assert.ok(s.indexOf(result) !== -1, `"${result}" is not a substring of "${s}"`);
  const reversed = result.split("").reverse().join("");
  assert.strictEqual(result, reversed, `"${result}" is not a palindrome`);
}

// ── minPathSum ──
test("minPathSum: classic 3x3", () => {
  assert.strictEqual(minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]), 7);
});
test("minPathSum: 2x3 grid", () => {
  assert.strictEqual(minPathSum([[1, 2, 3], [4, 5, 6]]), 12);
});
test("minPathSum: single cell", () => {
  assert.strictEqual(minPathSum([[3]]), 3);
});
test("minPathSum: single row is a forced path", () => {
  assert.strictEqual(minPathSum([[1, 2, 3, 4]]), 10);
});
test("minPathSum: single column is a forced path", () => {
  assert.strictEqual(minPathSum([[1], [2], [3]]), 6);
});
test("minPathSum: zeros in the grid", () => {
  assert.strictEqual(minPathSum([[0, 0, 9], [9, 0, 0]]), 0);
});
test("minPathSum: cheap detour beats direct diagonal-ish route", () => {
  assert.strictEqual(minPathSum([[1, 9, 9], [1, 9, 9], [1, 1, 1]]), 5);
});

// ── uniquePathsWithObstacles ──
test("uniquePathsWithObstacles: obstacle in the middle", () => {
  assert.strictEqual(uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]), 2);
});
test("uniquePathsWithObstacles: 2x2 with one obstacle", () => {
  assert.strictEqual(uniquePathsWithObstacles([[0, 1], [0, 0]]), 1);
});
test("uniquePathsWithObstacles: blocked start", () => {
  assert.strictEqual(uniquePathsWithObstacles([[1]]), 0);
});
test("uniquePathsWithObstacles: open single cell", () => {
  assert.strictEqual(uniquePathsWithObstacles([[0]]), 1);
});
test("uniquePathsWithObstacles: blocked goal", () => {
  assert.strictEqual(uniquePathsWithObstacles([[0, 0], [0, 1]]), 0);
});
test("uniquePathsWithObstacles: obstacle wall cuts the grid", () => {
  assert.strictEqual(uniquePathsWithObstacles([[0, 1, 0], [0, 1, 0], [0, 1, 0]]), 0);
});
test("uniquePathsWithObstacles: no obstacles — pure counting", () => {
  const grid = Array.from({ length: 3 }, () => new Array(7).fill(0));
  assert.strictEqual(uniquePathsWithObstacles(grid), 28);
});
test("uniquePathsWithObstacles: obstacle in a single row", () => {
  assert.strictEqual(uniquePathsWithObstacles([[0, 1, 0]]), 0);
});

// ── longestPalindrome ──
test("longestPalindrome: babad — two valid answers", () => {
  checkLongestPalindrome("babad", 3);
});
test("longestPalindrome: even-length palindrome", () => {
  assert.strictEqual(longestPalindrome("cbbd"), "bb");
});
test("longestPalindrome: single character", () => {
  assert.strictEqual(longestPalindrome("a"), "a");
});
test("longestPalindrome: no palindrome longer than 1", () => {
  checkLongestPalindrome("ac", 1);
});
test("longestPalindrome: whole string", () => {
  assert.strictEqual(longestPalindrome("racecar"), "racecar");
});
test("longestPalindrome: even palindrome mid-string", () => {
  assert.strictEqual(longestPalindrome("forgeeksskeegfor"), "geeksskeeg");
});
test("longestPalindrome: repeated character block", () => {
  assert.strictEqual(longestPalindrome("aaaa"), "aaaa");
});
test("longestPalindrome: near-palindromic ends trap", () => {
  checkLongestPalindrome("aacabdkacaa", 3); // "aca" — not the fake spanning match
});

// ── minDistance ──
test("minDistance: classic horse/ros", () => {
  assert.strictEqual(minDistance("horse", "ros"), 3);
});
test("minDistance: intention/execution", () => {
  assert.strictEqual(minDistance("intention", "execution"), 5);
});
test("minDistance: empty source", () => {
  assert.strictEqual(minDistance("", "abc"), 3);
});
test("minDistance: empty target", () => {
  assert.strictEqual(minDistance("abc", ""), 3);
});
test("minDistance: both empty", () => {
  assert.strictEqual(minDistance("", ""), 0);
});
test("minDistance: equal strings", () => {
  assert.strictEqual(minDistance("abc", "abc"), 0);
});
test("minDistance: transposition costs 2 — no swap op", () => {
  assert.strictEqual(minDistance("ab", "ba"), 2);
});
test("minDistance: disjoint alphabets", () => {
  assert.strictEqual(minDistance("aaa", "bbbbb"), 5);
});

// ── maximalSquare ──
test("maximalSquare: classic 4x5", () => {
  const matrix = [
    ["1", "0", "1", "0", "0"],
    ["1", "0", "1", "1", "1"],
    ["1", "1", "1", "1", "1"],
    ["1", "0", "0", "1", "0"],
  ];
  assert.strictEqual(maximalSquare(matrix), 4);
});
test("maximalSquare: only single ones", () => {
  assert.strictEqual(maximalSquare([["0", "1"], ["1", "0"]]), 1);
});
test("maximalSquare: all zeros", () => {
  assert.strictEqual(maximalSquare([["0"]]), 0);
});
test("maximalSquare: single one", () => {
  assert.strictEqual(maximalSquare([["1"]]), 1);
});
test("maximalSquare: rectangle of ones capped by shorter side", () => {
  const matrix = Array.from({ length: 3 }, () => new Array(4).fill("1"));
  assert.strictEqual(maximalSquare(matrix), 9);
});
test("maximalSquare: full ones matrix", () => {
  const matrix = Array.from({ length: 3 }, () => new Array(3).fill("1"));
  assert.strictEqual(maximalSquare(matrix), 9);
});
test("maximalSquare: string cells — '1' the character, not the number", () => {
  assert.strictEqual(maximalSquare([["1", "1"], ["1", "1"]]), 4);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
