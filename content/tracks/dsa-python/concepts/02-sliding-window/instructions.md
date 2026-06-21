# Sliding Window

## What you'll learn

How to process contiguous subarrays or substrings in O(n) time by maintaining two pointers that define a window — expanding it from the right and shrinking it from the left — instead of recomputing each subrange from scratch.

## Key concepts

Two variants cover almost every interview problem in this pattern:

**Fixed-size window** — `k` is given; slide a window of exactly `k` elements by adding the incoming element and subtracting the outgoing one.

**Variable-size window** — grow the window by advancing `right`; shrink by advancing `left` whenever a constraint is violated. Each element enters and exits the window at most once → O(n) total.

### Fixed window: maximum sum subarray of size k

```python
def max_sum_subarray(nums: list[int], k: int) -> int:
    window_sum = sum(nums[:k])       # seed the first window
    best = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]   # slide: +new, -oldest
        best = max(best, window_sum)
    return best
```

### Variable window: longest substring without repeating characters

```python
def longest_unique_substring(s: str) -> int:
    seen: set[str] = set()
    left = best = 0
    for right in range(len(s)):
        while s[right] in seen:      # constraint violated: shrink
            seen.remove(s[left])
            left += 1
        seen.add(s[right])
        best = max(best, right - left + 1)
    return best
```

### Hard variant: minimum window substring (sliding window + frequency map)

Find the shortest substring of `s` that contains every character of `t`.

```python
from collections import Counter

def min_window_substring(s: str, t: str) -> str:
    if not t or not s:
        return ""
    need = Counter(t)           # characters we still need
    missing = len(t)            # total characters still needed
    best_start = best_len = 0
    found_start = -1            # marks whether we have a valid window yet
    left = 0

    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1        # one more required char covered
        need[ch] -= 1           # track excess too (goes negative)

        if missing == 0:        # valid window — try to shrink
            # advance left past characters not needed or in excess
            while need[s[left]] < 0:
                need[s[left]] += 1
                left += 1
            # record best
            window_len = right - left + 1
            if found_start == -1 or window_len < best_len:
                best_start, best_len = left, window_len
                found_start = left
            # shrink by one to look for a shorter valid window
            need[s[left]] += 1
            missing += 1
            left += 1

    return s[best_start : best_start + best_len] if found_start != -1 else ""
```

**Key insight:** `need[ch]` tracks how many of `ch` we still require. It can go negative (excess). `missing` counts how many required characters are not yet satisfied. When `missing == 0` we have a valid window; we shrink from the left until shrinking would break validity, record the window, then advance `left` by one to force `missing > 0` again and continue.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Longest unique substring | O(n) | O(min(n, ∣Σ∣)) — alphabet size |
| Max sum subarray (fixed k) | O(n) | O(1) |
| Min window substring | O(∣s∣ + ∣t∣) | O(∣Σ∣) |

## Common variations

- **Longest substring with at most K distinct characters** — variable window with a `Counter`; shrink when `len(counter) > k`
- **Permutation in String** — fixed window of `len(t)`, compare frequency maps
- **Fruit Into Baskets** — variable window, at most 2 distinct values
- **Minimum Size Subarray Sum** — variable window, shrink while sum ≥ target

## vs other languages

Python's `collections.Counter` is a `dict` subclass that returns `0` for missing keys — this makes the frequency-map logic in `min_window_substring` cleaner than equivalent Java or C++ code that must handle `getOrDefault`. The `Counter(t)` initializer builds the entire frequency map in one call.

In Java you'd typically use a `HashMap<Character, Integer>` and manually track `have` vs `need` counts. The Python version's `need[ch] -= 1` into negative territory to track excess is an idiom that doesn't translate directly — but it's worth knowing because it eliminates a second data structure.

## Watch out

- **Window size formula:** `right - left + 1`, not `right - left`. Off-by-one here breaks fixed-window logic.
- **Seeding the fixed window:** `sum(nums[:k])` before the loop — don't include it in the loop or you double-count index 0.
- **`collections.Counter` returns 0 for missing keys**, not `KeyError` — safe to decrement directly. A plain `dict` would raise.
- **`min_window_substring` with duplicate characters in `t`:** `need` correctly requires the count to be satisfied that many times. A `set` would break this.
- **Empty `t` or `s`:** return `""` immediately — `Counter("")` is valid but the loop will report a spurious empty match.

## FAANG follow-up questions

> "What if characters in `t` have duplicates — e.g., `t = "aa"`?" — The `Counter` handles this: `need['a']` starts at 2, and `missing` decrements only when `need[ch] > 0`, so both `'a'`s must be present.

> "Can you do `min_window_substring` in one pass?" — Yes, the solution above is already one pass over `s` with O(1) inner work amortized. The `while` on `left` is O(n) total across all iterations.

> "What's the sliding window approach for finding all anagrams of `p` in `s`?" — Fixed window of `len(p)`, compare `Counter` of window to `Counter(p)`, slide by one each step.

## The task

```python
def longest_unique_substring(s: str) -> int:
    """Return the length of the longest substring without repeating characters."""

def max_sum_subarray(nums: list[int], k: int) -> int:
    """Return the maximum sum of any contiguous subarray of exactly k elements."""

def min_window_substring(s: str, t: str) -> str:
    """Return the minimum window substring of s that contains all characters
    of t (including duplicates). Return "" if no such window exists."""
```

**Examples:**
- `longest_unique_substring("abcabcbb")` → `3`
- `longest_unique_substring("bbbbb")` → `1`
- `max_sum_subarray([2,1,5,1,3,2], 3)` → `9`
- `max_sum_subarray([-1,-2,-3,-4], 2)` → `-3`
- `min_window_substring("ADOBECODEBANC", "ABC")` → `"BANC"`
- `min_window_substring("a", "a")` → `"a"`
- `min_window_substring("a", "b")` → `""`
