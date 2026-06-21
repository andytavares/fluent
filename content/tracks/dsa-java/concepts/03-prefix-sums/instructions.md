# Prefix Sums

## What you'll learn

How to answer range-sum queries in O(1) after an O(n) preprocessing step, and how to count subarrays with a target sum in O(n) by combining prefix sums with a hash map.

## Key concepts

### Building the prefix array

`prefix[i]` = sum of `nums[0..i-1]`. The array has length `n+1`; `prefix[0] = 0` is a sentinel that makes all range queries uniform.

```java
int[] prefix = new int[nums.length + 1]; // prefix[0] = 0 implicitly
for (int i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
}
```

### Range sum query — O(1)

The key identity: `sum(left..right) = prefix[right+1] - prefix[left]`.

```java
// sum of nums[left..right] inclusive, 0-indexed
int rangeSum = prefix[right + 1] - prefix[left];
```

### Subarray sum equals K — HashMap + running sum

Find the count of subarrays summing to `k`. At each index, if `runningSum - k` has been seen before, everything between that earlier prefix and the current index sums to `k`.

```java
var seen = new HashMap<Integer, Integer>(); // runningSum -> count
seen.put(0, 1);  // empty prefix — handles subarrays starting at index 0
int sum = 0, result = 0;
for (int n : nums) {
    sum += n;
    result += seen.getOrDefault(sum - k, 0);
    seen.merge(sum, 1, Integer::sum);
}
return result;
```

## Time and space complexity

| Operation | Time | Space | Why |
|-----------|------|-------|-----|
| Build prefix array | O(n) | O(n) | One pass |
| Range sum query | O(1) | O(1) | Direct array subtraction |
| `subarraySumEqualsK` | O(n) | O(n) | One pass; map stores O(n) distinct sums |
| Brute force range query | O(n) per query | O(1) | Re-sums every time |
| Brute force count | O(n²) | O(1) | Checks every subarray |

## Common variations this pattern solves

1. **Product of Array Except Self** — prefix products + suffix products; no division needed
2. **Subarray Sum Divisible by K** — use `((sum % k) + k) % k` as the map key
3. **2D Matrix Region Sum** — `prefix[i][j]` = rectangle sum from (0,0) to (i-1,j-1); query in O(1)
4. **Longest Subarray with Sum ≤ K** — binary search on prefix array if values are non-negative

## vs other languages

Python has `itertools.accumulate` which builds a prefix sum in one line. Java has no standard equivalent — write the loop explicitly. Python also freely handles arbitrary-precision integers; Java's `int` will overflow for large inputs — cast to `long` when needed.

Go uses `map[int]int` which auto-initializes missing keys to 0; Java's `HashMap` returns `null` for missing keys — always use `getOrDefault(key, 0)`.

## Watch out

- **Off-by-one in array size**: `prefix` must have length `nums.length + 1`, not `nums.length`. Forgetting this makes every query off by one.
- **`seen.put(0, 1)` is required**: without this sentinel, subarrays starting at index 0 that sum to `k` are silently missed.
- **Integer overflow**: `runningSum` for an array of 10^5 elements with values up to 10^9 can reach 10^14, which overflows `int`. Use `long` for both `sum` and the map key when constraints demand it.
- **`seen.merge` vs `seen.put`**: `put` overwrites the count. Use `merge(key, 1, Integer::sum)` to accumulate.

## FAANG follow-up questions

> "Can you count subarrays summing to K without extra space?" — Not in O(n). The O(n²) brute force uses O(1) space. The O(n) solution requires the HashMap.
>
> "What if values are non-negative only?" — A two-pointer sliding window works in O(n) time and O(1) space, avoiding the map entirely.
>
> "How does this extend to 2D?" — `prefix[i][j] = prefix[i-1][j] + prefix[i][j-1] - prefix[i-1][j-1] + grid[i-1][j-1]`. Region query: `prefix[r2+1][c2+1] - prefix[r1][c2+1] - prefix[r2+1][c1] + prefix[r1][c1]`.
>
> "Why n+1 elements in the prefix array?" — Slot 0 is a sentinel (value 0). It means `sum(0..j)` uses `prefix[j+1] - prefix[0]` rather than needing a special case.

## The task

Implement three methods in `Solution`:

```java
// Returns a prefix sum array of length nums.length + 1.
// prefix[0] = 0; prefix[i] = nums[0] + ... + nums[i-1].
// [1,2,3,4,5] -> [0,1,3,6,10,15]
public static int[] buildPrefixSum(int[] nums)

// Returns the sum of nums[i..j] inclusive (0-indexed).
// Uses the prefix array from buildPrefixSum.
// prefix=[0,1,3,6,10,15], i=1, j=3 -> 9
public static int rangeSum(int[] prefix, int i, int j)

// Returns the number of contiguous subarrays that sum to exactly k.
// [1,1,1], k=2 -> 2
// [1,2,3], k=3 -> 2 (subarrays: [3] and [1,2])
public static int subarraySumEqualsK(int[] nums, int k)
```
