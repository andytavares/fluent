// Run: node exemplar.js

/**
 * Returns the length of the shortest contiguous subarray with sum >= target,
 * or 0 if none exists. Shrink-while-valid: positives make the sum monotone,
 * so once the window goes invalid only expanding right can revive it.
 * O(n) time, O(1) space.
 * @param {number} target
 * @param {number[]} nums  positive integers
 * @returns {number}
 */
function minSubArrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}

/**
 * Returns the length of the longest substring without repeating characters.
 * Grow-then-repair: a last-seen-index map turns the repair into a single
 * left-jump; the >= left guard ignores stale entries behind the window.
 * O(n) time, O(min(n, alphabet)) space.
 * @param {string} s
 * @returns {number}
 */
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map(); // char -> index of latest occurrence
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1; // jump past the in-window duplicate
    }
    lastSeen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

/**
 * Returns the shortest substring of s containing every character of t
 * (duplicates included), or "" if no such window exists.
 * need/window/formed machinery: formed counts distinct characters at their
 * required frequency, making the validity check O(1) per move.
 * O(|s| + |t|) time, O(alphabet of t) space.
 * @param {string} s
 * @param {string} t
 * @returns {string}
 */
function minWindow(s, t) {
  if (t.length === 0 || t.length > s.length) return "";

  const need = new Map(); // char -> required count
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);

  const window = new Map(); // char -> count inside the window
  let formed = 0; // distinct chars currently at required frequency
  let left = 0;
  let bestLen = Infinity;
  let bestStart = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (need.has(c)) {
      const count = (window.get(c) ?? 0) + 1;
      window.set(c, count);
      if (count === need.get(c)) formed++;
    }

    while (formed === need.size) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const out = s[left++];
      if (need.has(out)) {
        const count = window.get(out) - 1;
        window.set(out, count);
        if (count < need.get(out)) formed--;
      }
    }
  }

  return bestLen === Infinity ? "" : s.slice(bestStart, bestStart + bestLen);
}

module.exports = { minSubArrayLen, lengthOfLongestSubstring, minWindow };

function main() {
  console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3])); // 2
  console.log(lengthOfLongestSubstring("abcabcbb")); // 3
  console.log(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
}

main();
