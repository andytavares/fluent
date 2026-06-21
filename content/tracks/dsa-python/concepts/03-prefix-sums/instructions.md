# Prefix Sums

## What you'll learn

How to answer arbitrary range-sum queries in O(1) after O(n) preprocessing, and how a hash map of prefix sums collapses "count subarrays summing to k" from O(n²) brute force to a single O(n) pass.

## Key concepts

A prefix sum array `p` of length `n+1` stores cumulative sums with a leading zero:

```
p[0] = 0
p[i] = nums[0] + nums[1] + ... + nums[i-1]
```

This convention — padding with `p[0] = 0` — makes range queries uniform: the sum of `nums[i..j]` (inclusive) is always `p[j+1] - p[i]`, with no special-case for `i == 0`.

### Build and query

```python
def build_prefix_sum(nums: list[int]) -> list[int]:
    prefix = [0] * (len(nums) + 1)
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x    # p[i+1] = p[i] + nums[i]
    return prefix

def range_sum(prefix: list[int], i: int, j: int) -> int:
    return prefix[j + 1] - prefix[i]     # sum of nums[i..j] inclusive
```

### Count subarrays summing to k

The key insight: `prefix[j] - prefix[i] == k` means `prefix[i] == prefix[j] - k`. So as we build the prefix sum left to right, we count how many times `prefix[j] - k` appeared as a prefix sum earlier.

```python
from collections import defaultdict

def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    counts: dict[int, int] = defaultdict(int)
    counts[0] = 1      # the empty prefix: prefix[0] = 0 was "seen" once
    total = 0
    prefix = 0
    for x in nums:
        prefix += x
        total += counts[prefix - k]   # any earlier prefix that pairs with this one
        counts[prefix] += 1
    return total
```

**Why `counts[0] = 1` before the loop?** If `prefix[j] == k` exactly (subarray from index 0), we need `prefix[i] == 0` to have been counted. Index −1 doesn't exist, so we preload `counts[0] = 1` to represent the virtual "start before the array" position.

## Time and space complexity

| Operation | Time | Space |
|-----------|------|-------|
| Build prefix array | O(n) | O(n) |
| Range sum query | O(1) | O(1) |
| Subarray count equals k | O(n) | O(n) |
| Brute-force subarray count | O(n²) | O(1) |

## Common variations

- **2D prefix sums** — extend to a matrix; cell `(r,c)` stores the sum of the rectangle from `(0,0)` to `(r,c)`. Range query in O(1) using inclusion-exclusion.
- **Number of subarrays with sum divisible by k** — same pattern, store `prefix % k` in the hash map
- **Subarray sum equals k with exactly positive integers** — sliding window works too, but prefix sums work with negatives
- **Running XOR** — replace addition with XOR; finds subarrays with XOR equal to target in O(n)

## vs other languages

Python's `itertools.accumulate(nums)` produces a running sum iterator, but it does not prepend the leading zero — you'd need `itertools.accumulate(nums, initial=0)` (Python 3.8+). The manual loop with `prefix[0] = 0` is explicit and portable. `collections.defaultdict(int)` returns `0` for missing keys, eliminating the `if key in dict` guard that Java's `HashMap` requires.

## Watch out

- **Off-by-one in range query:** `range_sum(prefix, i, j)` returns `prefix[j+1] - prefix[i]`. Forgetting the `+1` on the right index is the most common error.
- **`counts[0] = 1` must be set before iterating**, not inside the loop. Placing it inside the loop causes you to count the current prefix sum as a prior one.
- **`defaultdict(int)` returns 0 for missing keys** — `counts[prefix - k]` is safe even if `prefix - k` was never seen. A plain `dict` would raise `KeyError`.
- **Works with negative numbers** — unlike sliding window, prefix sums handle negative values. Sliding window breaks when negatives can both grow and shrink a sum.

## FAANG follow-up questions

> "Why can't you use sliding window for `subarray_sum_equals_k` when the array has negative numbers?" — Because shrinking the window doesn't guarantee the sum decreases. Prefix sums work regardless of sign.

> "How would you extend `range_sum` to a 2D grid?" — Build a 2D prefix table where `p[r][c]` = sum of all elements in the rectangle `(0,0)` to `(r-1,c-1)`. Then `rect(r1,c1,r2,c2) = p[r2+1][c2+1] - p[r1][c2+1] - p[r2+1][c1] + p[r1][c1]`.

> "If you receive range-sum queries online (one by one, each answer must come before the next query), is O(n) preprocessing still valid?" — Yes, you preprocess once and answer each query in O(1).

## The task

```python
def build_prefix_sum(nums: list[int]) -> list[int]:
    """Return a prefix sum array of length len(nums)+1 where prefix[0]=0
    and prefix[i] = sum of nums[0..i-1]."""

def range_sum(prefix: list[int], i: int, j: int) -> int:
    """Return the sum of nums[i..j] inclusive using the prefix sum array."""

def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    """Return the count of contiguous subarrays that sum to exactly k."""
```

**Examples:**
- `build_prefix_sum([1,2,3,4,5])` → `[0,1,3,6,10,15]`
- `range_sum([0,1,3,6,10,15], 1, 3)` → `9` (2+3+4)
- `range_sum([0,1,3,6,10,15], 0, 4)` → `15`
- `subarray_sum_equals_k([1,1,1], 2)` → `2`
- `subarray_sum_equals_k([1,2,3], 3)` → `2` ([1,2] and [3])
- `subarray_sum_equals_k([-1,-1,1], 0)` → `1`
- `subarray_sum_equals_k([1], 0)` → `0`
