// Run: tsx stub.ts

/**
 * Returns the length of the shortest contiguous subarray with sum >= target,
 * or 0 if none exists. nums contains only positive integers.
 */
function minSubArrayLen(target: number, nums: number[]): number {
  // TODO: expand right, adding nums[right] to a running sum;
  // while sum >= target, record right - left + 1 and shrink from the left
  return 0;
}

/**
 * Returns the length of the longest substring without repeating characters.
 */
function lengthOfLongestSubstring(s: string): number {
  // TODO: Map of char -> last-seen index; on a duplicate at index >= left,
  // jump left past it (the >= left guard stops backwards moves — "abba")
  return 0;
}

/**
 * Returns the shortest substring of s containing every character of t
 * (duplicates included), or "" if no such window exists.
 */
function minWindow(s: string, t: string): string {
  // TODO: need map from t; expand right updating window counts and a formed
  // counter (formed++ only when a count reaches its requirement);
  // while formed === need.size, record the window and shrink from the left;
  // track bestStart/bestLen and slice once at the end
  return "";
}

export { minSubArrayLen, lengthOfLongestSubstring, minWindow };

function main() {
  console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3])); // 2
  console.log(lengthOfLongestSubstring("abcabcbb")); // 3
  console.log(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
}

main();
