## What you build

You write four in-place array operations: `merge`, `removeDuplicates`, `majorityElement` and `rotate`. Each one uses O(1) extra space. Every later pattern in this track, such as two pointers, sliding window and binary search, assumes these moves.

## Key concepts

### A write pointer edits an array in place

Many problems say "remove or keep elements in place and return the new length." Do not call `splice`, because each call costs O(n). Keep a `write` index for the next kept element, and sweep a `read` index across the array.

```js
let write = 0;
const n = nums.length;
for (let read = 0; read < n; read++) {
  if (keep(nums[read])) {
    nums[write] = nums[read];
    write++;
  }
}
// New logical length.
// nums[0..write-1] is the answer.
return write;
```

Everything left of `write` is final output. `read` never lags behind `write`, so you never overwrite an unread value. The sweep is one pass with O(1) extra space.

### Fill from the back when the free space is at the end

To merge into an array with free slots at the end, write from the back. Then you never overwrite data you have not read.

```js
// The last slot.
let k = m + n - 1;
// Compare the largest remaining value
// of each source, place it at k,
// then move k left.
```

A front-to-back merge overwrites `nums1` values you have not read yet. A back-to-front merge cannot, because the write index stays at or ahead of both read indexes.

### Three reversals rotate an array

A right rotation by `k` is three in-place reversals. It needs no extra array.

```js
// [1,2,3,4,5,6,7], k = 3
// -> [7,6,5,4,3,2,1]
reverse(nums, 0, n - 1);
// -> [5,6,7,4,3,2,1]
reverse(nums, 0, k - 1);
// -> [5,6,7,1,2,3,4]
reverse(nums, k, n - 1);
```

Normalize first with `k %= n`. A rotation by `n` changes nothing.

### Boyer–Moore voting finds the majority in O(1) space

The majority element appears more than ⌊n/2⌋ times. Cancel each occurrence of the candidate against one occurrence of any other value. The majority has more than half the votes, so it survives all cancellations.

```js
let candidate, count = 0;
for (const x of nums) {
  if (count === 0) {
    candidate = x;
    count = 1;
  } else if (x === candidate) count++;
  else count--;
}
// candidate is the majority
// (one must exist).
```

### Greedy single-pass scans keep a running extremum

Many problems fall to one walk that keeps a running extremum. Examples are the best stock profit (minimum price so far) and jump reachability (farthest index so far). Gas Station keeps a running tank and resets it on a deficit. The proof is always an exchange argument: you can turn any optimal answer into the greedy one without making it worse.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Merge Sorted Array | O(m + n) | O(1) | fill from the back |
| Remove Duplicates from Sorted Array | O(n) | O(1) | write pointer |
| Majority Element | O(n) | O(1) | Boyer–Moore voting |
| Rotate Array | O(n) | O(1) | three reversals |

## Watch out

- In JavaScript, `sort()` compares as strings by default. `[10, 9, 2].sort()` gives `[10, 2, 9]`. Pass `(a, b) => a - b` for numbers.
- `splice`, `shift` and `unshift` cost O(n). Inside a loop, they make a linear algorithm quadratic.
- `k` can exceed `nums.length`. Without `k %= n`, the reversal indexes break.
- In "return k" problems, the array length does not change. The caller reads only `nums[0..k-1]`. Do not truncate.
- A front-to-back merge overwrites unread `nums1` values. Write from the back.
- Boyer–Moore finds the majority only when one exists. Without that promise, verify the candidate with a second pass.

## Problem walkthroughs

### Merge Sorted Array ★

**Problem.** `nums1` has length `m + n`. It holds `m` sorted numbers, then `n` placeholder zeros. `nums2` holds `n` sorted numbers. Merge `nums2` into `nums1` in ascending order. Mutate `nums1` and return nothing.

**Example.**

```text
nums1 = [1,2,3,0,0,0], m = 3
nums2 = [2,5,6], n = 3
-> nums1 is [1,2,2,3,5,6]
```

**Steps.**
1. Set three indexes: `i = m - 1` (last real `nums1` value), `j = n - 1` (last `nums2` value) and `k = m + n - 1` (last slot).
2. Loop while `j >= 0`. If `i >= 0` and `nums1[i] > nums2[j]`, write `nums1[i]` at `k` and decrement `i`.
3. Otherwise write `nums2[j]` at `k` and decrement `j`. Decrement `k` in both cases.
4. Stop when `j < 0`. The rest of `nums1` is already sorted and already in place.
5. Invariant: `k >= i` at all times, so a write at `k` never destroys an unread `nums1` value.

**Complexity.** O(m + n) time / O(1) space. You write each element exactly once.

### Remove Element

**Problem.** Given `nums` and a value `val`, remove every occurrence of `val` in place. Return `k`, the count of remaining elements. The first `k` slots of `nums` must hold the kept elements, and you can keep their order.

**Example.**

```text
nums = [3,2,2,3], val = 3
-> returns 2, nums starts with [2,2]
```

**Steps.**
1. Set `write = 0`.
2. For each `read` index, if `nums[read] !== val`, copy `nums[read]` to `nums[write]` and increment `write`.
3. Return `write`. Everything left of `write` is the kept elements in their original order.

**Complexity.** O(n) time / O(1) space. One sweep, one comparison per element.

### Remove Duplicates from Sorted Array ★

**Problem.** `nums` is in ascending order. Deduplicate it in place so each value appears once, in the same relative order. Return `k`, the number of unique values. The first `k` slots must hold them.

**Example.**

```text
nums = [0,0,1,1,1,2,2,3,3,4]
-> returns 5
-> nums starts with [0,1,2,3,4]
```

**Steps.**
1. Set `write = 0`.
2. For each `read` index, keep `nums[read]` if `write === 0` or `nums[read] !== nums[write - 1]`. The first element is always unique. Any other kept value differs from the last kept value.
3. On a keep, copy to `nums[write]` and increment `write`.
4. Return `write`. The array is in order, so duplicates are adjacent. A comparison with the last kept value is enough.

**Complexity.** O(n) time / O(1) space.

### Remove Duplicates from Sorted Array II

**Problem.** The setup is the same, but each value can appear at most twice. Return `k` and pack the first `k` slots.

**Example.**

```text
nums = [1,1,1,2,2,3]
-> returns 5
-> nums starts with [1,1,2,2,3]
```

**Steps.**
1. Use the same write-pointer sweep with a different keep test. Keep `nums[read]` when `write < 2` or `nums[read] !== nums[write - 2]`.
2. The test compares with the value two slots back. A third consecutive copy fails it, but a second copy passes.
3. The test generalizes. "At most `t` copies" is `write < t || nums[read] !== nums[write - t]`.

**Complexity.** O(n) time / O(1) space.

### Majority Element ★

**Problem.** Return the element that appears more than ⌊n/2⌋ times in `nums`. One always exists.

**Example.**

```text
nums = [2,2,1,1,1,2,2] -> 2
```

**Steps.**
1. Keep a `candidate` and a `count`. Start with `count = 0`.
2. For each element, if `count === 0`, take it as the candidate with `count = 1`. Otherwise increment `count` on a match and decrement it on a mismatch.
3. Return the candidate. Each decrement cancels one candidate occurrence against one other occurrence. The true majority fills more than half the array, so it is the final candidate.

**Complexity.** O(n) time / O(1) space. This beats sorting (O(n log n)) and hashing (O(n) space).

### Rotate Array ★

**Problem.** Rotate `nums` to the right by `k` steps, in place. `k >= 0` and can exceed the array length. Return nothing.

**Example.**

```text
nums = [1,2,3,4,5,6,7], k = 3
-> nums is [5,6,7,1,2,3,4]
```

**Steps.**
1. Normalize with `k %= nums.length`. If `k === 0`, stop.
2. Reverse the whole array.
3. Reverse the first `k` elements.
4. Reverse the remaining `n - k` elements.
5. A right rotation moves the last `k` elements to the front as a block. The full reversal puts that block at the front, but backwards. The two partial reversals fix the order inside each block.

**Complexity.** O(n) time / O(1) space. Each element moves in at most two swaps.

### Best Time to Buy and Sell Stock

**Problem.** `prices[i]` is a stock price on day `i`. Choose one day to buy and a later day to sell, for the largest profit. Return that profit, or 0 if no trade makes a profit.

**Example.**

```text
prices = [7,1,5,3,6,4] -> 5
(buy at 1, sell at 6)
```

**Steps.**
1. Track `minPrice`, the lowest price so far, and `best`, the best profit so far. Start with `minPrice = prices[0]` and `best = 0`.
2. For each later price `p`, set `best = Math.max(best, p - minPrice)`, then `minPrice = Math.min(minPrice, p)`.
3. The best sale on day `i` always buys at the lowest price before `i`. The running minimum gives that price in O(1) per day.

**Complexity.** O(n) time / O(1) space.

### Best Time to Buy and Sell Stock II

**Problem.** The prices are the same, but you can buy and sell any number of times. You hold at most one share at a time. Return the largest total profit.

**Example.**

```text
prices = [7,1,5,3,6,4] -> 7
(1->5 = 4, plus 3->6 = 3)
```

**Steps.**
1. Sum every positive increase from one day to the next: `if (prices[i] > prices[i-1]) profit += prices[i] - prices[i-1]`.
2. Any upswing over many days splits into consecutive one-day gains. No strategy can capture more than every positive daily change.

**Complexity.** O(n) time / O(1) space.

### Jump Game

**Problem.** `nums[i]` is the longest jump from index `i`. You start at index 0. Return `true` if you can reach the last index.

**Example.**

```text
nums = [2,3,1,1,4] -> true
nums = [3,2,1,0,4] -> false
(index 3 is a dead end)
```

**Steps.**
1. Track `farthest`, the highest index you can reach so far. Start at 0.
2. Walk `i` from 0. If `i > farthest`, you cannot reach `i`, so return `false`.
3. Otherwise set `farthest = Math.max(farthest, i + nums[i])`. Return `true` when `farthest >= nums.length - 1`.
4. Invariant: you can reach every index `<= farthest`, so a jump from any of them is legal.

**Complexity.** O(n) time / O(1) space.

### Jump Game II

**Problem.** The array is the same, and you can always reach the last index. Return the smallest number of jumps you need.

**Example.**

```text
nums = [2,3,1,1,4] -> 2
(0 -> 1 -> 4)
```

**Steps.**
1. Think in breadth-first layers. `currentEnd` is the far edge you can reach in `jumps` jumps. `farthest` is the far edge you can reach in `jumps + 1`.
2. Walk `i` from 0 to `n - 2`, because you never jump from the last index. Set `farthest = Math.max(farthest, i + nums[i])`.
3. When `i === currentEnd`, the current layer is done. Increment `jumps` and set `currentEnd = farthest`.
4. Return `jumps`. Each layer boundary matches exactly one optimal jump, so the count is the smallest.

**Complexity.** O(n) time / O(1) space.

### H-Index

**Problem.** `citations[i]` counts the citations of a researcher's paper `i`. Return the h-index: the largest `h` such that at least `h` papers each have `h` or more citations.

**Example.**

```text
citations = [3,0,6,1,5] -> 3
(three papers have >= 3 citations)
```

**Steps.**
1. Sort in descending order: `citations.sort((a, b) => b - a)`.
2. At 0-based position `i`, you have `i + 1` papers with at least `citations[i]` citations. So `h = i + 1` holds exactly when `citations[i] >= i + 1`.
3. Walk `i` from 0 while `citations[i] > i`. Return the index where the walk stops. That is the count of positions where `citations[i] >= i + 1`.
4. For O(n), count citations into buckets, with values above `n` capped at `n`. Then scan the buckets from `n` down and add the paper counts until `count >= h`.

**Complexity.** O(n log n) time / O(1) space with the sort. O(n) / O(n) with buckets.

### Insert Delete GetRandom O(1)

**Problem.** Design a set with `insert(val)`, `remove(val)` and `getRandom()`, each O(1) on average. `getRandom` returns each stored element with equal probability. `insert` and `remove` return whether they changed the set.

**Example.**

```text
insert(1) -> true
insert(1) -> false
remove(2) -> false
insert(2) -> true
getRandom() -> 1 or 2, equal chance
```

**Steps.**
1. Keep two structures: an array `items` for random access, and a `Map` from each value to its index in `items`.
2. `insert`: if the map has the value, return `false`. Otherwise push it onto `items`, record its index in the map and return `true`.
3. `remove`: if the value is absent, return `false`. Otherwise copy the last array element into the removed value's slot. Update that element's index in the map, pop the array and delete the map entry.
4. `getRandom`: return `items[Math.floor(Math.random() * items.length)]`.
5. The swap-delete is the trick. A delete from the middle of an array costs O(n). An overwrite with the last element and a pop costs O(1) and keeps the array dense.

**Complexity.** O(1) average per operation / O(n) space.

### Product of Array Except Self

**Problem.** Return an array `answer` where `answer[i]` is the product of every element of `nums` except `nums[i]`. Do not use division. Run in O(n) time.

**Example.**

```text
nums = [1,2,3,4] -> [24,12,8,6]
```

**Steps.**
1. First pass, left to right: set `answer[i]` to the product of all elements left of `i`. This is a running prefix product, and `answer[0] = 1`.
2. Second pass, right to left: keep a running `suffix` product that starts at 1. Set `answer[i] *= suffix`, then `suffix *= nums[i]`.
3. After both passes, `answer[i]` is the product left of `i` times the product right of `i`. Zeros need no special case.

**Complexity.** O(n) time / O(1) extra space. The output array does not count.

### Gas Station

**Problem.** `n` gas stations stand on a circle. `gas[i]` is the fuel at station `i`. `cost[i]` is the fuel you need to drive to station `i + 1`. Return the start station for a full loop with an empty tank, or `-1` if none exists. A solution, when one exists, is unique.

**Example.**

```text
gas  = [1,2,3,4,5]
cost = [3,4,5,1,2] -> 3
```

**Steps.**
1. Track `total`, the net fuel over the whole loop, and `tank`, the net fuel since the current candidate start. Set `start = 0`.
2. For each `i`, add `gas[i] - cost[i]` to both `total` and `tank`.
3. If `tank < 0`, no start in `[start..i]` can work. Each of them arrives at `i + 1` with even less fuel. Set `start = i + 1` and `tank = 0`.
4. After the loop, return `total >= 0 ? start : -1`. If the total fuel covers the total cost, the last candidate completes the loop.

**Complexity.** O(n) time / O(1) space. One pass, with no full-loop simulation per candidate.

### Candy

**Problem.** Children stand in a line with `ratings`. Give each child at least one candy. A child with a higher rating than a direct neighbor gets more candies than that neighbor. Return the smallest total.

**Example.**

```text
ratings = [1,0,2] -> 5
(candies [2,1,2])
```

**Steps.**
1. Set every entry of `candies` to 1.
2. Left-to-right pass: if `ratings[i] > ratings[i-1]`, set `candies[i] = candies[i-1] + 1`. This meets every left-neighbor rule with the smallest values.
3. Right-to-left pass: if `ratings[i] > ratings[i+1]`, set `candies[i] = Math.max(candies[i], candies[i+1] + 1)`. The `max` keeps the left rule while it fixes the right rule.
4. Sum the array. Each rule gets the smallest possible increment, so the total is the smallest.

**Complexity.** O(n) time / O(n) space for the candies array.

### Trapping Rain Water

**Problem.** `height` is an elevation map of bar heights. Compute how much rainwater the terrain traps.

**Example.**

```text
height = [0,1,0,2,1,0,1,3,2,1,2,1]
-> 6
```

**Steps.**
1. The water above position `i` is `min(maxLeft(i), maxRight(i)) - height[i]`. The shorter of the tallest walls on each side bounds it.
2. Move two pointers, `left` and `right`, in from the ends. Keep a running `leftMax` and `rightMax`.
3. If `leftMax <= rightMax`, the left side is the limit. Add `leftMax - height[left]` if it is positive, update `leftMax` and advance `left`. Otherwise do the mirror steps on the right.
4. When `leftMax <= rightMax`, the minimum at `left` is exactly `leftMax`. A wall at least `rightMax` tall exists on the right. So you can settle that column without a further scan.

**Complexity.** O(n) time / O(1) space. The version with precomputed arrays uses O(n) space.

### Roman to Integer

**Problem.** Convert a valid Roman numeral string in the range 1–3999 to an integer. The symbols are I=1, V=5, X=10, L=50, C=100, D=500 and M=1000. A smaller symbol before a larger one subtracts (IV = 4, CM = 900).

**Example.**

```text
"MCMXCIV" -> 1994
```

**Steps.**
1. Build a map from symbol to value.
2. Walk the string. If a character's value is less than the next character's value, subtract it from the total. Otherwise add it.
3. That one comparison covers all six subtractive pairs (IV, IX, XL, XC, CD, CM) without special cases.

**Complexity.** O(n) time / O(1) space.

### Integer to Roman

**Problem.** Convert an integer in `[1, 3999]` to its Roman numeral.

**Example.**

```text
3749 -> "MMMDCCXLIX"
```

**Steps.**
1. List the value and symbol pairs in descending order, with the subtractive forms included: `[1000,"M"], [900,"CM"], [500,"D"], [400,"CD"], [100,"C"], [90,"XC"], [50,"L"], [40,"XL"], [10,"X"], [9,"IX"], [5,"V"], [4,"IV"], [1,"I"]`.
2. Go through the pairs in order. While `num >= value`, append the symbol and subtract the value.
3. The subtractive pairs in the table make plain greedy correct. 4 matches "IV" before greedy can emit "IIII".

**Complexity.** O(1) time and space. The value has an upper bound, and the table has 13 entries.

### Length of Last Word

**Problem.** A string holds words separated by spaces, with possible trailing spaces. Return the length of the last word.

**Example.**

```text
"   fly me   to   the moon  " -> 4
```

**Steps.**
1. Set `i = s.length - 1`. Walk left while `s[i] === " "` to skip trailing spaces.
2. Count characters while `i >= 0` and `s[i] !== " "`.
3. Return the count. A scan from the end does not allocate with `split`, and it reads only the tail of the string.

**Complexity.** O(n) worst case / O(1) space.

### Longest Common Prefix

**Problem.** Return the longest string that is a prefix of every string in the array. Return `""` if there is none.

**Example.**

```text
["flower","flow","flight"] -> "fl"
```

**Steps.**
1. Take `strs[0]` as the candidate prefix.
2. For each other string, while the string does not `startsWith(candidate)`, remove the last character of the candidate: `candidate = candidate.slice(0, -1)`.
3. If the candidate becomes empty, return `""` early. Otherwise the candidate that survives all strings is the answer.
4. The common prefix of all strings is also a prefix of the first one. So you only ever shrink the candidate.

**Complexity.** O(S) time, where S is the total number of characters / O(1) extra space.

### Reverse Words in a String

**Problem.** A string holds words separated by one or more spaces, with possible leading or trailing spaces. Return the words in reverse order, joined by single spaces.

**Example.**

```text
"  the   sky is blue "
-> "blue is sky the"
```

**Steps.**
1. Call `s.trim().split(/\s+/)`. The trim removes empty tokens at the ends. The split on runs of whitespace collapses multiple spaces.
2. Call `.reverse().join(" ")`.
3. Languages with mutable strings, such as C and C++, allow an O(1) extra-space version. Reverse the whole character array, reverse each word in place, then compact extra spaces with a write pointer.

**Complexity.** O(n) time / O(n) space in JavaScript, because strings are immutable.

### Zigzag Conversion

**Problem.** Write string `s` in a zigzag over `numRows` rows. Go down the first column, diagonally up to row 0, then down again. Read the result row by row and return it.

**Example.**

```text
"PAYPALISHIRING", numRows = 3
-> "PAHNAPLSIIGYIR"
```

**Steps.**
1. If `numRows === 1`, return `s` unchanged. No zigzag exists, and this check stops the direction flip from breaking.
2. Keep an array of `numRows` string buckets, a current `row = 0` and a `step = 1`.
3. For each character, append it to `rows[row]`. Flip `step` to `+1` at row 0 and to `-1` at row `numRows - 1`. Then set `row += step`.
4. Join the buckets. A simulation of the walk is simpler than the index arithmetic, and it is as fast.

**Complexity.** O(n) time / O(n) space.

### Find the Index of the First Occurrence in a String

**Problem.** Return the index of the first occurrence of `needle` in `haystack`. Return `-1` if `needle` does not occur in `haystack`.

**Example.**

```text
"sadbutsad", "sad" -> 0
"leetcode", "leeto" -> -1
```

**Steps.**
1. Let `n = haystack.length` and `m = needle.length`. Try each start `i` from 0 to `n - m`.
2. Compare `haystack[i + j]` with `needle[j]` for `j` in `[0, m)`. On a full match, return `i`. On a mismatch, go to the next `i`.
3. Return `-1` after the loop. This naive scan is O(n·m), which is fine at interview scale. Mention KMP, or the built-in `indexOf` you use in real code, for O(n + m).

**Complexity.** O(n·m) time / O(1) space for the naive scan.

### Text Justification

**Problem.** Given `words` and `maxWidth`, put as many words on each line as fit, with single spaces counted. Then justify each line to exactly `maxWidth` characters. Extra spaces go to the leftmost gaps first. The last line, and any line with one word, is left-justified with trailing spaces. Return the array of lines.

**Example.**

```text
words = ["This", "is", "an",
  "example", "of", "text",
  "justification."]
maxWidth = 16
-> ["This    is    an",
    "example  of text",
    "justification.  "]
```

**Steps.**
1. Pack lines greedily. From word `i`, extend `j` while `lineLen + 1 + words[j].length <= maxWidth`. `lineLen` counts the words plus one space between each. Words `i..j-1` form one line.
2. A full-justified line has `g = j - i - 1` gaps and `spaces = maxWidth - sumOfWordLengths`. Each gap gets `Math.floor(spaces / g)` spaces, and the first `spaces % g` gaps get one more.
3. For a line with one word (`g === 0`) or the final line, join with single spaces. Then pad the right edge with spaces to `maxWidth`.
4. Repeat from `i = j` until no words remain. The problem statement forces the greedy packing, so the real work is the space arithmetic.

**Complexity.** O(total characters) time / O(maxWidth) working space per line.

## Interview follow-ups

- After **Merge Sorted Array**: "What if you cannot write from the back, because `nums1` has no spare capacity?" Allocate an O(m) buffer, or use galloping insertion, and discuss the trade-offs.
- After **Majority Element**: "What if no majority is certain?" Verify the candidate with a second counting pass. "Find all elements that appear more than ⌊n/3⌋ times?" Use Boyer–Moore with two candidates.
- After **Rotate Array**: "Do it in O(1) space a different way." Use cyclic replacements: follow the index chains through `gcd(n, k)` cycles.
- After **Remove Duplicates II**: "Generalize to at most `t` duplicates." Compare with `nums[write - t]`.

## The task

You build four in-place array operations, each in O(1) extra space. "In place" means you mutate the array you receive. The caller reads that array afterward, not your return value, unless a function returns a count.

1. `merge(nums1, m, nums2, n)`: `nums1` has length `m + n`. Its first `m` values are in ascending order. Its last `n` slots are zeros that reserve space for the merge. `nums2` has `n` values in ascending order. Merge `nums2` into `nums1` so `nums1` holds all `m + n` values in ascending order. Mutate `nums1`. The caller ignores the return value.
2. `removeDuplicates(nums)`: `nums` is in ascending order. Remove duplicates in place so each distinct value appears once, in order. Return `k`, the number of distinct values. After the call, `nums[0..k-1]` holds them. Values from index `k` onward do not matter. Do not allocate a second array.
3. `majorityElement(nums)`: return the value that appears more than `⌊nums.length / 2⌋` times. `nums` is not empty, and a majority always exists. Use O(n) time and O(1) space (Boyer–Moore voting).
4. `rotate(nums, k)`: rotate `nums` to the right by `k` steps, in place. The last `k` values move to the front, and the rest shift right. `k >= 0` and can exceed `nums.length`. A rotation by the length changes nothing, so normalize with `k % nums.length`. The caller ignores the return value.

Edge cases:

- `merge`: `n === 0` changes nothing. `m === 0` copies `nums2` across. Handle duplicates across both arrays and negative numbers. When all of `nums2` is smaller than all of `nums1`, every `nums1` value moves.
- `removeDuplicates`: an empty array returns 0. Handle a single element, no duplicates, all values the same and negative values.
- `majorityElement`: handle a single element, all values the same, negative values and a majority grouped at one end.
- `rotate`: handle `k === 0`, `k` equal to the length, `k` larger than the length and a single element.

```js
const nums1 = [1, 2, 3, 0, 0, 0];
merge(nums1, 3, [2, 5, 6], 3);
// nums1 is [1, 2, 2, 3, 5, 6]

const a = [1];
merge(a, 1, [], 0);   // a is [1]
const b = [0];
merge(b, 0, [2], 1);  // b is [2]

const d = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
removeDuplicates(d);  // 5
d.slice(0, 5);        // [0, 1, 2, 3, 4]
removeDuplicates([1, 2, 3]);  // 3
removeDuplicates([7, 7, 7]);  // 1
removeDuplicates([]);         // 0

majorityElement([3, 2, 3]);       // 3
majorityElement([5]);             // 5
majorityElement([1, 2, 9, 9, 9]); // 9

const r = [1, 2, 3, 4, 5, 6, 7];
rotate(r, 3);
// r is [5, 6, 7, 1, 2, 3, 4]
const s = [-1, -100, 3, 99];
rotate(s, 2);  // s is [3, 99, -1, -100]
const t = [1, 2];
rotate(t, 5);  // t is [2, 1]
```
