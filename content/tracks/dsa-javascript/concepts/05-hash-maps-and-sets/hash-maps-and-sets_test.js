const assert = require("assert");
const { twoSum, groupAnagrams, longestConsecutiveSequence } = require("./stub");

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

function sortGroups(groups) {
  return groups
    .map((g) => [...g].sort())
    .sort((a, b) => a[0].localeCompare(b[0]));
}

// twoSum
test("twoSum: basic", () => {
  assert.deepStrictEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
});
test("twoSum: answer not at start", () => {
  assert.deepStrictEqual(twoSum([3, 2, 4], 6), [1, 2]);
});
test("twoSum: duplicate values", () => {
  assert.deepStrictEqual(twoSum([3, 3], 6), [0, 1]);
});
test("twoSum: negative numbers", () => {
  assert.deepStrictEqual(twoSum([-3, 4, 3, 90], 0), [0, 2]);
});
test("twoSum: zero in array", () => {
  assert.deepStrictEqual(twoSum([0, 4, 3, 0], 0), [0, 3]);
});
test("twoSum: large array", () => {
  const nums = Array.from({ length: 100 }, (_, i) => i);
  const result = twoSum(nums, 197);
  assert.strictEqual(nums[result[0]] + nums[result[1]], 197);
});

// groupAnagrams
test("groupAnagrams: classic example", () => {
  const result = sortGroups(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
  const expected = sortGroups([["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]);
  assert.deepStrictEqual(result, expected);
});
test("groupAnagrams: single empty string", () => {
  assert.deepStrictEqual(groupAnagrams([""]), [[""]]);
});
test("groupAnagrams: single word", () => {
  assert.deepStrictEqual(groupAnagrams(["a"]), [["a"]]);
});
test("groupAnagrams: all same anagram", () => {
  const result = sortGroups(groupAnagrams(["ab", "ba", "ab"]));
  assert.deepStrictEqual(result, [["ab", "ab", "ba"]]);
});
test("groupAnagrams: no anagrams", () => {
  const result = groupAnagrams(["abc", "def", "ghi"]);
  assert.strictEqual(result.length, 3);
});

// longestConsecutiveSequence
test("longestConsecutiveSequence: classic", () => {
  assert.strictEqual(longestConsecutiveSequence([100, 4, 200, 1, 3, 2]), 4);
});
test("longestConsecutiveSequence: longer sequence", () => {
  assert.strictEqual(longestConsecutiveSequence([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), 9);
});
test("longestConsecutiveSequence: empty array", () => {
  assert.strictEqual(longestConsecutiveSequence([]), 0);
});
test("longestConsecutiveSequence: single element", () => {
  assert.strictEqual(longestConsecutiveSequence([1]), 1);
});
test("longestConsecutiveSequence: all duplicates", () => {
  assert.strictEqual(longestConsecutiveSequence([1, 1, 1, 1]), 1);
});
test("longestConsecutiveSequence: negative numbers", () => {
  assert.strictEqual(longestConsecutiveSequence([-3, -2, -1, 0, 1]), 5);
});
test("longestConsecutiveSequence: no consecutive", () => {
  assert.strictEqual(longestConsecutiveSequence([1, 3, 5, 7]), 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
