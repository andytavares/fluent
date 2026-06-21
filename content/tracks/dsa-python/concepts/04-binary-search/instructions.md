# Binary Search

## What you'll learn

How binary search eliminates half the search space per iteration, why the invariant (not the midpoint formula) is the thing to get right, and how the same logic extends to rotated arrays — a canonical FAANG problem.

## Key concepts

Binary search maintains a **search interval `[lo, hi]`** and a loop invariant: the target, if present, is always within that interval. The loop terminates when the interval is empty.

Two loop styles and when to use each:

| Style | Condition | `hi` init | Use for |
|-------|-----------|-----------|---------|
| `lo <= hi` | collapses to empty | `len-1` | classic find — return index or -1 |
| `lo < hi` | collapses to single element | `len` or `len-1` | find boundary — `lo` is the answer |

### Classic binary search

```python
def binary_search(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2    # safe even if Python ints don't overflow
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

### Search insert position (leftmost valid slot)

When the loop uses `lo < hi` and the target isn't found, `lo` always lands on the first index where `nums[lo] >= target` — exactly the insertion point.

```python
def search_insert_position(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums)            # hi = len(nums) to allow insert-at-end
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid                 # mid could be the answer; keep it
    return lo
```

### Find minimum in rotated sorted array

A rotated sorted array like `[4,5,6,7,0,1,2]` has a pivot. The minimum is at the pivot. The key invariant: if `nums[mid] > nums[hi]`, the pivot is in the right half; otherwise it's in the left half (including `mid`).

```python
def find_min_in_rotated_array(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1             # min is in right half
        else:
            hi = mid                 # min is in left half or at mid
    return nums[lo]
```

**Why compare `nums[mid]` to `nums[hi]` (not `nums[lo]`)?** Comparing to `nums[lo]` is ambiguous when the array hasn't been rotated at all (`nums[lo]` is always the smallest). Comparing to `nums[hi]` cleanly separates the two halves.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Binary search | O(log n) | O(1) |
| Search insert position | O(log n) | O(1) |
| Min in rotated array | O(log n) | O(1) |

## Common variations

- **Search in Rotated Sorted Array** (find a target, not the min) — two-phase: determine which half is sorted, then decide which half to recurse into
- **Find First and Last Position of Element** — run `bisect_left` and `bisect_right`; equivalent to two binary searches
- **Koko Eating Bananas** — binary search on the answer space (eating speed), with O(n) feasibility check
- **Median of Two Sorted Arrays** — hard; binary search on partition point, O(log(min(m,n)))

## vs other languages

Python's `bisect` module (`bisect_left`, `bisect_right`) implements `search_insert_position` idiomatically. In production, use it. The `bisect` module also has `insort` for maintaining sorted lists. Java has `Arrays.binarySearch` (returns negative insertion point if not found — confusing). C++ has `std::lower_bound` / `std::upper_bound` which are closer to Python's `bisect_left` / `bisect_right`.

## Watch out

- **`lo <= hi` vs `lo < hi`:** wrong choice leads to either infinite loop or missing the answer. Rule: use `<= hi` when you need to return a value from inside the loop; use `< hi` when you want `lo` to converge to the answer.
- **`mid = lo + (hi - lo) // 2`** — not needed in Python (no integer overflow), but writing it keeps the code portable and shows interview awareness.
- **Rotated array with no rotation:** `[1,2,3,4,5]` — the algorithm still works: `nums[mid] <= nums[hi]` always, so `hi` shrinks to 0.
- **`bisect` module**: `bisect_left(nums, target)` returns the leftmost insertion point; `bisect_right` returns the rightmost. Know the difference.

## FAANG follow-up questions

> "What if the rotated array has duplicates?" — `[3,1,3,3,3]`: when `nums[mid] == nums[hi]` you can't determine which half contains the minimum. Fall back to `hi -= 1`. Worst case degrades to O(n).

> "How would you binary search for the minimum in a matrix where each row is sorted and row `i` starts where row `i-1` ends?" — Treat it as a 1D array of length `m*n`; convert `mid` to `(mid//n, mid%n)`.

> "Can binary search be applied to a sorted linked list?" — No: no O(1) random access. Use skip lists for O(log n) on linked structures.

## The task

```python
def binary_search(nums: list[int], target: int) -> int:
    """Return the index of target in sorted nums, or -1 if not found."""

def search_insert_position(nums: list[int], target: int) -> int:
    """Return the index of target if found, or the index where it would be
    inserted to keep nums sorted."""

def find_min_in_rotated_array(nums: list[int]) -> int:
    """Given a rotated sorted array with no duplicates, return the minimum element."""
```

**Examples:**
- `binary_search([1,3,5,7,9], 5)` → `2`
- `binary_search([1,3,5,7,9], 4)` → `-1`
- `search_insert_position([1,3,5,6], 5)` → `2`
- `search_insert_position([1,3,5,6], 2)` → `1`
- `search_insert_position([1,3,5,6], 7)` → `4`
- `find_min_in_rotated_array([3,4,5,1,2])` → `1`
- `find_min_in_rotated_array([4,5,6,7,0,1,2])` → `0`
- `find_min_in_rotated_array([1])` → `1`
