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
test("isAnagram: long shuffled string is an anagram", () => {
  const s = "abcdefghij".repeat(2000);
  const t = [...s].reverse().join("");
  assert.strictEqual(isAnagram(s, t), true);
});
test("isAnagram: long strings differing by one character", () => {
  const s = "abcdefghij".repeat(2000);
  const t = [...s].reverse().join("").replace("a", "z");
  assert.strictEqual(isAnagram(s, t), false);
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
test("groupAnagrams: many rotations of one word form a single group", () => {
  const word = "abcde";
  const rotations = Array.from({ length: 5 }, (_, i) => word.slice(i) + word.slice(0, i));
  const result = groupAnagrams(rotations);
  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual([...result[0]].sort(), [...rotations].sort());
});
test("groupAnagrams: 1000 strings across two groups", () => {
  const strs: string[] = [];
  for (let i = 0; i < 500; i++) strs.push(i % 2 === 0 ? "abc" : "cba");
  for (let i = 0; i < 500; i++) strs.push(i % 2 === 0 ? "xyz" : "zyx");
  const result = groupAnagrams(strs);
  assert.strictEqual(result.length, 2);
  assert.deepStrictEqual(result.map((g) => g.length).sort((a, b) => a - b), [500, 500]);
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
test("twoSum: large array, pair deep inside", () => {
  const nums = Array.from({ length: 100000 }, (_, i) => i * 2); // evens
  nums[99999] = 99999; // the only odd value
  assert.deepStrictEqual(twoSum(nums, 99999 + 50000), [25000, 99999]);
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
test("longestConsecutive: one 50k-element run, shuffled — punishes O(n²)", () => {
  const n = 50000;
  const nums = Array.from({ length: n }, (_, i) => i);
  // Deterministic shuffle
  let seed = 42;
  for (let i = n - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  assert.strictEqual(longestConsecutive(nums), n);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
