# Kadane's Algorithm

## What you'll learn

Building on the greedy single-pass scans from Arrays & Strings, this concept covers Kadane's algorithm: the O(n) answer to "which contiguous subarray has the largest sum?" It's the simplest example of dynamic programming with the table compressed to a single variable, and the min/max mirror trick that solves the circular variant. After this you'll recognize the "best ending here" recurrence in a dozen disguises — it's the warm-up for the DP concepts ahead.

## Key concepts

### The recurrence — best subarray *ending* at each index

Every non-empty subarray ends somewhere. So classify by endpoint: let `endingHere` be the largest sum of a subarray that ends exactly at index `i`. Then:

```
endingHere(i) = max(nums[i], endingHere(i-1) + nums[i])
```

Either the best subarray ending at `i` extends the best one ending at `i - 1`, or it starts fresh at `i` — and starting fresh is only better when the previous running sum is **negative**. A negative prefix can never help what follows; drop it.

```java
public static int maxSubArray(int[] nums) {
    int endingHere = nums[0];
    int best = nums[0];
    for (int i = 1; i < nums.length; i++) {
        endingHere = Math.max(nums[i], endingHere + nums[i]);
        best = Math.max(best, endingHere);
    }
    return best;
}
```

`best` folds over all endpoints. That's the whole algorithm: one pass, two variables.

### Why initialization matters

Start both variables at `nums[0]`, not `0`. Starting at `0` silently allows the empty subarray — on all-negative input (`[-3, -1, -2]`) it would return `0` instead of the correct `-1`. The subarray must contain at least one element.

### Kadane is compressed DP

The DP formulation is `dp[i] = max(nums[i], dp[i-1] + nums[i])` with answer `max(dp)`. Since `dp[i]` depends only on `dp[i-1]`, the array compresses to one variable. This "keep only the previous state" move reappears throughout the DP concepts — Kadane is where it's easiest to see.

### The circular trick — max wrap = total − min middle

In a circular array, the best subarray either doesn't wrap (plain Kadane) or wraps around the boundary. A wrapping subarray is the **complement of a contiguous middle**: its sum is `total − (sum of the subarray it skips)`. Maximizing the wrap means **minimizing** the skipped middle:

```
answer = max(maxKadane, total − minKadane)
```

`minKadane` is Kadane with `min` in place of `max` — the same recurrence mirrored.

**The one trap**: if *all* elements are negative, the minimum subarray is the whole array, so `total − minKadane = 0` — the sum of an *empty* wrap, which isn't allowed. In that case (detectable as `maxKadane < 0`, or equivalently `total == minKadane` when the min consumed everything) return plain `maxKadane`.

```java
if (maxKadane < 0) return maxKadane;      // all negative — wrap would be empty
return Math.max(maxKadane, total - minKadane);
```

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Maximum Subarray | O(n) | O(1) | Kadane |
| Maximum Sum Circular Subarray | O(n) | O(1) | Kadane + min-Kadane + total, one pass |

## vs other languages

Same algorithm everywhere; Java's fixed-width `int` is actually the natural fit here — no floating-point coercion surprises like JavaScript's `Number`. The sums in these problems stay well within `int` range for any reasonable input size, so no `long` is needed (unlike the Math concept, where squaring or negating near `Integer.MIN_VALUE`/`MAX_VALUE` forces the issue).

## Watch out

- **Initialize with `nums[0]`, not `0`** — the classic all-negative bug. The subarray must be non-empty.
- **Update order**: compute `endingHere` first, then fold into `best`. Folding before updating skips index 0's contribution pattern; keep the two lines in the order shown.
- **Circular all-negative guard**: `total - minKadane` is `0` when every element is negative — an empty wrap. Return the plain Kadane answer in that case, not `0` and not `Math.max(maxKadane, 0)`.
- **A wrap never uses an element twice**: the skipped middle must be non-empty for the wrap to be a real subarray — the all-negative guard is exactly what enforces this; no other case can skip nothing (removing an element from the min-middle would only make the wrap bigger unless all elements are negative).
- **Don't sort, don't prefix-sum with nested loops** — the O(n²) "all subarray sums" approach passes small tests and times out on large ones. One pass is the point.

## Problem walkthroughs

### Maximum Subarray ★

**Problem.** Given a non-empty integer array `nums`, return the largest sum of any contiguous non-empty subarray.

**Example.**

    [-2,1,-3,4,-1,2,1,-5,4] → 6    (subarray [4,-1,2,1])
    [-3,-1,-2]              → -1   (single element [-1])

**Steps.**
1. Initialize `endingHere = nums[0]` and `best = nums[0]`.
2. For each `i` from 1: `endingHere = Math.max(nums[i], endingHere + nums[i])` — extend the previous run or start fresh; fresh wins exactly when the run went negative.
3. Fold: `best = Math.max(best, endingHere)`.
4. Return `best`. Correctness: every subarray ends at some index, `endingHere` is optimal for each endpoint by induction, and `best` takes the max over all endpoints.

**Complexity.** O(n) time / O(1) space — one pass, two variables.

### Maximum Sum Circular Subarray ★

**Problem.** Same question, but `nums` is circular: a subarray may wrap from the last element around to the first. Each element may be used at most once (subarray length ≤ n, and it must be non-empty).

**Example.**

    [1,-2,3,-2]  → 3    (no wrap: [3])
    [5,-3,5]     → 10   (wrap: [5, _, 5] — skips the -3)
    [-3,-2,-3]   → -2   (all negative: single element, NO wrapping)

**Steps.**
1. In one pass, track four values: `maxKadane` (plain Kadane), `minKadane` (Kadane mirrored with `min`), and `total` (sum of everything). Two `endingHere` runners, one for max and one for min, both seeded with `nums[0]`.
2. A non-wrapping answer is `maxKadane`. A wrapping answer is the complement of some contiguous middle: `total − (that middle's sum)`, maximized when the middle is `minKadane`.
3. Guard the empty wrap: if `maxKadane < 0`, every element is negative, the minimum subarray is the entire array, and `total − minKadane == 0` would describe an empty subarray — return `maxKadane` directly.
4. Otherwise return `Math.max(maxKadane, total - minKadane)`.
5. Why the complement view is safe: a wrapping subarray uses a suffix plus a prefix; what it *doesn't* use is a contiguous middle block. Minimizing the unused block over all contiguous blocks is exactly min-Kadane.

**Complexity.** O(n) time / O(1) space — the same single pass computes all four values.

## Interview follow-ups

After Maximum Subarray:
- "Return the subarray itself, not just the sum." — record a start candidate whenever you start fresh, and commit `[start, i]` whenever `best` improves.
- "Divide & conquer version?" — split at mid; the answer is max(left, right, best crossing sum) — O(n log n), worth knowing because it generalizes to segment trees for range queries.
- "Maximum *product* subarray?" — track max and min ending here (negatives flip them): same shape, two runners.

After Maximum Sum Circular Subarray:
- "Why can't the answer use an element twice?" — a wrap is suffix + prefix; the guard ensures the skipped middle is non-empty, so length ≤ n always holds.
- "Fixed-length-window circular max?" — different tool: prefix sums on the doubled array with a monotonic deque.

## The task

Two single-pass maximum-sum scans. Both must run in O(n) time and O(1) extra space; in both, the chosen subarray must contain **at least one element** (the empty subarray never counts).

### `maxSubArray(int[] nums)`

`nums` is a non-empty integer array (values may be negative). Return the largest possible sum of a contiguous non-empty subarray of `nums`.

```java
maxSubArray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4}); // 6   — subarray [4, -1, 2, 1]
maxSubArray(new int[]{1});                             // 1
maxSubArray(new int[]{5, 4, -1, 7, 8});                // 23  — the whole array
maxSubArray(new int[]{-3, -1, -2});                    // -1  — single element, NOT 0
```

Edge cases: single element, all elements negative (return the largest element, never 0), all elements positive (the whole array), a negative prefix that must be dropped, zeros mixed with negatives.

### `maxSubarraySumCircular(int[] nums)`

`nums` is a non-empty integer array laid out in a **circle**: the element after `nums[n-1]` is `nums[0]`. Return the largest possible sum of a non-empty subarray of the circular array, where each element may be used at most once (the subarray's length is at most `n`).

```java
maxSubarraySumCircular(new int[]{1, -2, 3, -2});  // 3   — [3], no wrap needed
maxSubarraySumCircular(new int[]{5, -3, 5});      // 10  — [5, 5] wrapping around, skipping -3
maxSubarraySumCircular(new int[]{-3, -2, -3});    // -2  — all negative: single element
maxSubarraySumCircular(new int[]{3, -1, 2, -1});  // 4   — [2, -1, 3] wrapping
```

Edge cases: single element, all elements negative (the wrap formula degenerates to 0 — you must return the best element instead), the best answer wrapping vs not wrapping, an all-positive array (the whole circle, sum of everything).
