// Run: node exemplar.js

/**
 * Returns indices [i, j] of two numbers that add up to target.
 * Insert into map AFTER checking — handles duplicate values like [3,3].
 * O(n) time, O(n) space.
 * @param {number[]} nums
 * @param {number} target
 * @returns {number[]}
 */
function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
}

/**
 * Groups anagrams together. Uses sorted characters as canonical key.
 * O(n * k log k) time, O(n * k) space, where k = average word length.
 * @param {string[]} words
 * @returns {string[][]}
 */
function groupAnagrams(words) {
  const map = new Map();
  for (const word of words) {
    const key = [...word].sort().join("");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(word);
  }
  return [...map.values()];
}

/**
 * Returns the length of the longest consecutive sequence.
 * Only start counting from numbers with no predecessor in the set.
 * Each number is visited at most twice total — O(n) time, O(n) space.
 * @param {number[]} nums
 * @returns {number}
 */
function longestConsecutiveSequence(nums) {
  const set = new Set(nums); // O(1) lookup
  let best = 0;
  for (const n of set) {
    if (set.has(n - 1)) continue; // skip: not the start of a sequence
    let len = 1;
    while (set.has(n + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}

module.exports = { twoSum, groupAnagrams, longestConsecutiveSequence };

function main() {
  console.log(twoSum([2, 7, 11, 15], 9));                                    // [0, 1]
  console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));    // grouped
  console.log(longestConsecutiveSequence([100, 4, 200, 1, 3, 2]));           // 4
}

main();
