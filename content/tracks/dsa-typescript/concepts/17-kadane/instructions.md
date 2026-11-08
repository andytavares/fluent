## What you build

You write two O(n) scans: the largest sum of a contiguous subarray, and the same question on a circular array. Kadane's algorithm is the simplest dynamic programming, with the table compressed to one variable. This lesson builds on **Arrays & Strings**.

## Key concepts

### The best subarray that ends at each index

Every non-empty subarray ends at some index. Let `endingHere` be the largest sum of a subarray that ends exactly at index `i`.

```
endingHere(i) = max(
  nums[i],
  endingHere(i-1) + nums[i]
)
```

The best subarray at `i` either extends the one at `i - 1`, or starts again at `i`. A new start wins only when the previous running sum is negative. A negative prefix never helps what follows, so drop it.

```ts
function maxSubArray(
  nums: number[],
): number {
  let endingHere = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    endingHere = Math.max(
      nums[i], endingHere + nums[i]);
    best = Math.max(best, endingHere);
  }
  return best;
}
```

`best` takes the maximum over all endpoints. That is the whole algorithm: one pass, two variables.

### Start both variables at `nums[0]`

Do not start at `0`. A start at `0` allows the empty subarray. On the all-negative input `[-3, -1, -2]`, it returns `0` instead of `-1`. The subarray must contain at least one element.

### Kadane compresses a dynamic programming table

The table form is `dp[i] = max(nums[i], dp[i-1] + nums[i])`, and the answer is `max(dp)`. Each `dp[i]` depends only on `dp[i-1]`, so the array compresses to one variable. Later dynamic programming concepts use this "keep only the previous state" move again and again.

### A circular wrap is the total minus a middle

In a circular array, the best subarray either does not wrap (plain Kadane) or wraps around the boundary. A wrapping subarray is the complement of a contiguous middle block. Its sum is `total − (sum of the skipped middle)`. To maximize the wrap, minimize the skipped middle:

```
answer = max(maxKadane, total − minKadane)
```

`minKadane` is Kadane with `min` in place of `max`: the same recurrence, mirrored.

If all elements are negative, the minimum subarray is the whole array. Then `total − minKadane = 0`, which is the sum of an empty wrap. The empty wrap is not allowed. Detect this case with `maxKadane < 0`, or with `total === minKadane`, and return `maxKadane`.

```ts
// All negative: the wrap would be empty
if (maxKadane < 0) return maxKadane;
return Math.max(
  maxKadane, total - minKadane);
```

### Complexity of the main problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Maximum Subarray | O(n) | O(1) | Kadane |
| Maximum Sum Circular Subarray | O(n) | O(1) | Kadane, min-Kadane and total in one pass |

## Watch out

- A start at `0` instead of `nums[0]` returns `0` on all-negative input. The subarray must be non-empty.
- Compute `endingHere` first, then update `best`. Keep the two lines in the order shown.
- When every element is negative, `total - minKadane` is `0`, an empty wrap. Return plain Kadane, not `0`.
- Do not return `Math.max(maxKadane, 0)` for the all-negative circular case. That also returns `0`.
- A wrap never uses an element twice. The all-negative guard keeps the skipped middle non-empty.
- In every other case, the minimum middle is non-empty. Removing an element from it only makes the wrap bigger.
- The O(n²) "all subarray sums" loops pass small tests and time out on large ones. Sorting does not help either.

## Problem walkthroughs

### Maximum Subarray ★

**Problem.** Given a non-empty integer array `nums`, return the largest sum of any contiguous non-empty subarray.

**Example.**

```
[-2,1,-3,4,-1,2,1,-5,4] → 6
  (subarray [4,-1,2,1])
[-3,-1,-2] → -1
  (single element [-1])
```

**Steps.**

1. Set `endingHere = nums[0]` and `best = nums[0]`.
2. For each `i` from 1, set `endingHere = Math.max(nums[i], endingHere + nums[i])`. A new start wins exactly when the run went negative.
3. Set `best = Math.max(best, endingHere)`.
4. Return `best`.

Why it is correct: every subarray ends at some index. By induction, `endingHere` is optimal for each endpoint, and `best` takes the maximum over all endpoints.

**Complexity.** O(n) time, O(1) space: one pass, two variables.

### Maximum Sum Circular Subarray ★

**Problem.** The same question, but `nums` is circular. A subarray can wrap from the last element to the first. It uses each element at most once, so its length is at most n. It must be non-empty.

**Example.**

```
[1,-2,3,-2] → 3
  (no wrap: [3])
[5,-3,5] → 10
  (wrap: [5, _, 5], skips the -3)
[-3,-2,-3] → -2
  (all negative: one element, no wrap)
```

**Steps.**

1. In one pass, track `maxKadane` (plain Kadane), `minKadane` (Kadane with `min`) and `total` (the sum of all elements). Use two `endingHere` runners, one for max and one for min, both set to `nums[0]`.
2. The best answer with no wrap is `maxKadane`. A wrapping answer is `total − (sum of a contiguous middle)`. It is largest when the middle is `minKadane`.
3. Guard the empty wrap. If `maxKadane < 0`, every element is negative and the minimum subarray is the whole array. Then `total − minKadane === 0` describes an empty subarray, so return `maxKadane`.
4. Otherwise, return `Math.max(maxKadane, total - minKadane)`.

Why the complement view is safe: a wrapping subarray uses a suffix plus a prefix. What it does not use is a contiguous middle block. Min-Kadane minimizes over all contiguous blocks.

**Complexity.** O(n) time, O(1) space. The same single pass computes all values.

## Interview follow-ups

After Maximum Subarray:

- "Return the subarray itself, not only the sum." Record a start candidate at each new start. Save `[start, i]` each time `best` improves.
- "Give a divide and conquer version." Split at the middle. The answer is the maximum of the left half, the right half and the best crossing sum. It runs in O(n log n) and generalizes to segment trees for range queries.
- "Find the maximum product subarray." Track the maximum and the minimum product that end at each index, because a negative number swaps them. It has the same shape with two runners.

After Maximum Sum Circular Subarray:

- "Why can't the answer use an element twice?" A wrap is a suffix plus a prefix. The guard keeps the skipped middle non-empty, so the length is always at most n.
- "Find the circular maximum for a fixed-length window." That needs a different tool: prefix sums on the doubled array with a monotonic deque.

## The task

Write two single-pass maximum-sum scans. Both must run in O(n) time and O(1) extra space.

In both functions, the chosen subarray must contain at least one element. The empty subarray never counts.

### `maxSubArray(nums: number[]): number`

`nums` is a non-empty integer array. Values can be negative.

1. Return the largest sum of a contiguous non-empty subarray of `nums`.

```ts
// 6: subarray [4, -1, 2, 1]
maxSubArray([-2,1,-3,4,-1,2,1,-5,4])
maxSubArray([1]) // 1
// 23: the whole array
maxSubArray([5, 4, -1, 7, 8])
// -1: one element, not 0
maxSubArray([-3, -1, -2])
```

Edge cases:

- A single element.
- All elements negative: return the largest element, never 0.
- All elements positive: return the sum of the whole array.
- A negative prefix: drop it.
- Zeros mixed with negatives.

### `maxSubarraySumCircular(nums: number[]): number`

`nums` is a non-empty integer array in a circle. The element after `nums[n-1]` is `nums[0]`.

1. Return the largest sum of a non-empty subarray of the circular array.
2. Use each element at most once, so the subarray length is at most `n`.

```ts
// 3: [3], no wrap
maxSubarraySumCircular([1, -2, 3, -2])
// 10: [5, 5] wraps and skips -3
maxSubarraySumCircular([5, -3, 5])
// -2: all negative, one element
maxSubarraySumCircular([-3, -2, -3])
// 4: [2, -1, 3] wraps
maxSubarraySumCircular([3, -1, 2, -1])
```

Edge cases:

- A single element.
- All elements negative: the wrap formula gives 0. Return the best element instead.
- The best answer can wrap or not wrap.
- An all-positive array: return the sum of the whole circle.
