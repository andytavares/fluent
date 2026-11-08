## What you build

You write four O(log n) searches: an insertion point, a peak, a search in a rotated array and the range of a repeated value. You learn two templates and when to use each, so you can prove that each loop ends. This lesson builds on **Divide & Conquer**.

## Key concepts

### Binary search needs a monotonic question, not a sorted array

Binary search works when you can ask one O(1) question about the middle: "is the answer left or right of here?" Rotated arrays, mountain arrays and yes/no predicates over a number range all qualify. The deciding predicate must be monotonic.

### Template 1 finds an element in a closed interval

Use Template 1 to find one specific element. Stop as soon as you see it. The interval is `[left, right]`.

```js
let left = 0, right = nums.length - 1;
while (left <= right) {
  const mid = left + ((right - left) >> 1);
  if (nums[mid] === target) return mid;
  if (nums[mid] < target) left = mid + 1;
  else right = mid - 1;
}
return -1;
```

The invariant: if the target is present, it is inside `[left, right]`. Both updates shrink the interval by at least one, so the loop ends. When `left > right`, the interval is empty and the target is absent.

### Template 2 finds a boundary in a half-open interval

Use Template 2 to find a boundary, not an element. The lower bound is the first index whose value is `>= target`. It is also the insertion point. The interval is `[left, right)`.

```js
// right = length, not length - 1
let left = 0, right = nums.length;
// strict <, not <=
while (left < right) {
  const mid = left + ((right - left) >> 1);
  // mid too small: answer is right of it
  if (nums[mid] < target) left = mid + 1;
  // mid can be the answer: keep it
  else right = mid;
}
// left === right; can be nums.length
return left;
```

The invariant: every index left of `left` fails the test (`< target`). Every index at or right of `right` passes it (`>= target`). The loop squeezes the two regions together, and `left` lands on the first passing index.

This one template solves Search Insert Position directly. Run twice, it solves Find First and Last Position.

### The two templates are not interchangeable

Template 1's `right = mid - 1` breaks Template 2, because it can discard the answer. Template 2's `right = mid` makes Template 1 loop forever when `left === right`. To choose, ask: "Do I find an element, or a boundary?"

### In a rotated array, one half is always sorted

A sorted array rotated at an unknown pivot, such as `[4,5,6,7,0,1,2]`, is not sorted. Split it anywhere, and at least one half is sorted. Check `nums[left] <= nums[mid]` to learn which half. Then test whether the target is inside that half's value range, and search the correct side.

```js
if (nums[left] <= nums[mid]) {
  // left half sorted
  if (nums[left] <= target &&
      target < nums[mid]) right = mid - 1;
  else left = mid + 1;
} else {
  // right half sorted
  if (nums[mid] < target &&
      target <= nums[right]) left = mid+1;
  else right = mid - 1;
}
```

### Peak finding works on unsorted input

`nums` has no order, only the guarantee `nums[i] !== nums[i + 1]`. Compare `mid` with its right neighbor. If `nums[mid] < nums[mid + 1]`, you are on a rising slope, and a peak exists to the right. The array cannot rise forever, because it ends. Otherwise, a peak exists at `mid` or to its left. That one comparison is the monotonic predicate.

```js
let left = 0, right = nums.length - 1;
while (left < right) {
  const mid = left + ((right - left) >> 1);
  // climb the slope
  if (nums[mid] < nums[mid + 1]) {
    left = mid + 1;
  } else {
    // peak at mid or left of it
    right = mid;
  }
}
return left;
```

`mid + 1` is always in bounds, because `left < right` guarantees `mid < right`.

### Complexity of the main problems

| Problem | Time | Space | Template |
|---------|------|-------|----------|
| Search Insert Position | O(log n) | O(1) | lower bound |
| Find Peak Element | O(log n) | O(1) | boundary on the slope predicate |
| Search in Rotated Sorted Array | O(log n) | O(1) | exact match and sorted-half test |
| Find First and Last Position | O(log n) | O(1) | lower bound, run twice |

## Watch out

- Mixing the templates is the classic binary search bug.
- `while (left < right)` with `right = mid - 1` skips answers.
- `while (left <= right)` with `right = mid` loops forever.
- With `left < right` and `right = mid`, the interval shrinks only because `mid` rounds down.
- If you write `left = mid` in an upper-bound variant, round the midpoint up. Otherwise the loop stalls at two elements.
- In a rotated search, use `nums[left] <= nums[mid]`, not `<`.
- When `left === mid`, the left half is one element, which is sorted. With `<`, you search the wrong side.
- In `nums[left] <= target && target < nums[mid]`, the `mid` end is exclusive. You already know `nums[mid] !== target`.
- The lower bound can return `nums.length`, a valid insertion point. Check it before you index into the array.
- In JavaScript, `>>` converts its operand to a 32-bit integer. So `(left + right) >> 1` breaks when the sum passes 2^31 − 1.
- Write `left + ((right - left) >> 1)` anyway. Other languages need it, and interviewers look for it.
- In First and Last Position, check `nums[first] === target` before you search for the end. The target can be absent.

## Problem walkthroughs

### Search Insert Position ★

**Problem.** `nums` is sorted ascending with distinct values. Return the index of `target` if it is present. Otherwise, return the index where inserting it keeps the array sorted. It must run in O(log n).

**Example.**

```
nums = [1,3,5,6], target = 5 → 2
nums = [1,3,5,6], target = 2 → 1
nums = [1,3,5,6], target = 7 → 4
```

**Steps.**

1. This is the lower bound. The answer is the first index with `nums[i] >= target`, whether `target` is present or not.
2. Set `left = 0` and `right = nums.length`. Loop while `left < right`.
3. If `nums[mid] < target`, the insertion point is right of `mid`: set `left = mid + 1`. Otherwise, `mid` can be the answer: set `right = mid`.
4. Return `left`. You need no separate "found" case. The values are distinct, so if `target` exists, the first `>= target` index is its index.

**Complexity.** O(log n) time, O(1) space. The interval halves at every step.

### Search a 2D Matrix

**Problem.** An `m × n` matrix has each row sorted ascending. Each row's first value is greater than the previous row's last value. Return `true` if `target` is in the matrix, in O(log(m·n)).

**Example.**

```
matrix = [[1,3,5,7],
          [10,11,16,20],
          [23,30,34,60]]
target = 3  → true
target = 13 → false
```

**Steps.**

1. Read row by row, the matrix is one sorted list of `m·n` values. Search it as one virtual array, not with two nested searches.
2. Run Template 1 on the indexes `0 .. m*n - 1`.
3. Map a flat index to coordinates: `row = Math.floor(mid / n)` and `col = mid % n`. The value is `matrix[row][col]`.
4. Compare that value to `target`, and move `left` or `right` as in the plain template. The mapping is the whole trick. You copy no data.

**Complexity.** O(log(m·n)) time, O(1) space.

### Find Peak Element ★

**Problem.** A peak is an element strictly greater than both neighbors. The virtual neighbors beyond the array edges are −∞. Given `nums` with `nums[i] !== nums[i + 1]` for all adjacent pairs, return the index of any peak, in O(log n).

**Example.**

```
nums = [1,2,3,1] → 2
  (nums[2] = 3 is a peak)
nums = [1,2,1,3,5,6,4] → 1 or 5
  (either peak is correct)
```

**Steps.**

1. Use the boundary template on the predicate "a descent starts here". Compare `nums[mid]` with `nums[mid + 1]`.
2. If `nums[mid] < nums[mid + 1]`, the slope rises to the right. A peak is strictly right of `mid`, because the rise must stop at the −∞ wall. Set `left = mid + 1`.
3. Otherwise, `nums[mid] > nums[mid + 1]`, because the problem excludes equal neighbors. `mid` is on a descent, so a peak is at `mid` or to its left. Set `right = mid`.
4. Loop while `left < right`, then return `left`. The invariant: the interval always contains at least one peak. Each step keeps that true and halves the interval.

**Complexity.** O(log n) time, O(1) space. You need no sorted order, only the guarantee of no equal neighbors.

### Search in Rotated Sorted Array ★

**Problem.** Someone rotated a sorted array of distinct values at an unknown pivot. For example, `[0,1,2,4,5,6,7]` can become `[4,5,6,7,0,1,2]`. Return the index of `target`, or `-1`, in O(log n).

**Example.**

```
nums = [4,5,6,7,0,1,2]
target = 0 → 4
target = 3 → -1
```

**Steps.**

1. Use the Template 1 skeleton: loop while `left <= right`, and return when `nums[mid] === target`.
2. Find the sorted half. `nums[left] <= nums[mid]` means the left half `[left..mid]` contains no pivot. The `<=` matters for the two-element window where `left === mid`.
3. If the left half is sorted, test the target against its range. If `nums[left] <= target && target < nums[mid]`, set `right = mid - 1`. Otherwise, set `left = mid + 1`.
4. If the right half is sorted, mirror the test. If `nums[mid] < target && target <= nums[right]`, set `left = mid + 1`. Otherwise, set `right = mid - 1`.

The insight: you cannot know where `target` is. You can always find one sorted half and do an O(1) range check on it. Inside means search it; outside means search the other half.

**Complexity.** O(log n) time, O(1) space.

### Find First and Last Position of Element in Sorted Array ★

**Problem.** `nums` is sorted non-decreasing and can hold duplicates. Return `[first, last]`, the indexes of the first and last occurrence of `target`. Return `[-1, -1]` if it is absent, in O(log n).

**Example.**

```
nums = [5,7,7,8,8,10]
target = 8 → [3,4]
target = 6 → [-1,-1]
```

**Steps.**

1. Write `lowerBound(nums, x)` with Template 2: the first index with `nums[i] >= x`.
2. Set `first = lowerBound(nums, target)`. If `first === nums.length` or `nums[first] !== target`, the target is absent. Return `[-1, -1]`.
3. Set `last = lowerBound(nums, target + 1) - 1`: the first index past the run of targets, minus one. For non-integer values, write an upper bound instead. For integers, `target + 1` does the same job.
4. Return `[first, last]`. One exact-match search plus a linear expansion degrades to O(n) when the whole array is the target. Two boundary searches do not.

**Complexity.** O(log n) time, O(1) space: two independent binary searches.

### Find Minimum in Rotated Sorted Array

**Problem.** Someone rotated a sorted array of distinct values at an unknown pivot. Return the minimum element in O(log n).

**Example.**

```
nums = [3,4,5,1,2]   → 1
nums = [11,13,15,17] → 11
  (rotation by 0: already sorted)
```

**Steps.**

1. Use the boundary template. Compare `nums[mid]` with `nums[right]`, not with the left end. The left end cannot tell "rotated" from "not rotated".
2. If `nums[mid] > nums[right]`, the break point is strictly right of `mid`, and the minimum comes right after it. Set `left = mid + 1`.
3. Otherwise, `nums[mid] < nums[right]`, because the values are distinct. `mid..right` is sorted, and the minimum is at `mid` or left of it. Set `right = mid`.
4. Loop while `left < right`, then return `nums[left]`. The invariant: the minimum always stays inside `[left, right]`.

**Complexity.** O(log n) time, O(1) space.

### Median of Two Sorted Arrays

**Problem.** Two sorted arrays have sizes `m` and `n`. Return the median of the merged order in O(log(min(m, n))). A merge takes O(m + n), which is too slow for this problem.

**Example.**

```
nums1 = [1,3], nums2 = [2]   → 2.0
nums1 = [1,2], nums2 = [3,4] → 2.5
```

**Steps.**

1. Find a partition of both arrays into left parts and right parts. The left parts together hold `⌈(m+n)/2⌉` elements. Every left-part element is ≤ every right-part element. The median comes from the elements next to the cut.
2. Binary search the cut position `i` in the shorter array (`0..m`). The cut in the longer array follows from it: `j = ⌈(m+n)/2⌉ - i`. One free choice gives the log of the small size.
3. The cut is valid when `nums1[i-1] <= nums2[j]` and `nums2[j-1] <= nums1[i]`. Treat out-of-range values as ±Infinity. If `nums1[i-1] > nums2[j]`, the cut in `nums1` is too far right, so search left. Otherwise, search right.
4. On a valid cut with an odd total, the median is `max(nums1[i-1], nums2[j-1])`. With an even total, it is the average of that maximum and `min(nums1[i], nums2[j])`.
5. The validity of the cut is monotonic in `i`. That makes binary search legal on a problem with no target value.

**Complexity.** O(log(min(m, n))) time, O(1) space.

## Interview follow-ups

- After Search Insert Position: "With duplicates, is it the first or the last valid insertion point?" The lower bound gives the first. The upper bound, the first index with `nums[i] > target`, gives the last.
- After Search in Rotated Sorted Array: "What if values can repeat?" When `nums[left] === nums[mid] === nums[right]`, you cannot classify either half. Shrink both ends by one. The worst case degrades to O(n).
- After Find Peak Element: "Why must neighbors never be equal?" A plateau such as `[2,2,2]` gives the comparison no direction. Either side can hold no peak, which breaks the invariant.
- After Find First and Last Position: "Count the occurrences of `target` in O(log n)." Use `lowerBound(target + 1) - lowerBound(target)`. You need no `-1` and no presence check.

## The task

Write four binary searches, one per template family. Each must run in O(log n) time and O(1) space. A linear scan passes the small tests but is the wrong answer.

### `searchInsert(nums, target)`

`nums` is sorted ascending with distinct integers.

1. If `target` is present, return its index.
2. Otherwise, return the index where inserting `target` keeps `nums` sorted.
3. Do not change the array.

```js
// 2: found
searchInsert([1, 3, 5, 6], 5)
// 1: goes between 1 and 3
searchInsert([1, 3, 5, 6], 2)
// 4: append position
searchInsert([1, 3, 5, 6], 7)
// 0: before everything
searchInsert([1, 3, 5, 6], 0)
searchInsert([], 4) // 0
```

Edge cases:

- An empty array: return 0.
- A target smaller than every element: return 0.
- A target larger than every element: return `nums.length`.
- A single-element array.
- Negative values.

### `findPeakElement(nums)`

A peak is an element strictly greater than its neighbors. The virtual elements outside the array are −∞. So `nums[0]` is a peak if it beats `nums[1]`, and a single element is always a peak.

`nums` is non-empty. `nums[i] !== nums[i + 1]` for every adjacent pair.

1. Return the index of any one peak.

```js
findPeakElement([1, 2, 3, 1]) // 2
// 1 or 5: both are correct
findPeakElement([1, 2, 1, 3, 5, 6, 4])
findPeakElement([1]) // 0
findPeakElement([2, 1]) // 0
findPeakElement([1, 2]) // 1
```

Edge cases:

- A single element.
- A strictly ascending array: the peak is the last index.
- A strictly descending array: the peak is index 0.
- Two elements.

### `searchRotated(nums, target)`

`nums` holds distinct integers. Someone sorted it ascending, then rotated it at an unknown pivot. The rotation can be 0.

1. Return the index of `target`.
2. Return `-1` if `target` is absent.

```js
// 4
searchRotated([4,5,6,7,0,1,2], 0)
// -1
searchRotated([4,5,6,7,0,1,2], 3)
searchRotated([1], 1) // 0
// 1: rotation by 0
searchRotated([1, 2, 3], 2)
```

Edge cases:

- Input with no rotation.
- A single element.
- A target at the pivot.
- An absent target.
- A target at either end.
- Two-element arrays, in both rotations.

### `searchRange(nums, target)`

`nums` is sorted non-decreasing. It can hold duplicates.

1. Return `[first, last]`: the indexes of the first and last occurrence of `target`.
2. Return `[-1, -1]` if `target` is absent.
3. Both searches must be logarithmic. A linear expansion around one hit is O(n) when all values are equal.

```js
// [3, 4]
searchRange([5, 7, 7, 8, 8, 10], 8)
// [-1, -1]
searchRange([5, 7, 7, 8, 8, 10], 6)
searchRange([], 0) // [-1, -1]
searchRange([2, 2, 2], 2) // [0, 2]
searchRange([1, 4], 4) // [1, 1]
```

Edge cases:

- An empty array.
- A single occurrence.
- An array where every element equals `target`.
- An absent target inside the value range.
- A target beyond either end.
- Negative values.
