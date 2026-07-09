import assert from "assert";
import { isAnagram, groupAnagrams, twoSum, longestConsecutive } from "./stub";

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

// Helper: normalize groups for order-independent comparison —
// sort strings within each group, then sort groups by their joined contents.
function sortGroups(groups: string[][]): string[][] {
  return groups
    .map((g) => [...g].sort())
    .sort((a, b) => (a.join(" ") < b.join(" ") ? -1 : 1));
}

// ── isAnagram ──
test("isAnagram: classic anagram", () => {
  assert.strictEqual(isAnagram("anagram", "nagaram"), true);
});
test("isAnagram: same letters, wrong counts", () => {
  assert.strictEqual(isAnagram("rat", "car"), false);
});
test("isAnagram: different lengths", () => {
  assert.strictEqual(isAnagram("ab", "a"), false);
});
test("isAnagram: empty strings", () => {
  assert.strictEqual(isAnagram("", ""), true);
});
test("isAnagram: identical strings", () => {
  assert.strictEqual(isAnagram("abc", "abc"), true);
});
test("isAnagram: multiplicities differ, same character set", () => {
  assert.strictEqual(isAnagram("aacc", "ccac"), false);
});
test("isAnagram: case-sensitive comparison", () => {
  assert.strictEqual(isAnagram("Abc", "abc"), false);
});
test("isAnagram: single characters", () => {
  assert.strictEqual(isAnagram("a", "a"), true);
  assert.strictEqual(isAnagram("a", "b"), false);
});

// ── groupAnagrams ──
test("groupAnagrams: classic example", () => {
  const result = sortGroups(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
  const expected = sortGroups([["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]);
  assert.deepStrictEqual(result, expected);
});
test("groupAnagrams: empty input array", () => {
  assert.deepStrictEqual(groupAnagrams([]), []);
});
test("groupAnagrams: single empty string", () => {
  assert.deepStrictEqual(groupAnagrams([""]), [[""]]);
});
test("groupAnagrams: single string", () => {
  assert.deepStrictEqual(groupAnagrams(["a"]), [["a"]]);
});
test("groupAnagrams: duplicate strings land in one group", () => {
  const result = sortGroups(groupAnagrams(["ab", "ba", "ab"]));
  assert.deepStrictEqual(result, [["ab", "ab", "ba"]]);
});
test("groupAnagrams: multiple empty strings group together", () => {
  const result = sortGroups(groupAnagrams(["", "b", ""]));
  assert.deepStrictEqual(result, sortGroups([["", ""], ["b"]]));
});
test("groupAnagrams: no anagram partners — all singleton groups", () => {
  const result = sortGroups(groupAnagrams(["ab", "cd", "ef"]));
  assert.deepStrictEqual(result, sortGroups([["ab"], ["cd"], ["ef"]]));
});

// ── twoSum ──
test("twoSum: classic example", () => {
  assert.deepStrictEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
});
test("twoSum: pair not at the front", () => {
  assert.deepStrictEqual(twoSum([3, 2, 4], 6), [1, 2]);
});
test("twoSum: duplicate values form the pair", () => {
  assert.deepStrictEqual(twoSum([3, 3], 6), [0, 1]);
});
test("twoSum: negative numbers", () => {
  assert.deepStrictEqual(twoSum([-3, 4, 90], 1), [0, 1]);
});
test("twoSum: target zero", () => {
  assert.deepStrictEqual(twoSum([5, -7, 2, 7], 0), [1, 3]);
});
test("twoSum: pair at the two ends", () => {
  assert.deepStrictEqual(twoSum([1, 9, 4, 7, 5], 6), [0, 4]);
});

// ── longestConsecutive ──
test("longestConsecutive: classic example", () => {
  assert.strictEqual(longestConsecutive([100, 4, 200, 1, 3, 2]), 4);
});
test("longestConsecutive: longer run with duplicates", () => {
  assert.strictEqual(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), 9);
});
test("longestConsecutive: empty array", () => {
  assert.strictEqual(longestConsecutive([]), 0);
});
test("longestConsecutive: single element", () => {
  assert.strictEqual(longestConsecutive([7]), 1);
});
test("longestConsecutive: no consecutive values", () => {
  assert.strictEqual(longestConsecutive([10, 20, 30]), 1);
});
test("longestConsecutive: run crossing zero with negatives", () => {
  assert.strictEqual(longestConsecutive([-2, 1, -1, 0]), 4);
});
test("longestConsecutive: duplicates inside a run don't lengthen it", () => {
  assert.strictEqual(longestConsecutive([1, 2, 2, 3]), 3);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
