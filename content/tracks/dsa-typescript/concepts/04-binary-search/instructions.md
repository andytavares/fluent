# Binary Search

## What you'll learn

How to eliminate half the search space per step by exploiting sorted order or monotonic answer spaces. Binary search is O(log n) but the devil is in the boundary conditions — one wrong `<=` or `mid + 1` and you get an infinite loop or miss the answer. You'll implement three problems: classic search, search insert position, and find minimum in a rotated sorted array.

## Key concepts

### The canonical template

```typescript
function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1; // inclusive right bound

  while (left <= right) {      // <= because both bounds are inclusive
    // Avoids integer overflow (matters in Java/C; safe in JS but good habit)
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;
    if (nums[mid] < target)   left = mid + 1;  // eliminate left half
    else                       right = mid - 1; // eliminate right half
  }
  return -1; // not found; left is now the insertion point
}
```

**Key rules:**
1. Loop condition is `left <= right` (inclusive bounds on both sides)
2. On miss: `left = mid + 1` or `right = mid - 1` (never `left = mid` or `right = mid` with this variant — that causes an infinite loop)
3. `mid = left + Math.floor((right - left) / 2)` rounds down

### Search insert position

When `binarySearch` returns `-1`, `left` is exactly where the target would be inserted to keep the array sorted:

```typescript
function searchInsertPosition(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target)   left = mid + 1;
    else                       right = mid - 1;
  }
  return left; // insertion point when not found
}
```

**Why `left` is the answer**: when the loop ends, `left > right`. The last narrowing step placed `left` at the first position where `nums[left] > target`. That is exactly the correct insertion index.

### Find minimum in rotated sorted array

A sorted array rotated at an unknown pivot is still "locally" sorted. Binary search works by checking which half is fully sorted, then asking: "could the minimum live in this half?"

```typescript
function findMinInRotatedArray(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) { // stop when left === right (single element)
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] > nums[right]) {
      // mid is in the left (larger) portion; minimum must be to the right
      left = mid + 1;
    } else {
      // mid is in the right (smaller) portion; minimum is at mid or left of it
      right = mid;  // NOT mid - 1, because mid could be the minimum
    }
  }
  return nums[left]; // left === right at this point
}
```

**Why `right = mid` not `right = mid - 1`**: when `nums[mid] <= nums[right]`, `mid` could itself be the minimum. Excluding it with `mid - 1` would lose the answer.

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `binarySearch` | O(log n) | O(1) | Classic halving |
| `searchInsertPosition` | O(log n) | O(1) | Same; return `left` on miss |
| `findMinInRotatedArray` | O(log n) | O(1) | Compare mid to right bound |

## Common variations

- **First/last position of target** — binary search twice with different tie-break directions
- **Search in rotated sorted array** — determine which half is sorted, then check if target is in it
- **Minimum in rotated with duplicates** — when `nums[mid] === nums[right]`, can't tell which half; `right--` as fallback (degrades to O(n))
- **Binary search on answer space** — "minimum capacity to ship in D days": binary search the capacity value, check feasibility with a greedy scan

## vs other languages

JavaScript `Math.floor((left + right) / 2)` works because JS numbers are 64-bit floats with 53-bit integer precision — you'd need n > 2^52 ≈ 4.5 quadrillion for overflow. In Java/C/Go, `(left + right)` overflows a 32-bit int around n ≈ 2 billion. Write `left + Math.floor((right - left) / 2)` as a cross-language habit.

## Watch out

- **`while (left <= right)` vs `while (left < right)`**: the first variant (inclusive) returns `left` as the insertion point. The second variant (exclusive right) is used when you want `left === right` to be the answer at termination — needed for `findMinInRotatedArray`. Mixing them causes subtle bugs.
- **`right = mid` in rotated array search**: if you write `right = mid - 1`, you exclude `mid` from consideration even though it might be the minimum. The `< right` loop condition plus `right = mid` ensures you converge without losing the candidate.
- **Single-element array**: `findMinInRotatedArray([3])` — `left === right` immediately, loop never runs, returns `nums[0]`. Works correctly.
- **All-same elements with duplicates**: `[3, 3, 1, 3]` — the `nums[mid] > nums[right]` check breaks down when mid equals right. This variant assumes no duplicates.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you find the minimum if there are duplicates?" (When `nums[mid] === nums[right]`, do `right--`. Worst case O(n) but still correct.)
> - "How would you binary search the answer, not the index?" (Define a `feasible(k)` predicate, binary search on the value range. Example: "koko eating bananas", "minimum days to make m bouquets".)
> - "Can you find the rotation pivot?" (`findMinInRotatedArray` finds it — the pivot is at `left`. The original first element is `nums[left]`.)
> - "What if the array is not sorted but you need O(log n)?" (Only works if you can define some other monotonic predicate — e.g., find peak element uses slope direction.)

## The task

Implement three functions:

```typescript
// Return the index of target in the sorted array nums, or -1 if not found.
// [1,3,5,7,9], target=7 → 3
// [1,3,5,7,9], target=6 → -1
function binarySearch(nums: number[], target: number): number

// Return the index where target should be inserted to keep nums sorted.
// If target already exists, return its index.
// [1,3,5,6], target=5 → 2
// [1,3,5,6], target=2 → 1
// [1,3,5,6], target=7 → 4
function searchInsertPosition(nums: number[], target: number): number

// Find and return the minimum element in a rotated sorted array.
// No duplicate elements.
// [3,4,5,1,2] → 1
// [4,5,6,7,0,1,2] → 0
// [11,13,15,17] → 11 (not rotated)
function findMinInRotatedArray(nums: number[]): number
```
