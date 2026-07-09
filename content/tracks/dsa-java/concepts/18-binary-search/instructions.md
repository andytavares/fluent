# Binary Search

## What you'll learn

How to exploit a monotonic search space to find a target or boundary in O(log n) rather than O(n). Binary search applies far beyond sorted arrays — the key is identifying when you can halve the search space with a single comparison.

## Key concepts

### Pattern 1 — Exact match (classic binary search)

```java
int left = 0, right = nums.length - 1;
while (left <= right) {
    int mid = left + (right - left) / 2; // overflow-safe midpoint
    if      (nums[mid] == target) return mid;
    else if (nums[mid] <  target) left  = mid + 1;
    else                          right = mid - 1;
}
return -1; // not found
```

Loop invariant: the target, if it exists, is always within `[left, right]`.

### Pattern 2 — Insertion point (left boundary / lower_bound)

Use `left < right` and close the right side when `nums[mid] >= target`. The loop exits with `left == right` at the insertion point.

```java
int left = 0, right = nums.length; // right = n, not n-1
while (left < right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] < target) left  = mid + 1;
    else                    right = mid;    // mid could be the answer
}
return left; // 0..n inclusive; index where target belongs
```

### Pattern 3 — Binary search on a rotated sorted array

A rotated sorted array has one "break point." One half is always sorted; use that half to determine which side the minimum (or target) lives on.

```java
// Find the minimum element in a rotated sorted array with no duplicates
public static int findMinInRotatedArray(int[] nums) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) {
            // min is in the right half (mid is in the larger left portion)
            left = mid + 1;
        } else {
            // mid could be the min; don't exclude it
            right = mid;
        }
    }
    return nums[left];
}
```

Key insight: compare `nums[mid]` to `nums[right]` (not to `nums[left]`) to avoid the ambiguity when `left == mid`.

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `binarySearch` | O(log n) | O(1) | Halves search space each step |
| `searchInsertPosition` | O(log n) | O(1) | Same loop structure |
| `findMinInRotatedArray` | O(log n) | O(1) | One valid half always identifiable |

## Common variations this pattern solves

1. **Search in Rotated Sorted Array** — find a target (not just min); check which half is sorted
2. **Find First and Last Position** — two binary searches: left-boundary and right-boundary
3. **Minimum in Rotated Array II (with duplicates)** — fall back to linear scan when `nums[mid] == nums[right]`
4. **Binary search on the answer space** — "smallest capacity to ship packages in D days": binary search on capacity, validate with a greedy checker

## vs other languages

Python has `bisect.bisect_left` (lower_bound) and `bisect.bisect_right` (upper_bound). Java's `Arrays.binarySearch` returns a negative "insertion point" on miss — the formula `-(insertionPoint) - 1` is easy to misread. Write binary search manually in interviews.

C++'s `std::lower_bound` operates on iterators; Java works with raw index arithmetic.

## Watch out

- **`(left + right) / 2` overflows**: when `left` and `right` are both near `Integer.MAX_VALUE`, their sum wraps to a negative number. Always use `left + (right - left) / 2`.
- **`left <= right` vs `left < right`**: use `<=` when you return from inside the loop (exact match). Use `<` when the loop exits with `left == right` pointing at the answer (boundary search).
- **Off-by-one on `right` initialization**: for `searchInsertPosition`, `right = nums.length` (not `nums.length - 1`) allows returning `n` when target is larger than all elements.
- **Rotated array: compare to `nums[right]`, not `nums[left]`**: comparing to `nums[left]` creates ambiguity when `left == mid` (single-element window).

## FAANG follow-up questions

> "What happens with duplicates in findMinInRotatedArray?" — When `nums[mid] == nums[right]`, you can't determine which half has the min. Decrement `right` by 1 and continue — worst case degrades to O(n).
>
> "Can you find the rotation count (not just the minimum)?" — Yes, the index returned by `findMinInRotatedArray` is the rotation count.
>
> "How would you binary search on a 2D matrix?" — Treat the matrix as a flattened 1D array: `row = mid / cols`, `col = mid % cols`.
>
> "What's the binary search on the answer space pattern?" — Define a monotonic predicate (`canAchieve(x)`). Binary search for the smallest (or largest) `x` where it's true.

## The task

Implement three methods in `Solution`:

```java
// Returns the index of target in sorted nums, or -1 if not found.
// [1,3,5,7,9], target=7 -> 3
// [1,3,5,7,9], target=4 -> -1
public static int binarySearch(int[] nums, int target)

// Returns the index where target would be inserted in sorted nums
// to keep it sorted (0-indexed). If target exists, returns its index.
// [1,3,5,6], target=5 -> 2
// [1,3,5,6], target=2 -> 1
// [1,3,5,6], target=7 -> 4
public static int searchInsertPosition(int[] nums, int target)

// Returns the minimum element in a rotated sorted array with no duplicates.
// [3,4,5,1,2] -> 1
// [4,5,6,7,0,1,2] -> 0
// [11,13,15,17] -> 11 (not rotated)
public static int findMinInRotatedArray(int[] nums)
```
