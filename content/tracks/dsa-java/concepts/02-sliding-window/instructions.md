# Sliding Window

## What you'll learn

How to process contiguous subarrays or substrings in O(n) by reusing work from the previous window position instead of recomputing from scratch. Two flavors: fixed-size and variable-size.

## Key concepts

### Fixed-size window — max sum of k elements

Seed the first window, then slide: add the incoming element, drop the outgoing element.

```java
int sum = 0;
for (int i = 0; i < k; i++) sum += nums[i];
int max = sum;
for (int right = k; right < nums.length; right++) {
    sum += nums[right] - nums[right - k]; // O(1) slide
    max = Math.max(max, sum);
}
return max;
```

### Variable-size window — longest substring without repeating characters

Expand `right` freely; jump `left` forward whenever a duplicate enters the window.

```java
var seen = new HashMap<Character, Integer>(); // char -> last seen index
int left = 0, best = 0;
for (int right = 0; right < s.length(); right++) {
    char c = s.charAt(right);
    if (seen.containsKey(c) && seen.get(c) >= left) {
        left = seen.get(c) + 1; // jump left past the duplicate
    }
    seen.put(c, right);
    best = Math.max(best, right - left + 1);
}
return best;
```

### Variable-size window with frequency tracking — minimum window substring

The hardest sliding-window variant. Track how many characters in `t` are *satisfied* (count in window >= count in t). Shrink from the left once all are satisfied.

```java
// Build required frequency map from t
var need = new HashMap<Character, Integer>();
for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

var window = new HashMap<Character, Integer>();
int left = 0, formed = 0, required = need.size();
int bestLen = Integer.MAX_VALUE, bestLeft = 0;

for (int right = 0; right < s.length(); right++) {
    char c = s.charAt(right);
    window.merge(c, 1, Integer::sum);
    // Did this character's count reach the required amount?
    if (need.containsKey(c) && window.get(c).equals(need.get(c))) formed++;

    // Shrink from left while all required characters are satisfied
    while (formed == required) {
        if (right - left + 1 < bestLen) {
            bestLen = right - left + 1;
            bestLeft = left;
        }
        char lc = s.charAt(left++);
        window.merge(lc, -1, Integer::sum);
        if (need.containsKey(lc) && window.get(lc) < need.get(lc)) formed--;
    }
}
return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestLeft, bestLeft + bestLen);
```

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `maxSumSubarray` | O(n) | O(1) | Each element added/removed exactly once |
| `longestUniqueSubstring` | O(n) | O(min(n,a)) | One pass; map bounded by alphabet size a |
| `minWindowSubstring` | O(s + t) | O(s + t) | Each char enters/leaves window once; two freq maps |

## Common variations this pattern solves

1. **Max consecutive ones III** — variable window; shrink when zero-count exceeds k
2. **Permutation in String** — fixed window of size `p.length()`; compare freq maps
3. **Fruits into Baskets** — variable window; at most 2 distinct values
4. **Substring with Concatenation of All Words** — fixed window of `word.length * words.length`

## vs other languages

Python's `collections.Counter` makes frequency maps trivial. In Java, use `HashMap<Character, Integer>` with `merge(key, 1, Integer::sum)` — that's the idiomatic one-liner for incrementing a count (avoids a null check).

Go uses `map[byte]int` which auto-initializes to zero; Java does not — always use `getOrDefault` or `merge`.

## Watch out

- **`window.get(lc) < need.get(lc)` integer comparison**: `window.get(lc)` returns `Integer` (boxed). Comparing two `Integer` objects with `<` or `>` works correctly because Java unboxes them for numeric comparison. But `==` would compare references — use `.equals()` for equality.
- **`formed` tracking**: increment `formed` only when the count exactly reaches the required amount (`window.get(c).equals(need.get(c))`), not every time it increases. Otherwise a character present 3 times in `s` but once in `t` would increment `formed` three times.
- **Empty `t`**: if `t` is empty, `need` is empty, `required == 0`, `formed == 0 == required` on the first iteration — handle by returning `""` or the full string depending on the spec.
- **Integer overflow**: `maxSumSubarray` with large `k` and large values can overflow `int`. Use `long` sum if constraints allow values near `Integer.MAX_VALUE`.

## FAANG follow-up questions

> "Can minWindowSubstring be done in O(s) space instead of O(s + t)?" — The two maps are O(alphabet), not O(s + t), since characters are bounded by the alphabet size. So it's O(1) space for ASCII inputs.
>
> "What if the window must contain characters in order (not just frequency)?" — Sliding window no longer applies; switch to two-pointer with a pointer into `t`, or dynamic programming.
>
> "How would you find ALL minimum windows, not just one?" — Track all windows whose length equals `bestLen`; return a list.
>
> "What's the tradeoff between the jump-left approach in longestUniqueSubstring vs the shrink-left loop?" — Jump-left is O(n) and easier to reason about for this specific problem. The shrink-left loop is more general and works for any variable-window constraint.

## The task

Implement three methods in `Solution`:

```java
// Returns the length of the longest substring with all unique characters.
// "abcabcbb" -> 3, "bbbbb" -> 1, "" -> 0
public static int longestUniqueSubstring(String s)

// Returns the maximum sum of any contiguous subarray of exactly k elements.
// nums.length >= k, k >= 1
// [2,1,5,1,3,2], k=3 -> 9
public static int maxSumSubarray(int[] nums, int k)

// Returns the minimum window substring of s that contains all characters of t.
// If no such window exists, return "".
// s="ADOBECODEBANC", t="ABC" -> "BANC"
public static String minWindowSubstring(String s, String t)
```
