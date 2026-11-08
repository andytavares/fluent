## What you build

You write three linear-time window functions: `minSubArrayLen`, `lengthOfLongestSubstring` and `minWindow`. A sliding window is a `[left, right]` range that grows on the right and shrinks on the left. It updates its state in O(1) per move instead of a full recompute. This lesson builds on **Two Pointers**.

## Key concepts

### The window costs O(n) in total

A window is a contiguous range `s[left..right]`. `right` advances n times and `left` advances at most n times. So the total work is O(n), even though the inner shrink loop looks nested. This holds only when the window state, such as a sum or a count map, absorbs one element in O(1).

### The window condition must be monotone

A sliding window works when the condition on windows is monotone. Growth never makes an "at least" condition worse, because a sum of positive values only grows. Shrinking never makes an "all distinct" condition worse. If one new element can both help and hurt, as with negative numbers in a sum, the shrink step fails. Then you need another tool, such as prefix sums or a deque.

### Shrink while valid to minimize the window

For "shortest subarray that meets X", expand `right` until the window meets X. Then shrink from the left while it still meets X. Record the best length at every valid shape.

```java
// n is nums.length.
int left = 0, sum = 0;
int best = Integer.MAX_VALUE;
for (int right = 0; right < n; right++) {
  // Expand: absorb nums[right].
  sum += nums[right];
  // Valid: try a shorter window.
  while (sum >= target) {
    best =
      Math.min(best, right - left + 1);
    // Shrink: remove nums[left].
    sum -= nums[left++];
  }
}
```

After the `while` loop, the window is the largest invalid window that ends at `right`. So you measured every valid window at its tightest.

### Grow, then repair, to maximize the window

For "longest substring that meets X", expand `right` on every step. When the new character breaks the rule, move `left` only as far as the repair needs. A map of last-seen indexes makes the repair one jump instead of a loop.

```java
// n is s.length().
// char -> index of latest occurrence
Map<Character, Integer> lastSeen =
  new HashMap<>();
int left = 0, best = 0;
for (int right = 0; right < n; right++) {
  char c = s.charAt(right);
  Integer seen = lastSeen.get(c);
  if (seen != null && seen >= left) {
    // Jump past the duplicate.
    left = seen + 1;
  }
  lastSeen.put(c, right);
  best =
    Math.max(best, right - left + 1);
}
```

The `>= left` guard is essential. An old occurrence behind the window must not pull `left` backwards. That move readmits duplicates the window already removed.

### The need, window and formed state tracks coverage

Sometimes "valid" means "covers every character of `t`, duplicates included". Track that with two maps and one counter:

- `need`: the required count for each character of `t`. You build it once.
- `window`: the current count for each needed character inside the window.
- `formed`: how many distinct characters meet their required count now.

The window is valid exactly when `formed == need.size()`. Both maps update in O(1) per character that enters or leaves. `formed` increments when a count reaches `need.get(c)`, and decrements when a count drops below it. A full map comparison on every step costs O(alphabet) per move. The `formed` counter keeps the pass linear.

### A fixed-size window has no shrink decision

Some windows have a fixed length, such as the largest sum of `k` elements. To slide, add the entering element and subtract the leaving one. Substring with Concatenation of All Words is a hybrid. Its window slides in word-sized steps, so you run one pass per start offset `0..wordLen-1`.

### Complexity of the catalog problems

| Problem | Time | Space | Form |
|---------|------|-------|------|
| Minimum Size Subarray Sum | O(n) | O(1) | shrink while valid |
| Longest Substring Without Repeating Characters | O(n) | O(min(n, alphabet)) | grow, then repair |
| Substring with Concatenation of All Words | O(n · wordLen) | O(#words) | fixed-size, word steps |
| Minimum Window Substring | O(\|s\| + \|t\|) | O(alphabet of t) | shrink while valid + `formed` |

## Watch out

- The window length is `right - left + 1`. A missing `+ 1` is the classic off-by-one of this pattern.
- To minimize, record the best inside the shrink loop. To maximize, record it after the repair.
- Without the `>= left` guard, `"abba"` moves `left` backwards at the last `'a'`. You then report an impossible window.
- Minimum Size Subarray Sum needs positive numbers. With negative values, the sum is not monotone and the shrink step fails.
- For negative values, say so in the interview. The follow-up answer is prefix sums with a monotonic deque.
- Minimum Window Substring returns the substring, not its length. Track `bestStart` and `bestLen`, and call `substring` once at the end.
- A `substring` call inside the loop turns O(n) into O(n²).
- `formed` counts satisfied distinct characters, not total matches. Change it only when a count crosses its requirement.
- Start the best length at `Integer.MAX_VALUE`. Convert it to `0` or `""` at the end, not inside the loop.
- `Map<Character, Integer>.get` returns a boxed `Integer`. `==` on two `Integer` objects outside `[-128, 127]` compares references, so use `.equals()` or unbox first.

## Problem walkthroughs

### Minimum Size Subarray Sum ★

**Problem.** Given an array of positive integers `nums` and an integer `target`, return the length of the shortest contiguous subarray with a sum `>= target`. Return `0` if no such subarray exists.

**Example.**

```text
target 7, [2,3,1,2,4,3] -> 2 ([4,3])
target 11, [1,1,1,1,1] -> 0
(the total is only 5)
```

**Steps.**
1. Keep `left = 0`, a running `sum = 0` and `best = Integer.MAX_VALUE`.
2. For each `right`, add `nums[right]` to `sum`.
3. While `sum >= target`, record `best = Math.min(best, right - left + 1)`. Then subtract `nums[left]` and advance `left`. You measure every valid shape, the tightest last.
4. Return `best == Integer.MAX_VALUE ? 0 : best`.
5. The shrink is safe because all values are positive. A removal from the left always lowers the sum. After the window goes invalid, only an expansion on the right can make it valid again.

**Complexity.** O(n) time / O(1) space. `left` and `right` each cross the array once.

### Longest Substring Without Repeating Characters ★

**Problem.** Given a string `s`, return the length of the longest contiguous substring with no repeated character.

**Example.**

```text
"abcabcbb" -> 3 ("abc")
"bbbbb"    -> 1 ("b")
"pwwkew"   -> 3 ("wke")
```

In `"pwwkew"`, the answer is a substring, not a subsequence.

**Steps.**
1. Keep a `HashMap` from each character to the index of its latest occurrence. Set `left = 0` and `best = 0`.
2. For each `right`, check whether `s.charAt(right)` occurs at an index `>= left`, inside the current window. If it does, jump `left` to that index + 1. No window without duplicates that holds `s.charAt(right)` can include the earlier positions.
3. Put `s.charAt(right) -> right` in the map, then fold `right - left + 1` into `best`.
4. The `>= left` check matters. In `"abba"`, at the last `'a'` the map says index 0, but `left` is already 2. A move back to 1 readmits the duplicate `'b'`. Ignore old entries outside the window; do not clean them up.

**Complexity.** O(n) time / O(min(n, alphabet)) space. One pass, one map entry per distinct character.

### Substring with Concatenation of All Words

**Problem.** You get a string `s` and an array `words`. All words have the same length. Return every start index of a substring of `s` that concatenates all the words. Each word appears as often as it does in `words`, in any order.

**Example.**

```text
s = "barfoothefoobarman"
words = ["foo","bar"] -> [0, 9]
("barfoo" at 0, "foobar" at 9)
```

**Steps.**
1. Let `wordLen = words[0].length()` and `windowLen = wordLen * words.length`. Build `need`: each word and its required count.
2. A match can start at any index, but it splits into word-sized chunks from its own offset mod `wordLen`. So run `wordLen` separate sliding passes, one per start offset `0..wordLen - 1`.
3. In a pass, read `s` as a sequence of tokens of length `wordLen`. Keep a window count map and a word count.
4. For each token at `right`, check whether it is in `need`. If it is not, reset the window: clear the map and jump `left` past the token. No concatenation can span it.
5. If it is a needed word, add it. While its count exceeds `need`, evict tokens from the left, one at a time.
6. When the window holds exactly `words.length` tokens, record `left`. Then evict one token to keep sliding.
7. This is the shrink form, applied to tokens instead of characters. Each pass handles O(n / wordLen) tokens, and each token enters and leaves once.

**Complexity.** O(n · wordLen) time / O(#distinct words) space. Each of the `wordLen` passes does O(n/wordLen) token operations, and each slice or hash costs O(wordLen).

### Minimum Window Substring ★

**Problem.** Given strings `s` and `t`, return the shortest substring of `s` that contains every character of `t`, duplicates included. If `t = "AABC"`, the window needs two `A`s. Return `""` if no such window exists. When the answer exists, it is unique.

**Example.**

```text
"ADOBECODEBANC", "ABC" -> "BANC"
"a", "aa" -> ""
```

**Steps.**
1. Build `need` from `t`: each character and its required count. Keep `window` (the counts inside the window), `formed = 0`, `left = 0`, `bestLen = Integer.MAX_VALUE` and `bestStart = 0`.
2. Expand: for each `right`, if `s.charAt(right)` is a needed character, increment its `window` count. When that count reaches `need.get(c)` exactly, increment `formed`.
3. While `formed == need.size()`, the window covers all of `t`. Record the window if `right - left + 1 < bestLen`.
4. Then remove `s.charAt(left)`. If it is a needed character, decrement its count. If the count drops below the requirement, decrement `formed`, which ends the shrink loop.
5. After the pass, return `bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen)`. Call `substring` exactly once.
6. Invariant: when the shrink loop ends, the window lacks at least one required character. So you measured every minimal valid window when its left edge became necessary.

**Complexity.** O(|s| + |t|) time / O(alphabet of t) space. Each character of `s` enters and leaves the window at most once, with O(1) map work per move.

## Interview follow-ups

After Minimum Size Subarray Sum:
- "What if `nums` has negative values?" The window fails, because the sum is not monotone. Use prefix sums with a monotonic deque, O(n).
- "Sum exactly equal to target?" With positive values, the same window works: check `sum == target` when valid. With any integers, use a prefix-sum hash map.
- "An O(n log n) alternative?" Use prefix sums and a binary search for the smallest end index. The problem statement itself hints at this follow-up.

After Longest Substring Without Repeating Characters:
- "At most k distinct characters instead of all distinct?" Use the same skeleton with a count map, and shrink while `map.size() > k`.
- "Return the substring, not the length?" Track the best window's start, and call `substring` once at the end.

After Minimum Window Substring:
- "Why not compare `window` with `need` on each step?" That costs O(alphabet) per step. `formed` makes the validity check O(1).
- "What if the stream does not fit in memory?" The algorithm already reads `s` once, left to right. Keep a bounded buffer of the window's text.

## The task

You write three window functions: one minimizes with a sum, one maximizes with uniqueness, one minimizes with coverage. Each must run in linear time. The test-out suite uses larger inputs to catch a full window rescan on each step.

1. `int minSubArrayLen(int target, int[] nums)` takes positive integers `nums` and a positive integer `target`.
2. It returns the length of the shortest contiguous subarray with a sum of at least `target`.
3. It returns `0` when no subarray reaches `target`. Use O(n) time and O(1) space.
4. `int lengthOfLongestSubstring(String s)` returns the length of the longest contiguous substring of `s` with no repeated character.
5. The comparison is case-sensitive. Letters, digits, spaces and symbols all count as characters. Use O(n) time.
6. `String minWindow(String s, String t)` returns the shortest substring of `s` that contains every character of `t`.
7. Duplicates count: if `t` has two `'a'`s, the window needs at least two `'a'`s.
8. `minWindow` returns `""` when no such window exists, which includes `t` longer than `s`.
9. When a valid window exists, it is unique. Target O(|s| + |t|) time.

Edge cases:

- `minSubArrayLen`: a single element `>= target` gives 1. Handle a whole array that sums to exactly `target`. No valid subarray, or an empty array, gives 0.
- `lengthOfLongestSubstring`: an empty string gives 0. A single character gives 1. Handle all characters the same and all distinct.
- `lengthOfLongestSubstring`: in `"abba"`-style input, an old last-seen index must not move the window backwards.
- `minWindow`: handle `t` longer than `s`, no valid window and the whole of `s` as the only window.
- `minWindow`: handle duplicates in `t`, a minimal window at either end and characters of `s` that `t` lacks.

```java
minSubArrayLen(7,
  new int[]{2, 3, 1, 2, 4, 3});  // 2
minSubArrayLen(4, new int[]{1, 4, 4});
// 1
minSubArrayLen(6, new int[]{1, 2, 3});
// 3
minSubArrayLen(6, new int[]{5});  // 0
minSubArrayLen(1, new int[]{});   // 0

lengthOfLongestSubstring("abcabcbb"); // 3
lengthOfLongestSubstring("bbbbb");    // 1
lengthOfLongestSubstring("pwwkew");   // 3
lengthOfLongestSubstring("abba");     // 2
lengthOfLongestSubstring("");         // 0

minWindow("ADOBECODEBANC", "ABC");
// "BANC"
minWindow("a", "a");    // "a"
minWindow("a", "aa");   // ""
minWindow("aa", "aa");  // "aa"
minWindow("abc", "d");  // ""
```
