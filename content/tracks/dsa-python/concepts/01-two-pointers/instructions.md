# Two Pointers

## What you'll learn

How to eliminate O(n²) brute-force pair searches using two indices that converge or chase each other through a sequence — and why the greedy pointer movement is provably correct.

## Key concepts

Two pointers works in two configurations:

**Opposite ends** — one pointer starts at index 0, one at `len - 1`, they converge inward. Used when the array is sorted and you're searching for pairs satisfying a sum/difference constraint, or checking symmetry.

**Same direction (fast/slow)** — both start at 0, one advances faster. Used for cycle detection in linked lists (Floyd's algorithm) or finding a list's midpoint.

### Opposite-ends pattern

```python
def two_sum_sorted(nums: list[int], target: int) -> tuple[int, int] | None:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            return (lo, hi)
        elif s < target:
            lo += 1   # sum too small — move left pointer right
        else:
            hi -= 1   # sum too large — move right pointer left
    return None
```

**Why it's correct:** because the array is sorted, increasing `lo` increases the sum, decreasing `hi` decreases it. Every move eliminates a row or column of the implicit n×n pair matrix. No valid pair is ever skipped.

### Palindrome check — skipping non-alphanumeric chars

```python
def is_palindrome(s: str) -> bool:
    lo, hi = 0, len(s) - 1
    while lo < hi:
        while lo < hi and not s[lo].isalnum():
            lo += 1                        # skip punctuation/spaces from left
        while lo < hi and not s[hi].isalnum():
            hi -= 1                        # skip from right
        if s[lo].lower() != s[hi].lower():
            return False
        lo += 1
        hi -= 1
    return True
```

### Three-sum — reduce to two-sum after sorting

```python
def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()                            # O(n log n) — required for dedup
    result: list[list[int]] = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                       # skip duplicate pivots
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                result.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]:
                    lo += 1                # skip duplicate lo
                while lo < hi and nums[hi] == nums[hi - 1]:
                    hi -= 1                # skip duplicate hi
                lo += 1
                hi -= 1
            elif s < 0:
                lo += 1
            else:
                hi -= 1
    return result
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Palindrome check | O(n) | O(1) |
| Container with most water | O(n) | O(1) |
| Three-sum | O(n²) | O(1) output excluded |

Three-sum's O(n²) is optimal — any algorithm must examine O(n²) pairs in the worst case.

## Common variations

- **Two Sum II** (sorted array) — direct application of opposite-ends pattern
- **Trapping Rain Water** — two pointers tracking left/right max
- **Remove Duplicates from Sorted Array** — slow/fast pointers for in-place compaction
- **Four Sum** — reduce to three-sum, then to two-sum: O(n³)

## vs other languages

In Python, `s[::-1]` gives you a palindrome check in one line — but it allocates an O(n) string. The two-pointer version is O(1) space and skips non-alphanumeric characters in the same pass. In interviews, reach for the two-pointer version and mention the space tradeoff.

Python's `sort()` is in-place (Timsort, O(n log n)), which matters for three-sum: you're allowed to mutate the input unless the problem says otherwise. If not, copy first: `nums = sorted(nums)`.

## Watch out

- **Duplicate handling in three-sum** is where candidates fail. After finding a triplet, advance both pointers past all identical values before continuing — otherwise you emit `[0,0,0]` multiple times for `[0,0,0,0]`.
- **`lo < hi` guard** on the inner dedup loops — without it you can walk `lo` past `hi` and corrupt the result.
- `str.isalnum()` returns `False` for spaces and punctuation, `True` for letters and digits. It correctly handles Unicode letters too.
- The container problem's greedy argument: moving the *taller* wall inward cannot improve the area (width decreases, height stays same or decreases). Moving the *shorter* wall is the only candidate for a larger container.

## FAANG follow-up questions

> "What if the input has duplicates and you need unique triplets?" — Handled by sorting and skipping. Be ready to whiteboard the dedup logic.

> "Can three-sum be done in O(n log n)?" — No. The lower bound is Ω(n²) by reduction from element distinctness.

> "What if `container_with_most_water` allowed you to pick more than two lines?" — Different problem entirely (histogram area, use a stack).

## The task

Implement three functions:

```python
def is_palindrome(s: str) -> bool:
    """Return True if s reads the same forwards and backwards.
    Ignore non-alphanumeric characters and treat as case-insensitive."""

def container_with_most_water(heights: list[int]) -> int:
    """Given heights[i] representing a vertical line at position i,
    find two lines that form the container holding the most water.
    Return the maximum water volume."""

def three_sum(nums: list[int]) -> list[list[int]]:
    """Return all unique triplets [a, b, c] from nums such that a + b + c == 0.
    The solution set must not contain duplicate triplets."""
```

**`is_palindrome` examples:**
- `"A man, a plan, a canal: Panama"` → `True`
- `"race a car"` → `False`
- `""` → `True`

**`container_with_most_water` examples:**
- `[1,8,6,2,5,4,8,3,7]` → `49`
- `[1,1]` → `1`

**`three_sum` examples:**
- `[-1,0,1,2,-1,-4]` → `[[-1,-1,2],[-1,0,1]]`
- `[0,1,1]` → `[]`
- `[0,0,0]` → `[[0,0,0]]`
