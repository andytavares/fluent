// Run: tsx stub.ts

// Returns the length of the longest substring with all unique characters.
export function longestUniqueSubstring(s: string): number {
  // TODO: use a Map<string, number> tracking each char's last-seen index
  // When a duplicate is found inside the window, jump left past it
  return 0;
}

// Returns the maximum sum of any contiguous subarray of exactly k elements.
// Return 0 if nums.length < k.
export function maxSumSubarray(nums: number[], k: number): number {
  // TODO: build the first window, then slide — add nums[right], subtract nums[right-k]
  return 0;
}

// Returns the minimum window substring of s that contains every character
// (with duplicates) from t. Return "" if no such window exists.
export function minWindowSubstring(s: string, t: string): string {
  // TODO: frequency map for t; expand right, shrink left when all chars satisfied
  return "";
}

// Usage examples (uncomment to test manually):
// console.log(longestUniqueSubstring("abcabcbb"));           // 3
// console.log(maxSumSubarray([2,1,5,1,3,2], 3));             // 9
// console.log(minWindowSubstring("ADOBECODEBANC", "ABC"));   // "BANC"
