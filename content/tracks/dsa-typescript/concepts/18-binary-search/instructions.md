# Binary Search

## What you'll learn

Binary search beyond "find an exact value": the two templates (exact-match and lower-bound), how to pick between them without guessing, and the three classic extensions — rotated arrays, peak finding, and partition search. You'll be able to write a binary search whose loop condition and pointer updates you can *prove* terminate, instead of nudging `+1`s until the tests pass.

## Key concepts

Binary search applies whenever you can answer one question about the middle of the search space — "is the answer left or right of here?" — in O(1). That's a weaker requirement than "the array is sorted": rotated arrays, mountain arrays, and yes/no predicates over a numeric range all qualify. What matters is **monotonicity of the deciding predicate**, not sortedness itself.

### Template 1 — exact match, closed interval `[left, right]`

Use this when you're looking for one specific element and can stop the moment you see it:

```ts
let left = 0, right = nums.length - 1;
while (left <= right) {
  const mid = left + ((right - left) >> 1);
  if (nums[mid] === target) return mid;
  if (nums[mid] < target) left = mid + 1;
  else right = mid - 1;
}
return -1;
```

Invariant: the target, if present, is always inside `[left, right]`. Both updates shrink the interval by at least one, so the loop terminates. When `left > right`, the interval is empty — the target isn't there.

### Template 2 — lower bound, half-open interval `[left, right)`

Use this when you want a **boundary**, not an element: the first index whose value is `>= target` (equivalently, the insertion point):

```ts
let left = 0, right = nums.length;   // right = length, NOT length - 1
while (left < right) {               // strict <, NOT <=
  const mid = left + ((right - left) >> 1);
  if (nums[mid] < target) left = mid + 1;  // mid is too small — answer is right of it
  else right = mid;                        // mid could BE the answer — keep it in range
}
return left;                         // === right; may be nums.length (append position)
```

Invariant: every index left of `left` fails the test (`< target`), every index at or right of `right` passes it (`>= target`). The loop squeezes the two regions together; `left` lands exactly on the first passing index. This one template answers Search Insert Position directly and, run twice, Find First and Last Position.

The two templates are not interchangeable. Template 1's `right = mid - 1` would break Template 2 (it can discard the answer); Template 2's `right = mid` would make Template 1 loop forever when `left === right`. Pick by asking: *am I finding an element, or a boundary?*

### Rotated arrays — one half is always sorted

A sorted array rotated at an unknown pivot (`[4,5,6,7,0,1,2]`) isn't sorted, but split it anywhere and **at least one half is**. Check `nums[left] <= nums[mid]` to learn which; then check whether the target lies inside that sorted half's value range — a plain O(1) range test — and recurse into the correct side:

```ts
if (nums[left] <= nums[mid]) {                       // left half sorted
  if (nums[left] <= target && target < nums[mid]) right = mid - 1;
  else left = mid + 1;
} else {                                             // right half sorted
  if (nums[mid] < target && target <= nums[right]) left = mid + 1;
  else right = mid - 1;
}
```

### Peak finding — binary search without sorted input

`nums` has no order at all, only the guarantee `nums[i] !== nums[i + 1]`. Compare `mid` with its right neighbor: if `nums[mid] < nums[mid + 1]` you're on an ascending slope, and *some* peak must exist to the right (the array can't ascend forever — it ends). Otherwise a peak exists at `mid` or to the left. That single comparison is the monotonic predicate; the array never needs to be sorted.

```ts
let left = 0, right = nums.length - 1;
while (left < right) {
  const mid = left + ((right - left) >> 1);
  if (nums[mid] < nums[mid + 1]) left = mid + 1;  // climb the slope
  else right = mid;                               // peak at mid or left of it
}
return left;
```

`mid + 1` is always in bounds because `left < right` guarantees `mid < right`.

### Complexity of the flagship problems

| Problem | Time | Space | Template |
|---------|------|-------|----------|
| Search Insert Position | O(log n) | O(1) | lower bound |
| Find Peak Element | O(log n) | O(1) | boundary on the slope predicate |
| Search in Rotated Sorted Array | O(log n) | O(1) | exact match + sorted-half test |
| Find First and Last Position | O(log n) | O(1) | lower bound, run twice |

## Watch out

- **Mixing the templates** is the classic binary search bug. `while (left < right)` with `right = mid - 1`, or `while (left <= right)` with `right = mid` — both are wrong, each in a different way (skipped answers vs infinite loop).
- **Infinite loop check**: with `left < right` and `right = mid`, the interval only shrinks because `mid` rounds *down* — `mid < right` always. If you ever write `left = mid` (upper-bound variants), you must round the midpoint *up* or the loop stalls at two elements.
- **`nums[left] <= nums[mid]`, not `<`** in rotated-array search: when `left === mid` (two-element window), the left "half" is the single element `nums[left]`, which is trivially sorted. Using `<` misclassifies it and sends you down the wrong side.
- **Range tests need the right inclusivity**: `nums[left] <= target && target < nums[mid]` — the `mid` end is exclusive because you already know `nums[mid] !== target`.
- **Lower bound can return `nums.length`** — a perfectly valid insertion point (append). Don't index into the array with the result before checking.
- **`(left + right) >> 1` can't overflow at these sizes** in TS/JS numbers (doubles hold 2^53), but write `left + ((right - left) >> 1)` anyway — it's the habit every other language needs, and interviewers look for it.
- **First/Last position**: after the first lower bound, check `nums[first] === target` before searching for the end — the target may be absent entirely.

## Problem walkthroughs

### Search Insert Position ★

**Problem.** `nums` is sorted ascending with distinct values. Return the index of `target` if present; otherwise return the index where it would be inserted to keep the array sorted. Must run in O(log n).

**Example.**

    nums = [1,3,5,6], target = 5 → 2
    nums = [1,3,5,6], target = 2 → 1
    nums = [1,3,5,6], target = 7 → 4

**Steps.**
1. This is the lower bound verbatim: the answer is the first index with `nums[i] >= target` — whether or not `target` is present, that index is correct.
2. Set `left = 0`, `right = nums.length`; loop while `left < right`.
3. If `nums[mid] < target`, the insertion point is right of `mid`: `left = mid + 1`. Otherwise `mid` might be it: `right = mid`.
4. Return `left`. No separate "found" case is needed — if `target` exists, the first `>= target` index *is* its index (values are distinct).

**Complexity.** O(log n) time / O(1) space — the interval halves every step.

### Search a 2D Matrix

**Problem.** An `m × n` matrix where each row is sorted ascending and each row's first value is greater than the previous row's last value. Return `true` if `target` is in the matrix. O(log(m·n)) required.

**Example.**

    matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3  → true
    matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13 → false

**Steps.**
1. The row-boundary property means reading the matrix row by row yields one fully sorted list of `m·n` values — so search it as one virtual array instead of two nested searches.
2. Run Template 1 on indexes `0 .. m*n - 1`.
3. Map a flat index to coordinates on the fly: `row = Math.floor(mid / n)`, `col = mid % n`, value `matrix[row][col]`.
4. Compare that value to `target` and move `left`/`right` exactly as in the plain template. The mapping is the entire trick — no data is copied.

**Complexity.** O(log(m·n)) time / O(1) space.

### Find Peak Element ★

**Problem.** A peak is an element strictly greater than both neighbors; virtual neighbors beyond the array edges are −∞. Given `nums` with `nums[i] !== nums[i + 1]` for all adjacent pairs, return the index of **any** peak, in O(log n).

**Example.**

    nums = [1,2,3,1]     → 2         (nums[2] = 3 is a peak)
    nums = [1,2,1,3,5,6,4] → 1 or 5  (either peak is accepted)

**Steps.**
1. Use the boundary template on the predicate "descending starts here": compare `nums[mid]` with `nums[mid + 1]`.
2. If `nums[mid] < nums[mid + 1]`, the slope rises to the right — a peak is strictly right of `mid` (follow the rise; it must top out because the array ends at a −∞ wall). Set `left = mid + 1`.
3. Otherwise `nums[mid] > nums[mid + 1]` (equality is excluded by the problem), so `mid` sits on a descent — a peak is at `mid` or to its left. Set `right = mid`.
4. Loop while `left < right`; return `left`. The invariant: the interval always contains at least one peak, and each step preserves that while halving the interval.

**Complexity.** O(log n) time / O(1) space — no sorted order needed, only the no-equal-neighbors guarantee.

### Search in Rotated Sorted Array ★

**Problem.** A sorted array of **distinct** values was rotated at an unknown pivot (`[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`). Return the index of `target`, or `-1`. O(log n) required.

**Example.**

    nums = [4,5,6,7,0,1,2], target = 0 → 4
    nums = [4,5,6,7,0,1,2], target = 3 → -1

**Steps.**
1. Template 1 skeleton: `left <= right`, return on `nums[mid] === target`.
2. Decide which half is sorted: `nums[left] <= nums[mid]` means the left half `[left..mid]` contains no pivot and is fully sorted (the `<=` matters for the two-element window where `left === mid`).
3. If the left half is sorted, test whether `target` is inside its value range: `nums[left] <= target && target < nums[mid]` → `right = mid - 1`; otherwise `left = mid + 1`.
4. If the right half is sorted instead, mirror the test: `nums[mid] < target && target <= nums[right]` → `left = mid + 1`; otherwise `right = mid - 1`.
5. The insight: you can't know where `target` is, but you *can* always identify one perfectly sorted half and do an O(1) range check against it — inside means search it, outside means search the other half.

**Complexity.** O(log n) time / O(1) space.

### Find First and Last Position of Element in Sorted Array ★

**Problem.** `nums` is sorted non-decreasing (duplicates allowed). Return `[first, last]`, the indexes of the first and last occurrence of `target`, or `[-1, -1]` if absent. O(log n) required.

**Example.**

    nums = [5,7,7,8,8,10], target = 8 → [3,4]
    nums = [5,7,7,8,8,10], target = 6 → [-1,-1]

**Steps.**
1. Write `lowerBound(nums, x)` — Template 2, first index with `nums[i] >= x`.
2. `first = lowerBound(nums, target)`. If `first === nums.length` or `nums[first] !== target`, the target is absent: return `[-1, -1]`.
3. `last = lowerBound(nums, target + 1) - 1` — the first index past the run of targets, minus one. (For non-integer domains you'd write an upper-bound instead; for integers, `target + 1` does the same job.)
4. Return `[first, last]`. Two boundary searches beat one exact-match search plus linear expansion, which degrades to O(n) when the whole array is the target.

**Complexity.** O(log n) time / O(1) space — two independent binary searches.

### Find Minimum in Rotated Sorted Array

**Problem.** A sorted array of distinct values rotated at an unknown pivot. Return the minimum element in O(log n).

**Example.**

    nums = [3,4,5,1,2]     → 1
    nums = [11,13,15,17]   → 11   (rotation by 0 — already sorted)

**Steps.**
1. Boundary template, comparing `nums[mid]` against `nums[right]` (the right end, not the left — the left end can't distinguish "rotated" from "not rotated").
2. If `nums[mid] > nums[right]`, the break point (and the minimum right after it) is strictly right of `mid`: `left = mid + 1`.
3. Otherwise `nums[mid] < nums[right]` (distinct values), so `mid..right` is sorted and the minimum is at `mid` or left of it: `right = mid`.
4. Loop while `left < right`; return `nums[left]`. The invariant: the minimum always stays inside `[left, right]`.

**Complexity.** O(log n) time / O(1) space.

### Median of Two Sorted Arrays

**Problem.** Two sorted arrays of sizes `m` and `n`. Return the median of the merged order in O(log(min(m, n))) — merging (O(m + n)) is too slow by the problem's own bar.

**Example.**

    nums1 = [1,3], nums2 = [2]   → 2.0
    nums1 = [1,2], nums2 = [3,4] → 2.5

**Steps.**
1. Reframe: find a **partition** of both arrays into left parts and right parts such that (a) the left parts together hold `⌈(m+n)/2⌉` elements and (b) every left-part element ≤ every right-part element. The median then comes from the elements adjacent to the cut.
2. Binary search the cut position `i` in the *shorter* array (`0..m`); the cut in the longer array is forced: `j = ⌈(m+n)/2⌉ - i`. One degree of freedom, log of the small size.
3. The cut is valid when `nums1[i-1] <= nums2[j]` and `nums2[j-1] <= nums1[i]` (treat out-of-range as ±Infinity). If `nums1[i-1] > nums2[j]`, the cut in `nums1` is too far right — search left. Otherwise search right.
4. On a valid cut: odd total → median is `max(nums1[i-1], nums2[j-1])`; even total → average of that max and `min(nums1[i], nums2[j])`.
5. Validity of the cut is monotonic in `i` — that's what makes binary search legal on a problem with no target value at all.

**Complexity.** O(log(min(m, n))) time / O(1) space.

## Interview follow-ups

- After **Search Insert Position**: "Duplicates allowed — first valid insertion point or last?" (lower bound gives the first; upper bound — first index with `nums[i] > target` — gives the last.)
- After **Search in Rotated Sorted Array**: "What if values can repeat?" (when `nums[left] === nums[mid] === nums[right]` you can't classify either half — shrink both ends by one; worst case degrades to O(n).)
- After **Find Peak Element**: "Why can't equal neighbors be allowed?" (a plateau `[2,2,2]` gives the comparison no direction — either side might hold no peak, breaking the invariant.)
- After **Find First and Last Position**: "Count occurrences of `target` in O(log n)?" (`lowerBound(target + 1) - lowerBound(target)` — no `-1`, no presence check needed.)

## The task

Four binary searches, one per template family. Each must run in O(log n) time and O(1) space — a linear scan passes the small tests but is the wrong answer.

### `searchInsert(nums: number[], target: number): number`

`nums` is sorted ascending with **distinct** integers. Return the index of `target` if it's present; otherwise return the index at which it would be inserted to keep `nums` sorted. Do not modify the array.

```ts
searchInsert([1, 3, 5, 6], 5);  // 2  (found)
searchInsert([1, 3, 5, 6], 2);  // 1  (would go between 1 and 3)
searchInsert([1, 3, 5, 6], 7);  // 4  (append position)
searchInsert([1, 3, 5, 6], 0);  // 0  (before everything)
searchInsert([], 4);            // 0
```

Edge cases: empty array (return 0), target smaller than everything, target larger than everything (return `nums.length`), single-element array, negative values.

### `findPeakElement(nums: number[]): number`

A peak is an element strictly greater than its neighbors, where the virtual elements just outside the array are −∞ (so `nums[0]` is a peak if it beats `nums[1]`, and a single element is always a peak). `nums` is non-empty and `nums[i] !== nums[i + 1]` for every adjacent pair. Return the index of **any one** peak.

```ts
findPeakElement([1, 2, 3, 1]);          // 2
findPeakElement([1, 2, 1, 3, 5, 6, 4]); // 1 or 5 — both accepted
findPeakElement([1]);                   // 0
findPeakElement([2, 1]);                // 0
findPeakElement([1, 2]);                // 1
```

Edge cases: single element, strictly ascending array (peak is the last index), strictly descending array (peak is index 0), two elements.

### `searchRotated(nums: number[], target: number): number`

`nums` was sorted ascending with **distinct** integers, then rotated at an unknown pivot (possibly not rotated at all). Return the index of `target`, or `-1` if it isn't present.

```ts
searchRotated([4, 5, 6, 7, 0, 1, 2], 0); // 4
searchRotated([4, 5, 6, 7, 0, 1, 2], 3); // -1
searchRotated([1], 1);                   // 0
searchRotated([1, 2, 3], 2);             // 1  (rotation by 0)
```

Edge cases: unrotated input, single element, target at the pivot, target absent, target at either end, two-element arrays (both rotations).

### `searchRange(nums: number[], target: number): number[]`

`nums` is sorted non-decreasing (duplicates allowed). Return `[first, last]` — the indexes of the first and last occurrence of `target` — or `[-1, -1]` if `target` isn't present. Both searches must be logarithmic: expanding linearly around one hit degrades to O(n) when the array is all duplicates.

```ts
searchRange([5, 7, 7, 8, 8, 10], 8); // [3, 4]
searchRange([5, 7, 7, 8, 8, 10], 6); // [-1, -1]
searchRange([], 0);                  // [-1, -1]
searchRange([2, 2, 2], 2);           // [0, 2]
searchRange([1, 4], 4);              // [1, 1]
```

Edge cases: empty array, single occurrence, the entire array equal to `target`, target absent but inside the value range, target beyond either end, negative values.
