// Run: node stub.js

/**
 * Returns the length of the longest substring with all unique characters.
 * @param {string} s
 * @returns {number}
 */
function longestUniqueSubstring(s) {
  // TODO: variable-size window; Map tracks last-seen index for O(1) left-jump
  return 0;
}

/**
 * Returns the maximum sum of any contiguous subarray of exactly k elements.
 * @param {number[]} nums
 * @param {number} k
 * @returns {number}
 */
function maxSumSubarray(nums, k) {
  // TODO: compute first window sum, then slide: add nums[right], subtract nums[right-k]
  return 0;
}

/**
 * Returns the shortest substring of s containing every character of t
 * (including duplicates). Return "" if no valid window exists.
 * @param {string} s
 * @param {string} t
 * @returns {string}
 */
function minWindowSubstring(s, t) {
  // TODO: build need map from t; expand right until formed === need.size;
  // then shrink left as far as possible while still valid; track min window
  return "";
}

module.exports = { longestUniqueSubstring, maxSumSubarray, minWindowSubstring };

function main() {
  console.log(longestUniqueSubstring("abcabcbb")); // 3
  console.log(maxSumSubarray([2, 1, 5, 1, 3, 2], 3)); // 9
  console.log(minWindowSubstring("ADOBECODEBANC", "ABC")); // "BANC"
}

main();
