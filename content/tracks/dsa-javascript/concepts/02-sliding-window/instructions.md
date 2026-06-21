# Sliding Window

## What you'll learn

Fixed-size and variable-size sliding window patterns, and the more advanced "shrink until valid" form used in minimum window substring — a problem that shows up verbatim in FAANG interviews.

## Key concepts

Sliding window avoids recomputing a contiguous subarray from scratch. Each element enters the window exactly once and exits at most once, giving O(n) regardless of window content.

### Fixed-size window

Add the incoming right element, subtract the outgoing left element:

```js
// max sum of any window of size k
let windowSum = 0;
for (let i = 0; i < k; i++) windowSum += nums[i];
let maxSum = windowSum;

for (let right = k; right < nums.length; right++) {
  windowSum += nums[right] - nums[right - k]; // slide: add right, drop left
  maxSum = Math.max(maxSum, windowSum);
}
```

### Variable-size window — expand right, shrink left

```js
const seen = new Map(); // char -> last-seen index
let left = 0, maxLen = 0;

for (let right = 0; right < s.length; right++) {
  if (seen.has(s[right]) && seen.get(s[right]) >= left) {
    left = seen.get(s[right]) + 1; // jump past duplicate
  }
  seen.set(s[right], right);
  maxLen = Math.max(maxLen, right - left + 1);
}
```

### "At least / shrink until valid" — minimum window substring

The key insight: expand right until the window covers all required chars, then shrink left as far as possible while still covering them. Track coverage with a frequency map and a `formed` counter.

```js
const need = new Map();          // char -> required count
const window = new Map();        // char -> current count in window
let formed = 0;                  // how many chars are at required frequency
let left = 0, minLen = Infinity, minStart = 0;

for (let right = 0; right < s.length; right++) {
  const c = s[right];
  window.set(c, (window.get(c) ?? 0) + 1);
  if (need.has(c) && window.get(c) === need.get(c)) formed++;

  // shrink while window is valid
  while (formed === need.size) {
    if (right - left + 1 < minLen) { minLen = right - left + 1; minStart = left; }
    const lc = s[left++];
    window.set(lc, window.get(lc) - 1);
    if (need.has(lc) && window.get(lc) < need.get(lc)) formed--;
  }
}
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| longestUniqueSubstring | O(n) | O(min(n, charset)) |
| maxSumSubarray(k) | O(n) | O(1) |
| minWindowSubstring | O(|s| + |t|) | O(|s| + |t|) |

## Common variations

- **Longest substring with at most K distinct characters** — variable window with a map
- **Permutation in string** — fixed window, compare frequency maps
- **Fruit into baskets** — variable window with at most 2 distinct values
- **Subarrays with product less than K** — variable window on products

## vs other languages

Python's `collections.Counter` makes frequency maps trivial. In JavaScript you maintain a `Map` manually. The pattern is identical; the boilerplate differs.

## FAANG follow-up questions

After minWindowSubstring:
- "Can you do it without a `formed` counter?" (yes, track the difference count; when it's 0 the window is valid — more complex bookkeeping)
- "What if `t` has duplicates?" (the `formed` check using exact counts handles this; a common mistake is using a Set instead of a Map)
- "What's the output if there's no valid window?" (return empty string `""`)

After longestUniqueSubstring:
- "What if you allow at most k repeated characters?" (variable window; keep a frequency map, shrink when map size > k)

## Watch out

- **minWindowSubstring**: checking `window.get(c) === need.get(c)` exactly — not `>=` — is how `formed` tracks whether frequency is *met*, not exceeded. Exceeding is fine; you only care about the threshold crossing.
- **Fixed window**: compute the first window sum separately before the slide loop. Starting the slide loop at index `k` avoids an off-by-one on the first drop.
- **Variable window jump**: `left = seen.get(s[right]) + 1` jumps past the duplicate in O(1). Without the `>= left` guard you might jump left backward if the duplicate was before the current window.
- **Empty string edge case**: `longestUniqueSubstring("")` must return 0; `minWindowSubstring("a", "")` semantics vary — treat as return `""`.

## The task

### `longestUniqueSubstring(s)`

Return the length of the longest substring with no repeated characters.

```js
longestUniqueSubstring("abcabcbb") // 3
longestUniqueSubstring("bbbbb")    // 1
longestUniqueSubstring("")         // 0
```

### `maxSumSubarray(nums, k)`

Return the maximum sum of any contiguous subarray of exactly `k` elements.

```js
maxSumSubarray([2, 1, 5, 1, 3, 2], 3) // 9
maxSumSubarray([-1, -2, -3, -4], 2)   // -3
```

### `minWindowSubstring(s, t)`

Return the minimum window in `s` that contains every character of `t` (including duplicates). Return `""` if no such window exists.

```js
minWindowSubstring("ADOBECODEBANC", "ABC") // "BANC"
minWindowSubstring("a", "a")               // "a"
minWindowSubstring("a", "b")               // ""
minWindowSubstring("aa", "aa")             // "aa"
```

Use expand-right / shrink-left with a `formed` counter tracking when all required characters meet their frequency.
