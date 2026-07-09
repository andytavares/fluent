// Run: tsx stub.ts

/**
 * Returns true if t is an anagram of s (same characters, same multiplicities).
 */
function isAnagram(s: string, t: string): boolean {
  // TODO: lengths must match; count up over s, count down over t —
  // a missing/zero count during the count-down means false
  return false;
}

/**
 * Groups anagrams together. Group order and order within groups don't matter.
 */
function groupAnagrams(strs: string[]): string[][] {
  // TODO: Map keyed by each string's canonical form ([...s].sort().join(""));
  // push into the bucket, return [...map.values()]
  return [];
}

/**
 * Returns the 0-based indexes [i, j] (i < j) of the two positions summing to
 * target. Exactly one solution exists.
 * @param nums unsorted
 */
function twoSum(nums: number[], target: number): number[] {
  // TODO: Map value → index; check the complement BEFORE inserting nums[i]
  return [];
}

/**
 * Returns the length of the longest run of consecutive integer values.
 * @param nums unsorted, may contain duplicates
 */
function longestConsecutive(nums: number[]): number {
  // TODO: Set of all values; only count upward from run starts
  // (values with no n - 1 in the set) to stay O(n)
  return 0;
}

export { isAnagram, groupAnagrams, twoSum, longestConsecutive };

function main() {
  console.log(isAnagram("anagram", "nagaram")); // true
  console.log(JSON.stringify(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])));
  // [["eat","tea","ate"],["tan","nat"],["bat"]] (any order)
  console.log(JSON.stringify(twoSum([2, 7, 11, 15], 9))); // [0,1]
  console.log(longestConsecutive([100, 4, 200, 1, 3, 2])); // 4
}

main();
