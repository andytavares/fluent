# Sliding Window

## What you'll learn

The sliding window is the same-direction two-pointer pattern specialized for contiguous subarrays and substrings: a `[left, right]` window that expands on the right and shrinks on the left, with running state that updates in O(1) per move instead of being recomputed. You'll learn the two variable-size forms — *shrink while valid* (minimize the window) and *grow, then repair* (maximize the window) — plus the frequency-map-with-`formed`-counter machinery that cracks Minimum Window Substring.

## Key concepts

A window is a contiguous range `s[left:right+1]`. The pattern's whole value is the amortized cost argument: `right` advances n times, `left` advances at most n times, so the total work is O(n) even though the inner shrink loop *looks* nested. That argument only holds when the window state (a sum, a count map) can absorb one element entering or leaving in O(1).

Sliding window applies when the predicate on windows is **monotone**: growing a window never makes an "at least"-style condition worse (a sum of positives only grows), and shrinking never makes an "all distinct"-style condition worse. If adding an element can both help and hurt — e.g. sums with negative numbers — the shrink step loses its justification and you need a different tool (prefix sums, a deque).

### Shrink while valid — minimize the window

For "shortest subarray satisfying X" (Minimum Size Subarray Sum, Minimum Window Substring): expand `right` until the window satisfies X, then shrink from the left *as long as it still satisfies X*, recording the best length at every valid shape.

```python
left = 0
total = 0
best = float("inf")
for right in range(len(nums)):
    total += nums[right]                    # expand: absorb nums[right]
    while total >= target:                  # valid — try to make it shorter
        best = min(best, right - left + 1)
        total -= nums[left]                 # shrink: expel nums[left]
        left += 1
```

After the `while` loop the window is the *largest invalid* window ending at `right` — so every valid window has been measured exactly when it was tightest.

### Grow, then repair — maximize the window

For "longest substring satisfying X" (Longest Substring Without Repeating Characters): expand `right` unconditionally, and when the new character breaks the invariant, move `left` just far enough to repair it. With a last-seen-index dict the repair is a single jump instead of a loop:

```python
last_seen: dict[str, int] = {}   # char -> index of latest occurrence
left = 0
best = 0
for right, c in enumerate(s):
    if c in last_seen and last_seen[c] >= left:
        left = last_seen[c] + 1  # jump past the duplicate
    last_seen[c] = right
    best = max(best, right - left + 1)
```

The `>= left` guard is essential: a stale occurrence *behind* the window must not drag `left` backwards (that would re-admit duplicates the window already expelled).

### The need/window/formed machinery

When "valid" means "covers every character of `t`, duplicates included," track it with two dicts and one counter:

- `need` — required count per character of `t` (built once, e.g. `Counter(t)`).
- `window` — current count per needed character inside the window.
- `formed` — how many *distinct* characters currently meet their required count.

The window is valid exactly when `formed == len(need)`. Both dicts update in O(1) per character entering or leaving; `formed` changes only when a character's count crosses its requirement (increment when it *reaches* `need[c]`, decrement when it *drops below*). Comparing full dicts on every step would cost O(|alphabet|) per move — the `formed` counter is what keeps the pass linear.

### Fixed-size windows

When the window length is fixed (max sum of `k` elements; word-concatenation windows of `len(words) * word_len`), there is no shrink decision: slide by adding the entering element and subtracting the leaving one. Substring with Concatenation of All Words is the interesting hybrid — the window slides in *word-sized* steps, so you run one sliding pass per starting offset `0..word_len-1`.

### Complexity of the catalog problems

| Problem | Time | Space | Form |
|---------|------|-------|------|
| Minimum Size Subarray Sum | O(n) | O(1) | shrink while valid |
| Longest Substring Without Repeating Characters | O(n) | O(min(n, alphabet)) | grow, then repair |
| Substring with Concatenation of All Words | O(n · word_len) | O(#words) | fixed-size, word steps |
| Minimum Window Substring | O(\|s\| + \|t\|) | O(alphabet of t) | shrink while valid + `formed` |

## Watch out

- **`right - left + 1`** is the window length. Forgetting the `+ 1` is the pattern's signature off-by-one.
- **Record the best *inside* the shrink loop** for minimize-problems (every valid shape is a candidate), but *after* the repair for maximize-problems (only valid shapes count).
- **The `>= left` guard** in the last-seen-index jump: without it, `"abba"` sends `left` backwards at the final `'a'` and you report an impossible window.
- **Minimum Size Subarray Sum requires positive numbers.** With negatives the sum isn't monotone in the window size and shrinking can be wrong — say so in an interview; the follow-up answer is prefix sums + a monotonic deque.
- **Don't return the length when the problem wants the substring** (and vice versa). Minimum Window Substring wants the actual string — track `best_start` alongside `best_len`, and slice **once** at the end. Slicing inside the loop turns O(n) into O(n²).
- **`formed` counts distinct satisfied characters, not total matches.** Increment only on `count == need[c]`, decrement only when the count drops *below* the requirement — crossing the threshold twice must not double-count.
- **"No valid window" sentinels**: initialize the best length to `float("inf")` and translate it to `0` / `""` at the very end, not inside the loop.
- **`collections.Counter`** is a natural fit for `need`/`window` — `Counter(t)` builds the requirement in one call, and `len(need)` gives the distinct-character count for the `formed` comparison.

## Problem walkthroughs

### Minimum Size Subarray Sum ★

**Problem.** Given a list of **positive** integers `nums` and an integer `target`, return the length of the shortest contiguous subarray whose sum is `>= target`, or `0` if no such subarray exists.

**Example.**

    target = 7, nums = [2,3,1,2,4,3] → 2   ([4,3])
    target = 11, nums = [1,1,1,1,1] → 0    (total sum is only 5)

**Steps.**
1. Keep `left = 0`, a running `total = 0`, and `best = float("inf")`.
2. For each `right`, add `nums[right]` to `total`.
3. While `total >= target`: record `best = min(best, right - left + 1)`, then subtract `nums[left]` and advance `left`. The window is measured at every valid shape, tightest last.
4. Return `0 if best == float("inf") else best`.
5. Why shrinking is safe: all values are positive, so removing the left element strictly decreases the sum — once the window goes invalid, no further shrinking can revive it, and expanding right is the only move that can.

**Complexity.** O(n) time / O(1) space — `left` and `right` each traverse the list once.

### Longest Substring Without Repeating Characters ★

**Problem.** Given a string `s`, return the length of the longest substring (contiguous) containing no repeated character.

**Example.**

    "abcabcbb" → 3   ("abc")
    "bbbbb"    → 1   ("b")
    "pwwkew"   → 3   ("wke" — substring, not subsequence)

**Steps.**
1. Keep a `dict` from character to the index of its most recent occurrence, plus `left = 0` and `best = 0`.
2. For each `right`: if `s[right]` was seen at an index `>= left` (i.e. *inside* the current window), jump `left` to that index + 1 — everything before it can never be part of a duplicate-free window containing `s[right]`.
3. Update the dict with `s[right] -> right`, then fold `right - left + 1` into `best`.
4. The `>= left` check matters: in `"abba"`, when `right` hits the final `'a'`, the dict says `'a'` was at index 0 — but `left` is already 2, and moving it back to 1 would readmit the duplicate `'b'`s. Stale entries outside the window must be ignored, not cleaned up.

**Complexity.** O(n) time / O(min(n, alphabet)) space — one pass, one dict entry per distinct character.

### Substring with Concatenation of All Words

**Problem.** Given a string `s` and a list `words` of **equal-length** strings, return the starting indexes of every substring of `s` that is exactly a concatenation of *all* the words, each used exactly as many times as it appears in `words`, in any order.

**Example.**

    s = "barfoothefoobarman", words = ["foo","bar"] → [0, 9]
    ("barfoo" at 0, "foobar" at 9)

**Steps.**
1. Let `word_len = len(words[0])`, `window_len = word_len * len(words)`. Build `need`: word → required count (`Counter(words)`).
2. Valid concatenations can start at any index, but they decompose into word-sized chunks only relative to their own offset mod `word_len`. So run `word_len` independent sliding passes, one per starting offset `0..word_len - 1`.
3. Within a pass, treat `s` as a sequence of `word_len`-sized tokens. Maintain a window count dict and a word count. For each token at `right`: if it's not in `need`, reset the window entirely (dict cleared, `left` jumps past the junk token — no concatenation can span it).
4. If it is a needed word, add it; while its count exceeds `need`, evict tokens from the left one at a time. When the window holds exactly `len(words)` tokens, record `left` and evict one token to keep sliding.
5. This is the shrink-while-invalid form applied to tokens instead of characters — the per-offset pass is O(n / word_len) tokens, each entering and leaving once.

**Complexity.** O(n · word_len) time (each of `word_len` passes does O(n/word_len) token operations costing O(word_len) each for slicing/hashing) / O(#distinct words) space.

### Minimum Window Substring ★

**Problem.** Given strings `s` and `t`, return the shortest substring of `s` that contains every character of `t` — **including duplicates** (if `t = "AABC"`, the window needs two `A`s). Return `""` if no such window exists. The answer is guaranteed unique when it exists.

**Example.**

    s = "ADOBECODEBANC", t = "ABC" → "BANC"
    s = "a", t = "aa"              → ""

**Steps.**
1. Build `need` from `t` (`Counter(t)`). Keep `window` (char → count inside the window), `formed = 0`, `left = 0`, and `best_len = float("inf")` with `best_start = 0`.
2. Expand: for each `right`, if `s[right]` is a needed character, bump its `window` count; when that count *reaches* `need[c]` exactly, increment `formed`.
3. While `formed == len(need)` (window covers all of `t`): record the window if `right - left + 1 < best_len`, then expel `s[left]` — if it's a needed character, decrement its count, and if the count drops *below* the requirement, decrement `formed` (which exits the shrink loop).
4. After the pass, return `"" if best_len == float("inf") else s[best_start:best_start + best_len]` — slice exactly once.
5. The invariant: whenever the shrink loop exits, the window is missing at least one required character, so every minimal valid window was measured at the moment its left edge became load-bearing.

**Complexity.** O(|s| + |t|) time / O(alphabet of t) space — each character of `s` enters and leaves the window at most once, with O(1) dict work per move.

## Interview follow-ups

After Minimum Size Subarray Sum:
- "What if `nums` can contain negatives?" — sliding window breaks (the sum isn't monotone in window size); use prefix sums with a monotonic deque, O(n).
- "Sum exactly equal to target?" — with positives, the same window works (check `total == target` when valid); with arbitrary integers, prefix-sum hash map.
- "O(n log n) alternative?" — prefix sums + binary search for the smallest end index; worth mentioning as the follow-up the problem statement itself hints at.

After Longest Substring Without Repeating Characters:
- "At most k distinct characters instead of all-distinct?" — same skeleton, a count dict and a shrink loop while `len(window) > k`.
- "Return the substring, not the length?" — track the best window's start; slice once at the end.

After Minimum Window Substring:
- "Why not compare `window` to `need` directly each step?" — that's O(|alphabet|) per step; `formed` makes validity checks O(1).
- "Stream too large to hold in memory?" — the algorithm already reads `s` once, left to right; you only need the window's text, so keep a bounded buffer.

## The task

Three flagship window problems: one minimize-with-sum, one maximize-with-uniqueness, one minimize-with-coverage. Each must run in linear time — a nested rescan of the window on every step is the failure mode the tests' larger inputs punish.

### `min_sub_array_len(target, nums)`

`nums` is a list of **positive** integers and `target` is a positive integer. Return the length of the shortest contiguous subarray of `nums` whose sum is greater than or equal to `target`. Return `0` if no subarray reaches `target`. O(n) time, O(1) space.

```python
min_sub_array_len(7, [2, 3, 1, 2, 4, 3])   # 2   ([4, 3])
min_sub_array_len(4, [1, 4, 4])            # 1   ([4])
min_sub_array_len(11, [1, 1, 1, 1, 1])     # 0   (total sum is 5)
min_sub_array_len(6, [1, 2, 3])            # 3   (the whole list, exactly 6)
```

Edge cases: a single element already `>= target` (answer 1), the entire list summing to exactly `target`, no subarray sufficing (return 0), empty list (return 0).

### `length_of_longest_substring(s)`

Return the length of the longest contiguous substring of `s` that contains no repeated character. Case-sensitive; `s` may contain letters, digits, spaces, and symbols. O(n) time.

```python
length_of_longest_substring("abcabcbb")  # 3   ("abc")
length_of_longest_substring("bbbbb")     # 1   ("b")
length_of_longest_substring("pwwkew")    # 3   ("wke")
length_of_longest_substring("")          # 0
```

Edge cases: empty string (0), single character (1), all characters identical, all characters distinct (the whole string), a repeat of the *first* character late in the string (`"abba"`-style inputs — a stale last-seen index must not move the window backwards).

### `min_window(s, t)`

Return the shortest substring of `s` containing every character of `t`, counting duplicates: if `t` has two `'a'`s, the window must contain at least two `'a'`s. Return `""` when no such window exists (including when `t` is longer than `s`). When a valid window exists, the answer is unique. Target O(|s| + |t|) time.

```python
min_window("ADOBECODEBANC", "ABC")  # "BANC"
min_window("a", "a")                # "a"
min_window("a", "aa")               # ""   (only one 'a' available)
min_window("aa", "aa")              # "aa" (duplicates in t both required)
```

Edge cases: `t` longer than `s` (`""`), no valid window (`""`), the whole of `s` being the only valid window, duplicate characters in `t`, the minimal window sitting at the very start or very end of `s`, characters in `s` that never appear in `t`.
