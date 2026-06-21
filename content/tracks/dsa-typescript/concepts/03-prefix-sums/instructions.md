# Prefix Sums

## What you'll learn

How to precompute cumulative sums so that any range-sum query costs O(1), and how combining a running prefix sum with a hash map collapses an O(n²) subarray-count problem to O(n). You'll implement `buildPrefixSum`, `rangeSum`, and `subarraySumEqualsK`.

## Key concepts

### Building the prefix array

`prefix[i]` = sum of all elements from index 0 through i inclusive.

```typescript
function buildPrefixSum(nums: number[]): number[] {
  const prefix = new Array<number>(nums.length).fill(0);
  prefix[0] = nums[0];
  for (let i = 1; i < nums.length; i++) {
    prefix[i] = prefix[i - 1] + nums[i];
  }
  return prefix;
}
// [1, 2, 3, 4] → [1, 3, 6, 10]
```

### O(1) range queries

To find the sum of `nums[i..j]`:

```
rangeSum(i, j) = prefix[j] - prefix[i - 1]   (for i > 0)
rangeSum(0, j) = prefix[j]                    (special case: nothing before index 0)
```

The subtraction works because `prefix[j]` already contains the entire left tail that doesn't belong to the range.

```typescript
function rangeSum(prefix: number[], i: number, j: number): number {
  return i === 0 ? prefix[j] : prefix[j] - prefix[i - 1];
}
```

### Subarray sum equals k — prefix sum + hash map

The key insight: if `runningSum - k` appears as a prefix sum earlier in the array, the subarray between that earlier index and the current index sums to k.

```typescript
function subarraySumEqualsK(nums: number[], k: number): number {
  // Seed with {0: 1}: handles subarrays starting at index 0
  // (a running sum equal to k means prefix[0-1] = 0, which we need pre-loaded)
  const counts = new Map<number, number>([[0, 1]]);
  let runningSum = 0;
  let result = 0;

  for (const num of nums) {
    runningSum += num;
    // How many previous prefix sums equal (runningSum - k)?
    result += counts.get(runningSum - k) ?? 0;
    counts.set(runningSum, (counts.get(runningSum) ?? 0) + 1);
  }
  return result;
}
```

**Why seed with `{0: 1}`**: if the running sum at index `j` equals `k`, then `runningSum - k = 0`. We need a count of 1 for prefix sum 0 to capture this case (the subarray `nums[0..j]` sums to `k`).

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `buildPrefixSum` | O(n) | O(n) | One pass |
| `rangeSum` | O(1) | O(1) | Arithmetic lookup |
| `subarraySumEqualsK` | O(n) | O(n) | Map of prefix sums |
| Brute force range sum | O(n) per query | O(1) | Recomputes each time |
| Brute force subarray count | O(n²) | O(1) | All pairs |

## Common variations

- **Subarray sum divisible by k** — same pattern, but store `runningSum % k` in the map
- **Continuous subarray sum (multiple of k)** — modular arithmetic on prefix sums
- **2D prefix sums for grid queries** — `prefix[r][c] = prefix[r-1][c] + prefix[r][c-1] - prefix[r-1][c-1] + grid[r][c]`
- **Find pivot index** — left sum equals right sum; can be derived from prefix array

## vs other languages

Python's `itertools.accumulate` builds a prefix sum in one line. In Go, you'd allocate `make([]int, n)` and iterate. TypeScript has no built-in accumulate, but `Array.from` + `reduce` works — though a plain `for` loop is cleaner and faster here. Avoid `nums.reduce` to build the array; it forces O(n²) if you spread or push on each step.

## Watch out

- **Empty array**: `buildPrefixSum([])` — `prefix[0] = nums[0]` would be `undefined` arithmetic. Guard with a length check and return `[]`.
- **Off-by-one in `rangeSum`**: the formula is `prefix[j] - prefix[i - 1]`, **not** `prefix[j] - prefix[i]`. The `i-1` is intentional — you include `nums[i]` in the sum.
- **`subarraySumEqualsK` seeding**: forgetting the `{0: 1}` seed means subarrays starting at index 0 are never counted. This is the most common bug on this problem.
- **Negative numbers**: unlike sliding window, prefix sums + hash map handles negative numbers naturally. The sliding window shrink logic breaks with negatives; prefix sums do not.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "What if `nums` can have negative values?" (All three functions handle negatives correctly — unlike a two-pointer approach for subarray sum.)
> - "How would you extend `rangeSum` to support updates to `nums`?" (Prefix sum doesn't support updates without rebuilding. This motivates the Fenwick Tree / BIT data structure — O(log n) update and query.)
> - "What is the 2D version of this?" (Grid prefix sums: `P[r][c] = grid[r][c] + P[r-1][c] + P[r][c-1] - P[r-1][c-1]`. Used for rectangle sum queries in O(1).)

## The task

Implement three functions:

```typescript
// Build and return the prefix sum array where prefix[i] = sum of nums[0..i].
// [1, 2, 3, 4] → [1, 3, 6, 10]
// [] → []
function buildPrefixSum(nums: number[]): number[]

// Return the sum of nums[i..j] inclusive using the precomputed prefix array.
// prefix=[1,3,6,10], i=1, j=3 → 9  (2+3+4)
// prefix=[1,3,6,10], i=0, j=2 → 6
function rangeSum(prefix: number[], i: number, j: number): number

// Count the number of contiguous subarrays whose elements sum to exactly k.
// nums=[1,1,1], k=2 → 2
// nums=[1,2,3], k=3 → 2  ([1,2] and [3])
// Handles negative numbers correctly.
function subarraySumEqualsK(nums: number[], k: number): number
```
