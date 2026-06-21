import { uniquePaths, longestCommonSubsequence, editDistance } from "./stub";

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
  if (actual !== expected) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// uniquePaths tests
test("uniquePaths: 3x7 grid", () => {
  assertEqual(uniquePaths(3, 7), 28);
});

test("uniquePaths: 3x2 grid", () => {
  assertEqual(uniquePaths(3, 2), 3);
});

test("uniquePaths: 1x1 grid (already there)", () => {
  assertEqual(uniquePaths(1, 1), 1);
});

test("uniquePaths: 1xN grid (one path)", () => {
  assertEqual(uniquePaths(1, 10), 1);
});

test("uniquePaths: Mx1 grid (one path)", () => {
  assertEqual(uniquePaths(10, 1), 1);
});

test("uniquePaths: 2x2 grid", () => {
  assertEqual(uniquePaths(2, 2), 2);
});

test("uniquePaths: 5x5 grid", () => {
  assertEqual(uniquePaths(5, 5), 70);
});

// longestCommonSubsequence tests
test("longestCommonSubsequence: ace in abcde", () => {
  assertEqual(longestCommonSubsequence("abcde", "ace"), 3);
});

test("longestCommonSubsequence: identical strings", () => {
  assertEqual(longestCommonSubsequence("abc", "abc"), 3);
});

test("longestCommonSubsequence: no common chars", () => {
  assertEqual(longestCommonSubsequence("abc", "def"), 0);
});

test("longestCommonSubsequence: one empty string", () => {
  assertEqual(longestCommonSubsequence("abc", ""), 0);
});

test("longestCommonSubsequence: both empty", () => {
  assertEqual(longestCommonSubsequence("", ""), 0);
});

test("longestCommonSubsequence: single char match", () => {
  assertEqual(longestCommonSubsequence("a", "a"), 1);
});

test("longestCommonSubsequence: subsequence not substring", () => {
  // "axb" and "ayb" — LCS is "ab" = 2
  assertEqual(longestCommonSubsequence("axb", "ayb"), 2);
});

// editDistance tests
test("editDistance: horse → ros", () => {
  assertEqual(editDistance("horse", "ros"), 3);
});

test("editDistance: intention → execution", () => {
  assertEqual(editDistance("intention", "execution"), 5);
});

test("editDistance: identical strings", () => {
  assertEqual(editDistance("abc", "abc"), 0);
});

test("editDistance: s1 empty", () => {
  assertEqual(editDistance("", "abc"), 3);
});

test("editDistance: s2 empty", () => {
  assertEqual(editDistance("abc", ""), 3);
});

test("editDistance: both empty", () => {
  assertEqual(editDistance("", ""), 0);
});

test("editDistance: single char substitute", () => {
  assertEqual(editDistance("a", "b"), 1);
});

test("editDistance: single insertion", () => {
  assertEqual(editDistance("ab", "acb"), 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
