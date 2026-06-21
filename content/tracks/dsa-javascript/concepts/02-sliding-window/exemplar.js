// Run: node exemplar.js

/**
 * Returns the length of the longest substring with all unique characters.
 * Variable-size window; Map stores last-seen index for O(1) left-jump.
 * O(n) time, O(min(n, charset)) space.
 * @param {string} s
 * @returns {number}
 */
function longestUniqueSubstring(s) {
  const lastSeen = new Map();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1; // jump past the duplicate
    }
    lastSeen.set(c, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

/**
 * Returns the maximum sum of any contiguous subarray of exactly k elements.
 * Fixed-size window: slide by adding right element and subtracting dropped left.
 * O(n) time, O(1) space.
 * @param {number[]} nums
 * @param {number} k
 * @returns {number}
 */
function maxSumSubarray(nums, k) {
  if (nums.length < k) return 0;
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];
  let maxSum = windowSum;
  for (let right = k; right < nums.length; right++) {
    windowSum += nums[right] - nums[right - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}

/**
 * Returns the shortest substring of s that contains all characters in t
 * (with correct multiplicity). Returns "" if no valid window exists.
 *
 * Strategy:
 *   - Build a frequency map for t (need).
 *   - Expand right; when a char reaches its required frequency, increment formed.
 *   - When formed === need.size, record the window then shrink left.
 *
 * O(|s| + |t|) time, O(|s| + |t|) space.
 * @param {string} s
 * @param {string} t
 * @returns {string}
 */
function minWindowSubstring(s, t) {
  if (!t.length) return "";

  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);

  const window = new Map();
  let formed = 0; // distinct chars whose count in window >= required count
  let left = 0, minLen = Infinity, minStart = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c) ?? 0) + 1);
    // Check if this char's frequency just met the requirement
    if (need.has(c) && window.get(c) === need.get(c)) formed++;

    // Shrink from left while the window is valid
    while (formed === need.size) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }
      const lc = s[left++];
      window.set(lc, window.get(lc) - 1);
      if (need.has(lc) && window.get(lc) < need.get(lc)) formed--;
    }
  }

  return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}

module.exports = { longestUniqueSubstring, maxSumSubarray, minWindowSubstring };

function main() {
  console.log(longestUniqueSubstring("abcabcbb")); // 3
  console.log(maxSumSubarray([2, 1, 5, 1, 3, 2], 3)); // 9
  console.log(minWindowSubstring("ADOBECODEBANC", "ABC")); // "BANC"
}

main();
