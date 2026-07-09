# Two Pointers

## What you'll learn

Building on the write-pointer idea from Arrays & Strings, this concept covers the full two-pointer pattern: opposite-direction (converging) pointers, same-direction (fast/slow) pointers, and the pivot-plus-converging-pair reduction that takes 3Sum from O(n³) to O(n²). You'll be able to recognize when sorted order or structural symmetry lets you replace a nested loop with a single pass.

## Key concepts

Two pointers eliminates nested loops by exploiting sorted order or structural symmetry. The core insight: in a sorted structure, one comparison tells you which pointer *must* move — moving the other one provably cannot help. That monotonicity is what makes convergence safe: every step discards a set of candidate pairs that cannot contain the answer.

### Opposite-direction (converging) — palindromes, pair sums, container water

```python
left, right = 0, len(arr) - 1
while left < right:
    value = combine(arr[left], arr[right])
    if value == target:
        ...  # found it / record it
    elif value < target:
        left += 1   # need something bigger — only left can provide it
    else:
        right -= 1  # need something smaller — only right can provide it
```

O(n): each iteration retires one index, and no discarded pair could have been the answer.

### Same-direction (fast/slow) — subsequence matching, in-place filtering

```python
slow = 0  # next write / match position
for fast in range(len(arr)):
    if matches(arr[fast]):
        slow += 1
```

`fast` scans everything; `slow` only advances on a match. This is the write pointer from Arrays & Strings generalized to *two different sequences* (is `s` a subsequence of `t`?) as well as one.

### Pivot + converging pair — 3Sum and friends

Sort, fix one element as the pivot, then run converging pointers on the rest:

```python
nums.sort()
for i in range(len(nums) - 2):
    if i > 0 and nums[i] == nums[i - 1]:
        continue  # skip duplicate pivots
    left, right = i + 1, len(nums) - 1
    while left < right:
        total = nums[i] + nums[left] + nums[right]
        if total == 0:
            result.append([nums[i], nums[left], nums[right]])
            while left < right and nums[left] == nums[left + 1]:
                left += 1   # skip dups
            while left < right and nums[right] == nums[right - 1]:
                right -= 1  # skip dups
            left += 1
            right -= 1
        elif total < 0:
            left += 1
        else:
            right -= 1
```

Each pivot costs O(n), so k-sum costs O(n^(k-1)) instead of O(n^k).

### Complexity of the flagship problems

| Problem | Brute force | Two pointers | Space |
|---------|------------|--------------|-------|
| Valid Palindrome | O(n) + O(n) cleaned copy | O(n) | O(1) |
| Two Sum II | O(n²) pairs | O(n) | O(1) |
| Container With Most Water | O(n²) pairs | O(n) | O(1) |
| 3Sum | O(n³) | O(n²) after O(n log n) sort | O(1) excluding output |

## Watch out

- **`list.sort()`/`sorted()` are correct for numbers by default** in Python (no lexicographic surprise like JavaScript), but `sort()` mutates in place and returns `None` — never write `nums = nums.sort()`.
- **Infinite loops**: if pointers don't advance on the "match" branch (palindrome check, 3Sum after recording a triplet), the loop never terminates.
- **3Sum duplicate skipping**: the inner `while` loops must keep checking `left < right` while skipping, or the pointers cross. Skip duplicate pivots only when `i > 0`.
- **Container With Most Water**: always move the *shorter* pointer. Moving the taller one shrinks width without any chance of raising the height (which is capped by the shorter line).
- **Two Sum II returns 1-based indexes** — off-by-one if you forget the `+ 1`.
- **`str.isalnum()`** returns `True` for any Unicode letter or digit, `False` for punctuation and whitespace — exactly the predicate Valid Palindrome needs, no regex required.

## Problem walkthroughs

### Valid Palindrome ★

**Problem.** Given a string `s`, return `True` if it reads the same forwards and backwards after ignoring every non-alphanumeric character and treating letters case-insensitively.

**Example.**

    "A man, a plan, a canal: Panama" → True
    "race a car"                     → False

**Steps.**
1. Set `left = 0`, `right = len(s) - 1`.
2. Inside a `while left < right` loop: advance `left` past non-alphanumeric characters, then retreat `right` past non-alphanumeric characters (both inner loops must re-check `left < right`).
3. Compare `s[left].lower()` with `s[right].lower()`; return `False` on mismatch.
4. On a match, advance both pointers and continue. Return `True` when they meet.
5. Skipping in place — instead of building a cleaned string — keeps space O(1) and is the point of the exercise.

**Complexity.** O(n) time / O(1) space — each pointer crosses each character at most once.

### Is Subsequence

**Problem.** Return `True` if `s` is a subsequence of `t`: all of `s`'s characters appear in `t` in the same relative order (not necessarily contiguous).

**Example.**

    s = "abc", t = "ahbgdc" → True
    s = "axc", t = "ahbgdc" → False

**Steps.**
1. Two same-direction pointers: `i` into `s` (the pattern), `j` into `t` (the text).
2. Walk `j` across all of `t`; whenever `t[j] == s[i]`, advance `i`.
3. Return `i == len(s)` — every pattern character found a match, in order.
4. Greedy matching is safe: taking the *earliest* possible match for `s[i]` never hurts, because it leaves the largest possible suffix of `t` for the remaining pattern.

**Complexity.** O(|t|) time / O(1) space.

### Two Sum II ★

**Problem.** `numbers` is sorted ascending and 1-indexed. Find the two distinct positions whose values sum to `target` and return them as `[index1, index2]` with `index1 < index2`, both **1-based**. Exactly one solution exists; you may not use the same element twice; O(1) extra space required.

**Example.**

    numbers = [2,7,11,15], target = 9 → [1,2]
    numbers = [2,3,4],      target = 6 → [1,3]

**Steps.**
1. Set `left = 0`, `right = len(numbers) - 1`.
2. Compute `total = numbers[left] + numbers[right]`.
3. If `total == target`, return `[left + 1, right + 1]` (convert to 1-based).
4. If `total < target`, increment `left` — the sum must grow, and `right` already pairs the current `left` with the largest available value.
5. If `total > target`, decrement `right` — symmetric argument.
6. Why nothing is missed: when `left` advances, every pair `(left, x)` for `x < right` had `total < target` too (values only get smaller), so the discarded pairs were all invalid.

**Complexity.** O(n) time / O(1) space — this is exactly the inner loop of 3Sum.

### Container With Most Water ★

**Problem.** `heights[i]` is the height of a vertical line at position `i`. Pick two lines so that together with the x-axis they hold the most water: area = min of the two heights × distance between them. Return the maximum area.

**Example.**

    [1,8,6,2,5,4,8,3,7] → 49   (lines at index 1 and 8: min(8,7) × 7)

**Steps.**
1. Start with the widest container: `left = 0`, `right = len(heights) - 1`, `max_area = 0`.
2. Each iteration, compute `min(heights[left], heights[right]) * (right - left)` and fold it into `max_area`.
3. Move the pointer at the **shorter** line inward (either one on a tie).
4. Why that's safe: the shorter line caps the area of every container it could form with anything inside the current window — narrower width, height still capped. So discarding it loses no candidate that could beat the current best.

**Complexity.** O(n) time / O(1) space — one converging pass.

### 3Sum ★

**Problem.** Given `nums`, return all **unique** triplets `[a, b, c]` of values (taken from three distinct indexes) with `a + b + c == 0`. The output must contain no duplicate triplets, in any order.

**Example.**

    [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]
    [0,0,0]          → [[0,0,0]]

**Steps.**
1. Sort ascending. Sorting enables both the converging pair and duplicate skipping.
2. Loop pivot `i` from 0 to `len(nums) - 3`. Skip duplicate pivots: `if i > 0 and nums[i] == nums[i - 1]: continue`. Optional early exit: `if nums[i] > 0: break` — three positives can't sum to zero.
3. For each pivot, run Two Sum II's converging loop on `[i + 1, len(nums) - 1]` with target `-nums[i]`: advance `left` when the sum is negative, retreat `right` when positive.
4. On a hit, record `[nums[i], nums[left], nums[right]]`, then skip duplicates on **both** inner pointers (`while left < right and nums[left] == nums[left + 1]: left += 1`, mirror for `right`) before advancing both.
5. The three duplicate-skips (pivot, left, right) are what guarantee uniqueness without a dedupe set.

**Complexity.** O(n²) time (O(n log n) sort + O(n) per pivot) / O(1) auxiliary space excluding the output.

## Interview follow-ups

After 3Sum:
- "What if you can't sort the array?" — hash-set inner loop: O(n²) time but O(n) space.
- "4Sum?" — one more pivot loop around the same core: O(n³) instead of O(n⁴).
- "3Sum closest?" — same skeleton; track the sum minimizing `abs(sum - target)` instead of collecting exact hits.

After Container With Most Water:
- "Prove no better pair is skipped." — exchange argument on the shorter line (walkthrough step 4).
- "Heights can be 0?" — area for that pair is 0; the algorithm needs no special case.

After Two Sum II:
- "Unsorted input?" — that's classic Two Sum: hash map (`dict`), O(n) time, O(n) space. Sorting first costs O(n log n) *and* loses the original indexes.

## The task

Four converging-pointer classics. Each must run in the stated time and O(1) extra space (3Sum's output excluded).

### `is_palindrome(s)`

Return `True` if `s` is a palindrome after ignoring all non-alphanumeric characters and case; `False` otherwise. A string with no alphanumeric characters at all (including `""` and `" "`) counts as a palindrome. Skip the junk characters with the pointers themselves — do not build a cleaned copy of the string. O(n) time.

```python
is_palindrome("A man, a plan, a canal: Panama")  # True
is_palindrome("race a car")                      # False
is_palindrome(" ")                               # True
is_palindrome("0P")                              # False
```

Edge cases: empty string (`True`), single character, digits mixed with letters (`"12321"` is a palindrome; case-insensitivity applies only to letters).

### `two_sum_ii(numbers, target)`

`numbers` is sorted in ascending order. Return the **1-based** indexes `[index1, index2]` (`index1 < index2`) of the two distinct elements that sum exactly to `target`. Exactly one solution exists for every input you'll receive; the same element may not be used twice (two equal *values* at different positions are fine). O(n) time, O(1) space — no hash map.

```python
two_sum_ii([2, 7, 11, 15], 9)  # [1, 2]
two_sum_ii([2, 3, 4], 6)       # [1, 3]
two_sum_ii([-1, 0], -1)        # [1, 2]
```

Edge cases: negative numbers, duplicate values forming the pair (`[1, 1, 2]` with target `2` → `[1, 2]`), the pair sitting at the two ends of the list.

### `container_with_most_water(heights)`

`heights` is a list of non-negative line heights (length ≥ 2). Two lines at indexes `i < j` hold `min(heights[i], heights[j]) * (j - i)` water. Return the maximum over all pairs. O(n) time.

```python
container_with_most_water([1, 8, 6, 2, 5, 4, 8, 3, 7])  # 49
container_with_most_water([1, 1])                       # 1
container_with_most_water([0, 2, 0])                    # 0
```

Edge cases: exactly two lines, zero heights (area 0 is a valid answer), the best pair not at the ends, all heights equal.

### `three_sum(nums)`

Return all unique triplets of values `[a, b, c]` drawn from three distinct indexes of `nums` such that `a + b + c == 0`. No duplicate triplets in the output; triplet order and ordering within a triplet don't matter. O(n²) time.

```python
three_sum([-1, 0, 1, 2, -1, -4])  # [[-1, -1, 2], [-1, 0, 1]]
three_sum([0, 1, 1])              # []
three_sum([0, 0, 0])              # [[0, 0, 0]]
```

Edge cases: fewer than three elements (`[]`), no valid triplet, heavy duplicates (`[-2, 0, 0, 2, 2]` → only `[[-2, 0, 2]]`), all-positive or all-negative input (`[]`).
