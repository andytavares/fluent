# Sliding Window

## What you'll learn

How to process contiguous subarrays or substrings in O(n) by maintaining two indices that define a "window" — expanding the right edge and shrinking the left edge only when the window violates a constraint. You'll implement three problems: longest unique substring, max sum subarray of size k, and minimum window substring.

## Key concepts

### Variable-size window

Grow until invalid, shrink until valid. Every element enters and exits the window at most once, so the total work across both pointers is O(n) even with a nested `while`.

```typescript
function longestUniqueSubstring(s: string): number {
  // Map from character → its most-recent index in the string
  const lastSeen = new Map<string, number>();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];

    // If ch was seen inside the current window, jump left past it
    if (lastSeen.has(ch) && lastSeen.get(ch)! >= left) {
      left = lastSeen.get(ch)! + 1;
    }

    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```

### Fixed-size window

When the window size is fixed at k, slide both edges together: add `nums[right]`, subtract `nums[right - k]`.

```typescript
function maxSumSubarray(nums: number[], k: number): number {
  if (nums.length < k) return 0;

  // Build the first window
  let windowSum = nums.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum;

  for (let right = k; right < nums.length; right++) {
    // Slide: add incoming element, remove outgoing element
    windowSum += nums[right] - nums[right - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
```

### Multi-constraint window (Minimum Window Substring)

Track how many distinct characters from `t` are fully satisfied in the window. Only shrink once all are satisfied.

```typescript
function minWindowSubstring(s: string, t: string): string {
  if (s.length === 0 || t.length === 0) return "";

  const need = new Map<string, number>();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);

  const have = new Map<string, number>();
  let formed = 0;               // how many chars in t are satisfied
  const required = need.size;  // distinct chars in t

  let left = 0;
  let minLen = Infinity;
  let minStart = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    have.set(ch, (have.get(ch) ?? 0) + 1);

    // Check if adding ch just satisfied its requirement
    if (need.has(ch) && have.get(ch) === need.get(ch)) formed++;

    // Shrink while the window is valid
    while (formed === required) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }
      const leftCh = s[left];
      have.set(leftCh, have.get(leftCh)! - 1);
      if (need.has(leftCh) && have.get(leftCh)! < need.get(leftCh)!) formed--;
      left++;
    }
  }
  return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}
```

## Complexity

| Problem | Time | Space | Notes |
|---------|------|-------|-------|
| `longestUniqueSubstring` | O(n) | O(min(n, charset)) | Map stores at most charset-size entries |
| `maxSumSubarray` | O(n) | O(1) | Pure arithmetic sliding |
| `minWindowSubstring` | O(s + t) | O(s + t) | Two maps of bounded size |

## Common variations

- **Longest substring with at most K distinct characters** — variable window, shrink when `map.size > k`
- **Permutation in string** — fixed window of length `t.length`, check if window anagram matches `t`
- **Fruit into baskets** — variable window, at most 2 distinct values
- **Maximum consecutive ones III** — variable window, count flipped zeros

## vs other languages

Python's `collections.Counter` makes the frequency bookkeeping more compact, but the algorithm is identical. In Go, you'd use `map[rune]int`. TypeScript's `Map<string, number>` is the right tool — plain objects work but have prototype pollution risk and no `.size`.

## Watch out

- **`lastSeen.get(ch)! >= left`**: you must check that the last-seen index is inside the current window. Without this guard, a character seen before the window started would incorrectly collapse the window. This is the most common bug in this problem.
- **`minWindowSubstring` with duplicate chars in `t`**: `need` must count frequencies, not just presence. `"AA"` requires two A's in the window.
- **Empty `t`**: return `""` immediately. The `required` variable would be 0, causing `formed === required` immediately and the inner while would fire on every step.
- **TypeScript non-null assertion**: `lastSeen.get(ch)!` is safe here because the `has` check guards it, but if you refactor and remove the `has`, the `!` will silently return `undefined` at runtime.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "What if `t` contains characters not in `s`?" (`minWindowSubstring` returns `""` — covered by `formed` never reaching `required`.)
> - "Can you do `longestUniqueSubstring` in O(n) without a Map?" (Yes — use an array of size 128/256 as a character frequency table for ASCII.)
> - "How would you handle a Unicode string?" (Need `Map<string, number>` — array indices break for non-ASCII. Also, JS strings are UTF-16: surrogate pairs require `[...s]` iteration instead of `s[i]`.)
> - "What is the worst-case space for `minWindowSubstring`?" (O(|s| + |t|) in the absolute worst case where every character is unique.)

## The task

Implement three functions:

```typescript
// Returns the length of the longest substring with all unique characters.
// "abcabcbb" → 3  ("abc")
// "bbbbb"    → 1  ("b")
// ""         → 0
function longestUniqueSubstring(s: string): number

// Returns the maximum sum of any contiguous subarray of exactly k elements.
// nums=[2,1,5,1,3,2], k=3 → 9  (5+1+3)
// nums shorter than k   → 0
function maxSumSubarray(nums: number[], k: number): number

// Returns the minimum window in s that contains all characters of t
// (including duplicates). If no such window, return "".
// s="ADOBECODEBANC", t="ABC" → "BANC"
// s="a", t="aa"              → ""
function minWindowSubstring(s: string, t: string): string
```
