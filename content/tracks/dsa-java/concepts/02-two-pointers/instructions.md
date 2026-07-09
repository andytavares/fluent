# Two Pointers

## What you'll learn

Building on the write-pointer idea from Arrays & Strings, this concept covers the full two-pointer pattern: opposite-direction (converging) pointers, same-direction (fast/slow) pointers, and the pivot-plus-converging-pair reduction that takes 3Sum from O(n³) to O(n²). You'll be able to recognize when sorted order or structural symmetry lets you replace a nested loop with a single pass.

## Key concepts

Two pointers eliminates nested loops by exploiting sorted order or structural symmetry. The core insight: in a sorted structure, one comparison tells you which pointer *must* move — moving the other one provably cannot help. That monotonicity is what makes convergence safe: every step discards a set of candidate pairs that cannot contain the answer.

### Opposite-direction (converging) — palindromes, pair sums, container water

```java
int left = 0, right = arr.length - 1;
while (left < right) {
    int value = combine(arr[left], arr[right]);
    if (value == target) {
        // found it / record it
    } else if (value < target) {
        left++;   // need something bigger — only left can provide it
    } else {
        right--;  // need something smaller — only right can provide it
    }
}
```

O(n): each iteration retires one index, and no discarded pair could have been the answer.

### Same-direction (fast/slow) — subsequence matching, in-place filtering

```java
int slow = 0; // next write / match position
for (int fast = 0; fast < arr.length; fast++) {
    if (matches(arr[fast])) slow++;
}
```

`fast` scans everything; `slow` only advances on a match. This is the write pointer from Arrays & Strings generalized to *two different sequences* (is `s` a subsequence of `t`?) as well as one.

### Pivot + converging pair — 3Sum and friends

Sort, fix one element as the pivot, then run converging pointers on the rest:

```java
Arrays.sort(nums);
for (int i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue; // skip duplicate pivots
    int left = i + 1, right = nums.length - 1;
    while (left < right) {
        int sum = nums[i] + nums[left] + nums[right];
        if (sum == 0) {
            result.add(List.of(nums[i], nums[left], nums[right]));
            while (left < right && nums[left] == nums[left + 1]) left++;   // skip dups
            while (left < right && nums[right] == nums[right - 1]) right--; // skip dups
            left++; right--;
        } else if (sum < 0) {
            left++;
        } else {
            right--;
        }
    }
}
```

Each pivot costs O(n), so k-sum costs O(n^(k-1)) instead of O(n^k).

### Complexity of the flagship problems

| Problem | Brute force | Two pointers | Space |
|---------|------------|--------------|-------|
| Valid Palindrome | O(n) + O(n) cleaned copy | O(n) | O(1) |
| Two Sum II | O(n²) pairs | O(n) | O(1) |
| Container With Most Water | O(n²) pairs | O(n) | O(1) |
| 3Sum | O(n³) | O(n²) after O(n log n) sort | O(1) excluding output |

## Watch out

- **`Arrays.sort(int[])` is numeric out of the box** — no comparator needed for primitives. It's `Arrays.sort(Integer[], ...)` or `Collections.sort(List<Integer>, ...)` where you'd need `Comparator.comparingInt` — a mixup that trips people coming from `Arrays.sort()`-on-objects habits.
- **Infinite loops**: if pointers don't advance on the "match" branch (palindrome check, 3Sum after recording a triplet), the loop never terminates.
- **3Sum duplicate skipping**: the inner `while` loops must keep checking `left < right` while skipping, or the pointers cross. Skip duplicate pivots only when `i > 0`.
- **Container With Most Water**: always move the *shorter* pointer. Moving the taller one shrinks width without any chance of raising the height (which is capped by the shorter line).
- **Two Sum II returns 1-based indexes** — off-by-one if you forget the `+ 1`.
- **Integer overflow**: `nums[i] + nums[left] + nums[right]` fits comfortably in `int` for LeetCode-scale constraints, but widen to `long` if a problem's bounds approach `Integer.MAX_VALUE`.

## Problem walkthroughs

### Valid Palindrome ★

**Problem.** Given a string `s`, return `true` if it reads the same forwards and backwards after ignoring every non-alphanumeric character and treating letters case-insensitively.

**Example.**

    "A man, a plan, a canal: Panama" → true
    "race a car"                     → false

**Steps.**
1. Set `left = 0`, `right = s.length() - 1`.
2. Inside a `while (left < right)` loop: advance `left` past non-alphanumeric characters, then retreat `right` past non-alphanumeric characters (both inner loops must re-check `left < right`).
3. Compare `Character.toLowerCase(s.charAt(left))` with `Character.toLowerCase(s.charAt(right))`; return `false` on mismatch.
4. On a match, advance both pointers and continue. Return `true` when they meet.
5. Skipping in place — instead of building a cleaned string — keeps space O(1) and is the point of the exercise.

**Complexity.** O(n) time / O(1) space — each pointer crosses each character at most once.

### Is Subsequence

**Problem.** Return `true` if `s` is a subsequence of `t`: all of `s`'s characters appear in `t` in the same relative order (not necessarily contiguous).

**Example.**

    s = "abc", t = "ahbgdc" → true
    s = "axc", t = "ahbgdc" → false

**Steps.**
1. Two same-direction pointers: `i` into `s` (the pattern), `j` into `t` (the text).
2. Walk `j` across all of `t`; whenever `t.charAt(j) == s.charAt(i)`, advance `i`.
3. Return `i == s.length()` — every pattern character found a match, in order.
4. Greedy matching is safe: taking the *earliest* possible match for `s.charAt(i)` never hurts, because it leaves the largest possible suffix of `t` for the remaining pattern.

**Complexity.** O(|t|) time / O(1) space.

### Two Sum II ★

**Problem.** `numbers` is sorted ascending and 1-indexed. Find the two distinct positions whose values sum to `target` and return them as `[index1, index2]` with `index1 < index2`, both **1-based**. Exactly one solution exists; you may not use the same element twice; O(1) extra space required.

**Example.**

    numbers = [2,7,11,15], target = 9 → [1,2]
    numbers = [2,3,4],      target = 6 → [1,3]

**Steps.**
1. Set `left = 0`, `right = numbers.length - 1`.
2. Compute `sum = numbers[left] + numbers[right]`.
3. If `sum == target`, return `[left + 1, right + 1]` (convert to 1-based).
4. If `sum < target`, increment `left` — the sum must grow, and `right` already pairs the current `left` with the largest available value.
5. If `sum > target`, decrement `right` — symmetric argument.
6. Why nothing is missed: when `left` advances, every pair `(left, x)` for `x < right` had `sum < target` too (values only get smaller), so the discarded pairs were all invalid.

**Complexity.** O(n) time / O(1) space — this is exactly the inner loop of 3Sum.

### Container With Most Water ★

**Problem.** `heights[i]` is the height of a vertical line at position `i`. Pick two lines so that together with the x-axis they hold the most water: area = min of the two heights × distance between them. Return the maximum area.

**Example.**

    [1,8,6,2,5,4,8,3,7] → 49   (lines at index 1 and 8: min(8,7) × 7)

**Steps.**
1. Start with the widest container: `left = 0`, `right = heights.length - 1`, `maxArea = 0`.
2. Each iteration, compute `Math.min(heights[left], heights[right]) * (right - left)` and fold it into `maxArea`.
3. Move the pointer at the **shorter** line inward (either one on a tie).
4. Why that's safe: the shorter line caps the area of every container it could form with anything inside the current window — narrower width, height still capped. So discarding it loses no candidate that could beat the current best.

**Complexity.** O(n) time / O(1) space — one converging pass.

### 3Sum ★

**Problem.** Given `nums`, return all **unique** triplets `[a, b, c]` of values (taken from three distinct indexes) with `a + b + c == 0`. The output must contain no duplicate triplets, in any order.

**Example.**

    [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]
    [0,0,0]          → [[0,0,0]]

**Steps.**
1. Sort ascending. Sorting enables both the converging pair and duplicate skipping.
2. Loop pivot `i` from 0 to `length - 3`. Skip duplicate pivots: `if (i > 0 && nums[i] == nums[i - 1]) continue`. Optional early exit: `if (nums[i] > 0) break` — three positives can't sum to zero.
3. For each pivot, run Two Sum II's converging loop on `[i + 1, length - 1]` with target `-nums[i]`: advance `left` when the sum is negative, retreat `right` when positive.
4. On a hit, record `[nums[i], nums[left], nums[right]]`, then skip duplicates on **both** inner pointers before advancing both.
5. The three duplicate-skips (pivot, left, right) are what guarantee uniqueness without a dedupe set.

**Complexity.** O(n²) time (O(n log n) sort + O(n) per pivot) / O(1) auxiliary space excluding the output.

## Interview follow-ups

After 3Sum:
- "What if you can't sort the array?" — hash-set inner loop: O(n²) time but O(n) space.
- "4Sum?" — one more pivot loop around the same core: O(n³) instead of O(n⁴).
- "3Sum closest?" — same skeleton; track the sum minimizing `|sum - target|` instead of collecting exact hits.

After Container With Most Water:
- "Prove no better pair is skipped." — exchange argument on the shorter line (walkthrough step 4).
- "Heights can be 0?" — area for that pair is 0; the algorithm needs no special case.

After Two Sum II:
- "Unsorted input?" — that's classic Two Sum: hash map, O(n) time, O(n) space. Sorting first costs O(n log n) *and* loses the original indexes.

## The task

Four converging-pointer classics. Each must run in the stated time and O(1) extra space (3Sum's output excluded).

### `isPalindrome(String s)`

Return `true` if `s` is a palindrome after ignoring all non-alphanumeric characters and case; `false` otherwise. A string with no alphanumeric characters at all (including `""` and `" "`) counts as a palindrome. Skip the junk characters with the pointers themselves — do not build a cleaned copy of the string. O(n) time.

```java
Solution.isPalindrome("A man, a plan, a canal: Panama"); // true
Solution.isPalindrome("race a car");                     // false
Solution.isPalindrome(" ");                              // true
Solution.isPalindrome("0P");                             // false
```

Edge cases: empty string (`true`), single character, digits mixed with letters (`"12321"` is a palindrome; case-insensitivity applies only to letters).

### `twoSumII(int[] numbers, int target)`

`numbers` is sorted in ascending order. Return the **1-based** indexes `[index1, index2]` (`index1 < index2`) of the two distinct elements that sum exactly to `target`. Exactly one solution exists for every input you'll receive; the same element may not be used twice (two equal *values* at different positions are fine). O(n) time, O(1) space — no hash map.

```java
Solution.twoSumII(new int[]{2, 7, 11, 15}, 9);  // [1, 2]
Solution.twoSumII(new int[]{2, 3, 4}, 6);       // [1, 3]
Solution.twoSumII(new int[]{-1, 0}, -1);        // [1, 2]
```

Edge cases: negative numbers, duplicate values forming the pair (`[1, 1, 2]` with target `2` → `[1, 2]`), the pair sitting at the two ends of the array.

### `containerWithMostWater(int[] heights)`

`heights` is an array of non-negative line heights (length ≥ 2). Two lines at indexes `i < j` hold `Math.min(heights[i], heights[j]) * (j - i)` water. Return the maximum over all pairs. O(n) time.

```java
Solution.containerWithMostWater(new int[]{1, 8, 6, 2, 5, 4, 8, 3, 7}); // 49
Solution.containerWithMostWater(new int[]{1, 1});                      // 1
Solution.containerWithMostWater(new int[]{0, 2, 0});                   // 0
```

Edge cases: exactly two lines, zero heights (area 0 is a valid answer), the best pair not at the ends, all heights equal.

### `threeSum(int[] nums)`

Return all unique triplets of values `[a, b, c]` drawn from three distinct indexes of `nums` such that `a + b + c == 0`, as a `List<List<Integer>>`. No duplicate triplets in the output; triplet order and ordering within a triplet don't matter. O(n²) time.

```java
Solution.threeSum(new int[]{-1, 0, 1, 2, -1, -4}); // [[-1, -1, 2], [-1, 0, 1]]
Solution.threeSum(new int[]{0, 1, 1});             // []
Solution.threeSum(new int[]{0, 0, 0});             // [[0, 0, 0]]
```

Edge cases: fewer than three elements (`[]`), no valid triplet, heavy duplicates (`[-2, 0, 0, 2, 2]` → only `[[-2, 0, 2]]`), all-positive or all-negative input (`[]`).
