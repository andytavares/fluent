## What you build

You write four converging-pointer functions: `isPalindrome`, `twoSumII`, `containerWithMostWater` and `threeSum`. Each one replaces a nested loop with one pass, because sorted order or symmetry tells you which pointer to move. This lesson builds on **Arrays & Strings**.

## Key concepts

### One comparison tells you which pointer to move

In a sorted or symmetric structure, one comparison shows which pointer must move. A move of the other pointer cannot help. This monotonicity makes convergence safe: each step discards a set of pairs that cannot hold the answer.

### Opposite-direction pointers converge from the ends

Use this form for palindromes, pair sums and container water.

```js
let left = 0;
let right = arr.length - 1;
while (left < right) {
  const v = combine(arr[left], arr[right]);
  if (v === target) {
    // Found it: record it.
  } else if (v < target) {
    // Need a bigger value: only left
    // can provide it.
    left++;
  } else {
    // Need a smaller value: only right
    // can provide it.
    right--;
  }
}
```

The loop is O(n). Each iteration retires one index, and no discarded pair can be the answer.

### Same-direction pointers: fast scans, slow matches

Use this form for subsequence matching and in-place filtering.

```js
// n: input length; matches: your test
// Next write or match position.
let slow = 0;
for (let fast = 0; fast < n; fast++) {
  if (matches(arr[fast])) slow++;
}
```

`fast` scans every element. `slow` advances only on a match. This is the write pointer from **Arrays & Strings**, extended to two sequences, for example "is `s` a subsequence of `t`?".

### A pivot plus a converging pair solves 3Sum

Sort the array, fix one element as the pivot, then run converging pointers on the rest.

```js
nums.sort((a, b) => a - b);
const n = nums.length;
for (let i = 0; i < n - 2; i++) {
  // Skip duplicate pivots.
  if (i > 0 && nums[i] === nums[i - 1]) {
    continue;
  }
  let left = i + 1;
  let right = n - 1;
  while (left < right) {
    const sum =
      nums[i] + nums[left] + nums[right];
    if (sum === 0) {
      result.push([
        nums[i], nums[left], nums[right]]);
      // Skip duplicates on both sides.
      while (left < right &&
        nums[left] === nums[left + 1]) {
        left++;
      }
      while (left < right &&
        nums[right] === nums[right - 1]) {
        right--;
      }
      left++;
      right--;
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

- In JavaScript, `sort()` needs a numeric comparator. `[10, 9, 2].sort()` gives `[10, 2, 9]`. Write `(a, b) => a - b`.
- If the pointers do not advance on the match branch, the loop never ends. This applies to the palindrome check and to 3Sum after a recorded triplet.
- In 3Sum, the inner skip loops must keep the `left < right` check, or the pointers cross.
- In 3Sum, skip a duplicate pivot only when `i > 0`.
- In Container With Most Water, always move the shorter line. A move of the taller line shrinks the width, and the shorter line still caps the height.
- Two Sum II returns 1-based indexes. Without the `+ 1`, every answer is off by one.

## Problem walkthroughs

### Valid Palindrome ★

**Problem.** Given a string `s`, return `true` if it reads the same forwards and backwards. Ignore every non-alphanumeric character, and compare letters without case.

**Example.**

```text
"A man, a plan, a canal: Panama"
  -> true
"race a car" -> false
```

**Steps.**
1. Set `left = 0` and `right = s.length - 1`.
2. Inside a `while (left < right)` loop, advance `left` past non-alphanumeric characters. Then move `right` back past non-alphanumeric characters. Both inner loops must check `left < right` again.
3. Compare `s[left].toLowerCase()` with `s[right].toLowerCase()`. Return `false` on a mismatch.
4. On a match, move both pointers and continue. Return `true` when they meet.
5. The pointers skip characters in place instead of building a cleaned string. That keeps space at O(1), which is the point of the problem.

**Complexity.** O(n) time / O(1) space. Each pointer crosses each character at most once.

### Is Subsequence

**Problem.** Return `true` if `s` is a subsequence of `t`. All characters of `s` appear in `t` in the same relative order, but not always next to each other.

**Example.**

```text
s = "abc", t = "ahbgdc" -> true
s = "axc", t = "ahbgdc" -> false
```

**Steps.**
1. Use two same-direction pointers: `i` into `s` (the pattern) and `j` into `t` (the text).
2. Walk `j` across all of `t`. When `t[j] === s[i]`, advance `i`.
3. Return `i === s.length`. Every pattern character found a match, in order.
4. Greedy matching is safe. The earliest match for `s[i]` leaves the largest suffix of `t` for the rest of the pattern.

**Complexity.** O(|t|) time / O(1) space.

### Two Sum II ★

**Problem.** `numbers` is in ascending order. Find the two distinct positions whose values sum to `target`. Return them as 1-based `[index1, index2]` with `index1 < index2`. Exactly one solution exists. You cannot use the same element twice. Use O(1) extra space.

**Example.**

```text
[2,7,11,15], target 9 -> [1,2]
[2,3,4], target 6 -> [1,3]
```

**Steps.**
1. Set `left = 0` and `right = numbers.length - 1`.
2. Compute `sum = numbers[left] + numbers[right]`.
3. If `sum === target`, return `[left + 1, right + 1]` to convert to 1-based indexes.
4. If `sum < target`, increment `left`. The sum must grow, and `right` already pairs `left` with the largest available value.
5. If `sum > target`, decrement `right`. The argument is the mirror of step 4.
6. Nothing is lost. When `left` advances, every pair `(left, x)` with `x < right` also had `sum < target`. So all the discarded pairs were invalid.

**Complexity.** O(n) time / O(1) space. This loop is exactly the inner loop of 3Sum.

### Container With Most Water ★

**Problem.** `heights[i]` is the height of a vertical line at position `i`. Two lines and the x-axis hold water. The area is the smaller height times the distance between the lines. Return the largest area.

**Example.**

```text
[1,8,6,2,5,4,8,3,7] -> 49
(index 1 and 8: min(8,7) × 7)
```

**Steps.**
1. Start with the widest container: `left = 0`, `right = heights.length - 1` and `maxArea = 0`.
2. In each iteration, compute `Math.min(heights[left], heights[right]) * (right - left)` and fold it into `maxArea`.
3. Move the pointer at the shorter line inward. On a tie, move either one.
4. This is safe. The shorter line caps the area of every container it can form inside the current window. Those containers are narrower, and the height cap stays. So no discarded container can beat the current best.

**Complexity.** O(n) time / O(1) space. One converging pass.

### 3Sum ★

**Problem.** Given `nums`, return all unique triplets `[a, b, c]` of values from three distinct indexes with `a + b + c === 0`. The output has no duplicate triplets. Any order is fine.

**Example.**

```text
[-1,0,1,2,-1,-4]
  -> [[-1,-1,2],[-1,0,1]]
[0,0,0] -> [[0,0,0]]
```

**Steps.**
1. Sort in ascending order with a numeric comparator. The sort enables both the converging pair and the duplicate skips.
2. Loop the pivot `i` from 0 to `length - 3`. Skip duplicate pivots with `if (i > 0 && nums[i] === nums[i - 1]) continue`. You can also exit early with `if (nums[i] > 0) break`, because three positive values cannot sum to zero.
3. For each pivot, run the Two Sum II loop on `[i + 1, length - 1]` with target `-nums[i]`. Advance `left` when the sum is negative. Move `right` back when it is positive.
4. On a hit, record `[nums[i], nums[left], nums[right]]`. Skip duplicates on both inner pointers, then advance both.
5. The three duplicate skips (pivot, left, right) make the output unique without a dedupe set.

**Complexity.** O(n²) time (O(n log n) sort plus O(n) per pivot) / O(1) extra space, without the output.

## Interview follow-ups

After 3Sum:
- "What if you cannot sort the array?" Use a hash set in the inner loop: O(n²) time, but O(n) space.
- "4Sum?" Add one more pivot loop around the same core: O(n³) instead of O(n⁴).
- "3Sum closest?" Use the same skeleton. Track the sum that minimizes `|sum - target|` instead of exact hits.

After Container With Most Water:
- "Prove you skip no better pair." Use the exchange argument on the shorter line (walkthrough step 4).
- "Can heights be 0?" The area for that pair is 0. The algorithm needs no special case.

After Two Sum II:
- "Unsorted input?" That is classic Two Sum: a hash map, O(n) time and O(n) space. A sort first costs O(n log n) and loses the original indexes.

## The task

You write four converging-pointer functions. Each runs in the stated time with O(1) extra space. The 3Sum output does not count as extra space.

1. `isPalindrome(s)` returns `true` if `s` is a palindrome after you ignore case and all non-alphanumeric characters. Otherwise it returns `false`.
2. A string with no alphanumeric characters, such as `""` or `" "`, counts as a palindrome.
3. Skip the other characters with the pointers. Do not build a cleaned copy of the string. Use O(n) time.
4. `twoSumII(numbers, target)` takes `numbers` in ascending order. It returns the 1-based indexes `[index1, index2]` of two distinct elements that sum to `target`.
5. `index1 < index2`. Exactly one solution exists. Two equal values at different positions are fine. Use O(n) time, O(1) space and no hash map.
6. `containerWithMostWater(heights)` takes non-negative heights, with length 2 or more. Lines at `i < j` hold `Math.min(heights[i], heights[j]) * (j - i)` water. Return the largest amount. Use O(n) time.
7. `threeSum(nums)` returns all unique triplets of values `[a, b, c]` from three distinct indexes with `a + b + c === 0`. Use O(n²) time.
8. The `threeSum` output has no duplicate triplets. The order of triplets, and of values inside a triplet, does not matter.

Edge cases:

- `isPalindrome`: an empty string returns `true`. Handle a single character and digits mixed with letters. Case rules apply only to letters, so `"0P"` is not a palindrome.
- `twoSumII`: handle negative numbers, duplicate values that form the pair and a pair at the two ends.
- `containerWithMostWater`: handle exactly two lines, zero heights, the best pair away from the ends and equal heights. An area of 0 is a valid answer.
- `threeSum`: fewer than three elements returns `[]`. Handle no valid triplet, heavy duplicates and input that is all positive or all negative.

```js
const s =
  "A man, a plan, a canal: Panama";
isPalindrome(s);             // true
isPalindrome("race a car");  // false
isPalindrome(" ");           // true
isPalindrome("0P");          // false
isPalindrome("12321");       // true

twoSumII([2, 7, 11, 15], 9); // [1, 2]
twoSumII([2, 3, 4], 6);      // [1, 3]
twoSumII([-1, 0], -1);       // [1, 2]
twoSumII([1, 1, 2], 2);      // [1, 2]

const h = [1, 8, 6, 2, 5, 4, 8, 3, 7];
containerWithMostWater(h);          // 49
containerWithMostWater([1, 1]);     // 1
containerWithMostWater([0, 2, 0]);  // 0

threeSum([-1, 0, 1, 2, -1, -4]);
// [[-1, -1, 2], [-1, 0, 1]]
threeSum([0, 1, 1]);         // []
threeSum([0, 0, 0]);         // [[0, 0, 0]]
threeSum([-2, 0, 0, 2, 2]); // [[-2, 0, 2]]
threeSum([]);                // []
```
