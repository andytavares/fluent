# Two Pointers

## What you'll learn

The two-pointer pattern and its three canonical forms: opposite-direction (converging), same-direction (fast/slow), and the three-sum reduction from O(n³) to O(n²).

## Key concepts

Two pointers eliminates nested loops by exploiting sorted order or structural symmetry. The core insight: in a sorted structure, knowing one pointer's relationship to the target tells you exactly which direction the other pointer must move. This monotonicity is what makes convergence safe.

### Opposite-direction (converging) — palindrome, container water

```js
let left = 0, right = arr.length - 1;
while (left < right) {
  if (condition) {
    // record result
  } else if (needBigger) {
    left++;
  } else {
    right--;
  }
}
```

### Same-direction (fast/slow) — partition, dedupe

```js
let slow = 0;
for (let fast = 0; fast < arr.length; fast++) {
  if (keep(arr[fast])) arr[slow++] = arr[fast];
}
```

### Sorted array + outer loop — three-sum, four-sum

```js
nums.sort((a, b) => a - b);
for (let i = 0; i < nums.length - 2; i++) {
  if (i > 0 && nums[i] === nums[i - 1]) continue; // skip duplicate pivots
  let left = i + 1, right = nums.length - 1;
  while (left < right) {
    const sum = nums[i] + nums[left] + nums[right];
    if (sum === 0) {
      result.push([nums[i], nums[left], nums[right]]);
      while (left < right && nums[left] === nums[left + 1]) left++;   // skip dup
      while (left < right && nums[right] === nums[right - 1]) right--; // skip dup
      left++; right--;
    } else if (sum < 0) {
      left++;
    } else {
      right--;
    }
  }
}
```

## Time and space complexity

| Problem | Time | Space | Notes |
|---------|------|-------|-------|
| isPalindrome | O(n) | O(1) | single pass, no allocation |
| containerWithMostWater | O(n) | O(1) | single converging pass |
| threeSum | O(n²) | O(1) output-excluded | sort is O(n log n), inner two-pointer loop is O(n) per pivot |

Two pointers vs brute force:

| | isPalindrome | container water | three-sum |
|-|-------------|-----------------|-----------|
| Brute | O(n) with O(n) new string | O(n²) pairs | O(n³) |
| Two pointers | O(n) O(1) | O(n) O(1) | O(n²) O(1) |

## Common variations

- **Two Sum II** (sorted array) — converging pointers, O(n)
- **Trapping Rain Water** — two-pointer or stack; left/right max at each position
- **Sort Colors** (Dutch national flag) — three pointers: lo, mid, hi
- **Remove Duplicates from Sorted Array** — fast/slow, slow marks the write position

## vs other languages

JavaScript's `Array.prototype.sort` comparator must be explicit — `(a, b) => a - b` — otherwise it sorts lexicographically and `[10, 9, 2].sort()` gives `[10, 2, 9]`. This is the single most common bug in interview submissions.

## FAANG follow-up questions

After solving threeSum:
- "What if the array is not sorted and you can't sort it?" (hash set approach, O(n²) time, O(n) space)
- "What if you want four numbers summing to a target?" (add one more outer loop, still O(n³) → O(n²) improvement)
- "How do you handle very large inputs where sort is expensive?" (radix sort if bounded integers)

After containerWithMostWater:
- "Could there be multiple correct pairs with the same max area? Does your code return all of them?" (no, just the value — pivot the question to correctness)
- "What if heights can be 0?" (area is 0 for that pair; the algorithm handles it naturally)

## Watch out

- **Off-by-one in threeSum**: the inner while loops that skip duplicates must check `left < right` before advancing, otherwise you can cross pointers.
- **Duplicate pivot skipping**: skip `nums[i] === nums[i-1]` only when `i > 0`, not at `i === 0`.
- **isPalindrome infinite loop**: if you forget to advance `left`/`right` after a match, the outer loop never terminates.
- **containerWithMostWater**: moving the taller pointer inward is always wrong — you reduce width but can't increase height above the shorter one. Always move the shorter pointer.

## The task

### `isPalindrome(s)`

Return `true` if `s` is a palindrome ignoring non-alphanumeric characters and case.

```js
isPalindrome("A man, a plan, a canal: Panama") // true
isPalindrome("race a car")                      // false
isPalindrome(" ")                               // true
```

Use converging pointers. Skip non-alphanumeric characters in-place — do not build a cleaned string.

### `containerWithMostWater(heights)`

Given heights of vertical lines, find the two lines forming the container with the most water. Return the maximum area.

```js
containerWithMostWater([1, 8, 6, 2, 5, 4, 8, 3, 7]) // 49
containerWithMostWater([1, 1])                        // 1
```

Area = `Math.min(heights[left], heights[right]) * (right - left)`. Move the shorter-line pointer inward.

### `threeSum(nums)`

Return all unique triplets `[nums[i], nums[j], nums[k]]` such that `i`, `j`, `k` are distinct and their sum is 0. The result must contain no duplicate triplets.

```js
threeSum([-1, 0, 1, 2, -1, -4]) // [[-1, -1, 2], [-1, 0, 1]]
threeSum([0, 1, 1])              // []
threeSum([0, 0, 0])              // [[0, 0, 0]]
```

Sort first. Fix one element, then use converging pointers for the remaining pair. Skip duplicate values at both the pivot and the inner pointers.
