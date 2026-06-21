// Run: node stub.js

/**
 * Returns indices [i, j] of two numbers that add up to target.
 * @param {number[]} nums
 * @param {number} target
 * @returns {number[]}
 */
function twoSum(nums, target) {
  // TODO: iterate nums, store complement -> index in a Map
  // if the complement of the current value exists in the map, return indices
  return [];
}

/**
 * Groups anagrams together. Returns an array of groups.
 * @param {string[]} words
 * @returns {string[][]}
 */
function groupAnagrams(words) {
  // TODO: sort each word's characters to get a canonical key
  // group words by key using a Map
  return [];
}

/**
 * Returns the length of the longest consecutive sequence in an unsorted array.
 * Must run in O(n).
 * @param {number[]} nums
 * @returns {number}
 */
function longestConsecutiveSequence(nums) {
  // TODO: put all nums into a Set
  // for each n where n-1 is NOT in the set (sequence start), count forward
  return 0;
}

module.exports = { twoSum, groupAnagrams, longestConsecutiveSequence };

function main() {
  console.log(twoSum([2, 7, 11, 15], 9));                                    // [0, 1]
  console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));    // grouped
  console.log(longestConsecutiveSequence([100, 4, 200, 1, 3, 2]));           // 4
}

main();
