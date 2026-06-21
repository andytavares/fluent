# Binary Search

## What you'll learn

The universal binary search template and how to apply it beyond "find an exact value" — to insertion points, rotated arrays, and any problem where the search space is monotonic.

## Key concepts

Binary search works on any monotonic search space, not just sorted arrays. The pattern: maintain `[left, right]` where the answer definitely lies, halve the space each step.

### Template — find exact value

```js
let left = 0, right = nums.length - 1;
while (left <= right) {
  const mid = left + Math.floor((right - left) / 2); // avoids overflow
  if (nums[mid] === target) return mid;
  else if (nums[mid] < target) left = mid + 1;
  else right = mid - 1;
}
return -1;
```

### Template — find insertion point (leftmost valid position)

```js
let left = 0, right = nums.length; // right = length, not length-1
while (left < right) {             // strict <, not <=
  const mid = left + Math.floor((right - left) / 2);
  if (nums[mid] < target) left = mid + 1;
  else right = mid;                // converge left toward the answer
}
return left;
```

### Rotated array — find the minimum

A rotated sorted array has exactly one "break point." Compare `nums[mid]` to `nums[right]` to determine which half is sorted:

```js
let left = 0, right = nums.length - 1;
while (left < right) {
  const mid = left + Math.floor((right - left) / 2);
  if (nums[mid] > nums[right]) {
    left = mid + 1; // break is in right half; min is there
  } else {
    right = mid;    // mid could be the min; don't exclude it
  }
}
return nums[left];
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| binarySearch | O(log n) | O(1) |
| searchInsertPosition | O(log n) | O(1) |
| findMinInRotatedArray | O(log n) | O(1) |

Each step halves the space: T(n) = T(n/2) + O(1) → O(log n) by the master theorem.

## Common variations

- **Search in rotated sorted array** (LC 33) — determine which half is sorted, check if target is in that half
- **Find first and last position** (LC 34) — two binary searches: leftmost and rightmost occurrence
- **Koko eating bananas** (LC 875) — binary search on the answer; predicate is "can we finish in H hours at speed k?"
- **Median of two sorted arrays** (LC 4) — binary search on partition; O(log(min(m,n)))

## vs other languages

JavaScript has no built-in binary search (`Array.prototype.indexOf` is a linear scan). Java has `Collections.binarySearch`, Python has `bisect.bisect_left`. In interviews you always write it from scratch regardless of language.

## FAANG follow-up questions

After findMinInRotatedArray:
- "What if the array has duplicates?" (LC 154 — when `nums[mid] === nums[right]` you can't determine which side the break is on; only safe move is `right--`; worst case degrades to O(n))
- "How do you find a target in a rotated array?" (first determine which half is sorted, then check if target is in that half)
- "Can binary search work on an infinite sorted array?" (yes — expand bounds exponentially until `nums[right] >= target`, then binary search in `[right/2, right]`)

After searchInsertPosition:
- "Why is `right = nums.length` instead of `nums.length - 1`?" (the insertion point could be past the last element)
- "Can you use this to implement `lower_bound` and `upper_bound`?" (yes — `lower_bound` is searchInsertPosition; `upper_bound` uses `nums[mid] <= target` for left, `nums[mid] > target` for right)

## Watch out

- **Overflow**: use `mid = left + Math.floor((right - left) / 2)`, not `(left + right) / 2`. JS floats make this safe in practice, but interviewers expect the correct habit.
- **Infinite loop**: with the insertion-point template, `right = mid` (not `mid - 1`) combined with `left < right` (not `<=`) ensures termination without skipping the answer.
- **Rotated minimum off-by-one**: use `right = mid` not `mid - 1` — `mid` itself could be the minimum.
- **Rotated with duplicates**: `nums[mid] === nums[right]` — you cannot determine which side is sorted. Only safe move: `right--`.

## The task

### `binarySearch(nums, target)`

Return the index of `target` in sorted array `nums`, or `-1` if not found.

```js
binarySearch([1, 3, 5, 7, 9], 5) // 2
binarySearch([1, 3, 5, 7, 9], 6) // -1
binarySearch([], 1)               // -1
```

### `searchInsertPosition(nums, target)`

Return the index where `target` is found, or where it would be inserted to keep `nums` sorted.

```js
searchInsertPosition([1, 3, 5, 6], 5) // 2
searchInsertPosition([1, 3, 5, 6], 2) // 1
searchInsertPosition([1, 3, 5, 6], 7) // 4
searchInsertPosition([1, 3, 5, 6], 0) // 0
```

### `findMinInRotatedArray(nums)`

A sorted array of unique integers was rotated between 1 and n times. Find and return the minimum element.

```js
findMinInRotatedArray([3, 4, 5, 1, 2])       // 1
findMinInRotatedArray([4, 5, 6, 7, 0, 1, 2]) // 0
findMinInRotatedArray([1])                    // 1
findMinInRotatedArray([2, 1])                 // 1
```
