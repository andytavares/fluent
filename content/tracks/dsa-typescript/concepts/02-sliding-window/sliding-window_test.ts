import { longestUniqueSubstring, maxSumSubarray, minWindowSubstring } from "./stub";

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

// --- longestUniqueSubstring ---

test("longestUniqueSubstring: abcabcbb → 3", () => {
  assertEqual(longestUniqueSubstring("abcabcbb"), 3);
});

test("longestUniqueSubstring: all same → 1", () => {
  assertEqual(longestUniqueSubstring("bbbbb"), 1);
});

test("longestUniqueSubstring: pwwkew → 3", () => {
  assertEqual(longestUniqueSubstring("pwwkew"), 3);
});

test("longestUniqueSubstring: empty string → 0", () => {
  assertEqual(longestUniqueSubstring(""), 0);
});

test("longestUniqueSubstring: single char → 1", () => {
  assertEqual(longestUniqueSubstring("z"), 1);
});

test("longestUniqueSubstring: all unique → full length", () => {
  assertEqual(longestUniqueSubstring("abcdef"), 6);
});

test("longestUniqueSubstring: duplicate not in current window", () => {
  // 'a' at index 0 is outside window by the time we reach index 5
  assertEqual(longestUniqueSubstring("abcdea"), 5);
});

// --- maxSumSubarray ---

test("maxSumSubarray: standard k=3", () => {
  assertEqual(maxSumSubarray([2, 1, 5, 1, 3, 2], 3), 9);
});

test("maxSumSubarray: k=2", () => {
  assertEqual(maxSumSubarray([2, 3, 4, 1, 5], 2), 7);
});

test("maxSumSubarray: k equals length", () => {
  assertEqual(maxSumSubarray([1, 2, 3], 3), 6);
});

test("maxSumSubarray: k=1 → max element", () => {
  assertEqual(maxSumSubarray([3, 1, 4, 1, 5], 1), 5);
});

test("maxSumSubarray: all negatives", () => {
  assertEqual(maxSumSubarray([-1, -2, -3, -4], 2), -3);
});

test("maxSumSubarray: length < k → 0", () => {
  assertEqual(maxSumSubarray([1, 2], 5), 0);
});

// --- minWindowSubstring ---

test("minWindowSubstring: standard case", () => {
  assertEqual(minWindowSubstring("ADOBECODEBANC", "ABC"), "BANC");
});

test("minWindowSubstring: exact match", () => {
  assertEqual(minWindowSubstring("a", "a"), "a");
});

test("minWindowSubstring: t not present", () => {
  assertEqual(minWindowSubstring("a", "b"), "");
});

test("minWindowSubstring: t longer than s", () => {
  assertEqual(minWindowSubstring("a", "aa"), "");
});

test("minWindowSubstring: empty s", () => {
  assertEqual(minWindowSubstring("", "a"), "");
});

test("minWindowSubstring: empty t", () => {
  assertEqual(minWindowSubstring("abc", ""), "");
});

test("minWindowSubstring: duplicate chars in t require both copies", () => {
  // t="AABC" needs two A's, one B, one C.
  // s has A at index 0 and 10 — smallest window covering both is the full string.
  assertEqual(minWindowSubstring("ADOBECODEBANC", "AABC"), "ADOBECODEBANC");
});

test("minWindowSubstring: window starts at beginning", () => {
  assertEqual(minWindowSubstring("ABC", "ABC"), "ABC");
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
