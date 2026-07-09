// Run: node exemplar.js

/**
 * Returns true if t is an anagram of s (same characters, same multiplicities).
 * Count up over s, count down over t; with equal lengths, "never goes
 * negative" implies every count ends at exactly zero.
 * O(n) time, O(k) space for the alphabet used.
 * @param {string} s
 * @param {string} t
 * @returns {boolean}
 */
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = new Map();
  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1);
  for (const c of t) {
    const n = counts.get(c);
    if (!n) return false; // missing or already zero
    counts.set(c, n - 1);
  }
  return true;
}

/**
 * Groups anagrams by canonical key: the sorted string. Anagrams — and only
 * anagrams — share a key, so each bucket is exactly one group.
 * O(n · k log k) time, O(n · k) space.
 * @param {string[]} strs
 * @returns {string[][]}
 */
function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = [...s].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}

/**
 * Returns the 0-based indexes [i, j] (i < j) of the pair summing to target.
 * Check the complement before inserting the current value — that's what
 * prevents pairing an element with itself while allowing duplicates.
 * O(n) time, O(n) space.
 * @param {number[]} nums  unsorted, exactly one solution
 * @param {number} target
 * @returns {number[]}
 */
function twoSum(nums, target) {
  const seen = new Map(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return []; // unreachable given the "exactly one solution" guarantee
}

/**
 * Returns the length of the longest run of consecutive integer values.
 * The run-start guard (skip n when n - 1 is present) means each run is
 * walked exactly once from its unique start — that's the O(n) proof.
 * O(n) time, O(n) space.
 * @param {number[]} nums
 * @returns {number}
 */
function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const n of set) {
    if (set.has(n - 1)) continue; // mid-run — its start will count it
    let len = 1;
    while (set.has(n + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}

module.exports = { isAnagram, groupAnagrams, twoSum, longestConsecutive };

function main() {
  console.log(isAnagram("anagram", "nagaram")); // true
  console.log(JSON.stringify(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])));
  // [["eat","tea","ate"],["tan","nat"],["bat"]] (any order)
  console.log(JSON.stringify(twoSum([2, 7, 11, 15], 9))); // [0,1]
  console.log(longestConsecutive([100, 4, 200, 1, 3, 2])); // 4
}

main();
