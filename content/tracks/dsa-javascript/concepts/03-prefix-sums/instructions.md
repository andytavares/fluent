# Prefix Sums

## What you'll learn

How prefix sum arrays enable O(1) range queries, and how the "running prefix + hash map" trick solves subarray count problems in O(n) — the pattern behind LeetCode 560, 974, and several FAANG favorites.

## Key concepts

A prefix sum array stores `prefix[i] = sum of nums[0..i-1]`. With that, any range `[i, j]` sums to `prefix[j+1] - prefix[i]` in O(1).

### Build

```js
function buildPrefixSum(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  return prefix; // length n+1; prefix[0] = 0
}
```

### Range query

```js
// sum of nums[i..j] inclusive
function rangeSum(prefix, i, j) {
  return prefix[j + 1] - prefix[i];
}
```

### Running prefix + hash map — count subarrays summing to k

The key identity: `prefix[j] - prefix[i] === k` means `nums[i..j-1]` sums to `k`. Rearranging: at position `j`, we want to know how many previous prefix sums equal `prefix[j] - k`. One pass with a Map answers that.

```js
function subarraySumEqualsK(nums, k) {
  const counts = new Map([[0, 1]]); // seed: empty prefix (sum=0) seen once
  let running = 0, result = 0;
  for (const n of nums) {
    running += n;
    result += counts.get(running - k) ?? 0; // subarrays ending here
    counts.set(running, (counts.get(running) ?? 0) + 1);
  }
  return result;
}
```

Seeding `counts` with `{0: 1}` handles the case where the entire prefix from index 0 sums to `k`.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| buildPrefixSum | O(n) | O(n) |
| rangeSum | O(1) per query | O(1) |
| subarraySumEqualsK | O(n) | O(n) |

Without prefix sums: O(n) per range query; O(n²) to count subarrays summing to k.

## Common variations

- **Subarray sum divisible by k** (LC 974) — track `prefix % k` in the map; two equal remainders span a subarray divisible by k
- **Pivot index / equilibrium index** — find where left sum equals right sum; O(n) with prefix
- **Range sum queries on 2D matrix** — 2D prefix sums; `query(r1,c1,r2,c2)` in O(1)
- **Product of array except self** — prefix products + suffix products, no division

## vs other languages

Python's `itertools.accumulate` builds prefix sums in one line. JavaScript has no equivalent in the standard library — you write the loop manually or use `reduce`. The algorithm is identical.

## FAANG follow-up questions

After subarraySumEqualsK:
- "Does this work with negative numbers?" (yes — unlike sliding window, which requires non-negative values for the shrink step to be safe)
- "Can you find the subarray itself, not just the count?" (store the index along with each prefix sum in the map; reconstruct using the stored index)
- "What if k=0?" (the seed `{0:1}` handles it; any prefix sum we've seen before means the span between those two indices sums to 0)

After rangeSum:
- "What if the array is mutable (updates happen between queries)?" (Binary Indexed Tree / Fenwick Tree: O(log n) update and query)

## Watch out

- **Off-by-one**: `prefix` has length `n+1`. `prefix[i]` is the sum of the first `i` elements (not including index `i`). `rangeSum(prefix, i, j)` is `prefix[j+1] - prefix[i]`.
- **Map seed**: forgetting `Map([[0, 1]])` causes the function to miss subarrays that start at index 0.
- **Integer overflow**: for very large arrays with large values, JavaScript's number type can lose precision beyond 2^53. In interviews, acknowledge this and mention BigInt or language-specific int64.
- **Negative numbers**: subarraySumEqualsK works with negatives; sliding window does not (because shrinking the window can increase the sum when negatives are present).

## The task

### `buildPrefixSum(nums)`

Return a prefix sum array of length `nums.length + 1` where `prefix[0] = 0` and `prefix[i] = nums[0] + ... + nums[i-1]`.

```js
buildPrefixSum([1, 2, 3, 4]) // [0, 1, 3, 6, 10]
buildPrefixSum([])           // [0]
```

### `rangeSum(prefix, i, j)`

Using a prefix array from `buildPrefixSum`, return the sum of the original array from index `i` to `j` inclusive.

```js
const p = buildPrefixSum([1, 2, 3, 4]);
rangeSum(p, 1, 3) // 9
rangeSum(p, 0, 0) // 1
```

### `subarraySumEqualsK(nums, k)`

Return the number of contiguous subarrays that sum to exactly `k`. Must handle negative numbers and `k = 0`.

```js
subarraySumEqualsK([1, 1, 1], 2)       // 2
subarraySumEqualsK([1, 2, 3], 3)       // 2
subarraySumEqualsK([1, -1, 1, -1], 0)  // 4
subarraySumEqualsK([0, 0, 0], 0)       // 6
```
