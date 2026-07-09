import assert from "assert";
import { minSubArrayLen, lengthOfLongestSubstring, minWindow } from "./stub";

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

// ── minSubArrayLen ──
test("minSubArrayLen: classic example", () => {
  assert.strictEqual(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]), 2);
});
test("minSubArrayLen: single element suffices", () => {
  assert.strictEqual(minSubArrayLen(4, [1, 4, 4]), 1);
});
test("minSubArrayLen: no subarray reaches target", () => {
  assert.strictEqual(minSubArrayLen(11, [1, 1, 1, 1, 1, 1, 1, 1]), 0);
});
test("minSubArrayLen: whole array sums exactly to target", () => {
  assert.strictEqual(minSubArrayLen(6, [1, 2, 3]), 3);
});
test("minSubArrayLen: single-element array meets target", () => {
  assert.strictEqual(minSubArrayLen(5, [5]), 1);
});
test("minSubArrayLen: single-element array misses target", () => {
  assert.strictEqual(minSubArrayLen(6, [5]), 0);
});
test("minSubArrayLen: empty array", () => {
  assert.strictEqual(minSubArrayLen(1, []), 0);
});
test("minSubArrayLen: best window in the middle", () => {
  assert.strictEqual(minSubArrayLen(8, [1, 1, 7, 1, 1, 1]), 2);
});
test("minSubArrayLen: shrink past several small elements", () => {
  assert.strictEqual(minSubArrayLen(15, [1, 2, 3, 4, 5]), 5);
});
test("minSubArrayLen: large value late beats long early window", () => {
  assert.strictEqual(minSubArrayLen(10, [1, 1, 1, 1, 1, 1, 1, 1, 10]), 1);
});
test("minSubArrayLen: 100k ones — must be linear", () => {
  const nums = new Array(100000).fill(1);
  assert.strictEqual(minSubArrayLen(100, nums), 100);
});
test("minSubArrayLen: 100k elements, spike at the end", () => {
  const nums = new Array(100000).fill(1);
  nums[99999] = 1000;
  assert.strictEqual(minSubArrayLen(1000, nums), 1);
});

// ── lengthOfLongestSubstring ──
test("lengthOfLongestSubstring: classic example", () => {
  assert.strictEqual(lengthOfLongestSubstring("abcabcbb"), 3);
});
test("lengthOfLongestSubstring: all identical", () => {
  assert.strictEqual(lengthOfLongestSubstring("bbbbb"), 1);
});
test("lengthOfLongestSubstring: substring not subsequence", () => {
  assert.strictEqual(lengthOfLongestSubstring("pwwkew"), 3);
});
test("lengthOfLongestSubstring: empty string", () => {
  assert.strictEqual(lengthOfLongestSubstring(""), 0);
});
test("lengthOfLongestSubstring: single character", () => {
  assert.strictEqual(lengthOfLongestSubstring("z"), 1);
});
test("lengthOfLongestSubstring: all distinct", () => {
  assert.strictEqual(lengthOfLongestSubstring("abcdef"), 6);
});
test("lengthOfLongestSubstring: stale index must not move left backwards", () => {
  assert.strictEqual(lengthOfLongestSubstring("abba"), 2);
});
test("lengthOfLongestSubstring: duplicate before current window", () => {
  assert.strictEqual(lengthOfLongestSubstring("tmmzuxt"), 5); // "mzuxt"
});
test("lengthOfLongestSubstring: repeat forces partial jump", () => {
  assert.strictEqual(lengthOfLongestSubstring("dvdf"), 3); // "vdf"
});
test("lengthOfLongestSubstring: spaces and symbols count as characters", () => {
  assert.strictEqual(lengthOfLongestSubstring("a b!a"), 4); // " b!a"
});
test("lengthOfLongestSubstring: 100k repeating pattern — must be linear", () => {
  const s = "abcdefghij".repeat(10000);
  assert.strictEqual(lengthOfLongestSubstring(s), 10);
});
test("lengthOfLongestSubstring: long prefix, distinct run at the end", () => {
  const s = "ab".repeat(50000) + "cdefghij";
  assert.strictEqual(lengthOfLongestSubstring(s), 10); // "ab" + "cdefghij"
});

// ── minWindow ──
test("minWindow: classic example", () => {
  assert.strictEqual(minWindow("ADOBECODEBANC", "ABC"), "BANC");
});
test("minWindow: single char match", () => {
  assert.strictEqual(minWindow("a", "a"), "a");
});
test("minWindow: t longer than s", () => {
  assert.strictEqual(minWindow("a", "aa"), "");
});
test("minWindow: duplicates in t both required", () => {
  assert.strictEqual(minWindow("aa", "aa"), "aa");
});
test("minWindow: no valid window", () => {
  assert.strictEqual(minWindow("abc", "d"), "");
});
test("minWindow: window at the very start", () => {
  assert.strictEqual(minWindow("abcde", "ab"), "ab");
});
test("minWindow: window at the very end", () => {
  assert.strictEqual(minWindow("abcde", "de"), "de");
});
test("minWindow: whole of s is the only valid window", () => {
  assert.strictEqual(minWindow("acb", "abc"), "acb");
});
test("minWindow: must keep shrinking to the tightest window", () => {
  assert.strictEqual(minWindow("cabwefgewcwaefgcf", "cae"), "cwae");
});
test("minWindow: duplicate requirement stops premature shrink", () => {
  assert.strictEqual(minWindow("abcdefa", "aa"), "abcdefa");
});
test("minWindow: case sensitivity", () => {
  assert.strictEqual(minWindow("Aa", "A"), "A");
});
test("minWindow: 100k junk prefix — must be linear", () => {
  const s = "x".repeat(100000) + "abc";
  assert.strictEqual(minWindow(s, "abc"), "abc");
});
test("minWindow: heavy duplicates at scale", () => {
  const s = "a".repeat(100000);
  const t = "a".repeat(50000);
  assert.strictEqual(minWindow(s, t), "a".repeat(50000));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
