# Arrays & Strings

## What you'll learn

The array-manipulation techniques that most interview problems reduce to: in-place editing with a write pointer, filling from the back, the reversal trick for rotation, Boyer–Moore voting, and single-pass greedy scans. These are the building blocks every later pattern (two pointers, sliding window, binary search) assumes you already have.

## Key concepts

### The write pointer — edit an array in place

Many problems say "remove/keep elements *in place* and return the new length." Don't `splice` (O(n) per call). Instead keep a `write` index that marks where the next kept element goes, and sweep a `read` index across the whole array:

```ts
let write = 0;
for (let read = 0; read < nums.length; read++) {
  if (keep(nums[read])) {
    nums[write] = nums[read];
    write++;
  }
}
return write; // new logical length; nums[0..write-1] is the answer
```

Invariant: everything left of `write` is final output; `read` never lags behind `write`, so you never overwrite an unread value. One pass, O(1) extra space.

### Fill from the back

When merging into an array that has free space **at the end**, write from the back so you never clobber unread data:

```ts
let k = m + n - 1;          // last slot
// compare the largest remaining element of each source, place it at k, walk left
```

Front-to-back merging would overwrite `nums1` elements you haven't read yet; back-to-front cannot, because the write index stays at or ahead of both read indexes.

### Rotation by three reversals

Rotating an array right by `k` is three in-place reversals — no extra array:

```ts
// [1,2,3,4,5,6,7], k=3
reverseRange(nums, 0, n - 1); // [7,6,5,4,3,2,1]
reverseRange(nums, 0, k - 1); // [5,6,7,4,3,2,1]
reverseRange(nums, k, n - 1); // [5,6,7,1,2,3,4]
```

Always normalize first: `k %= n` (rotating by `n` is a no-op).

### Boyer–Moore voting — majority in O(1) space

To find the element that appears more than ⌊n/2⌋ times, pair up each occurrence of the candidate against one occurrence of anything else and cancel them. The majority element has more than half the votes, so it survives all cancellations:

```ts
let candidate: number = nums[0];
let count = 0;
for (const x of nums) {
  if (count === 0) { candidate = x; count = 1; }
  else if (x === candidate) count++;
  else count--;
}
// candidate is the majority (guaranteed one exists)
```

### Greedy single-pass scans

A surprising number of problems fall to "walk once, maintain a running extremum": best stock profit (min price so far), jump reachability (farthest index so far), gas station (running tank, reset on deficit). The proof pattern is always an exchange argument — any optimal answer can be transformed into the greedy one without getting worse.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Merge Sorted Array | O(m + n) | O(1) | fill from the back |
| Remove Duplicates from Sorted Array | O(n) | O(1) | write pointer |
| Majority Element | O(n) | O(1) | Boyer–Moore voting |
| Rotate Array | O(n) | O(1) | three reversals |

## Watch out

- **`Array.prototype.sort()` is lexicographic by default**, and TypeScript's type checker will not stop you: `[10, 9, 2].sort()` → `[10, 2, 9]`. Always pass `(a, b) => a - b` for numbers — the compiler happily accepts `number[]` either way.
- **`splice`/`shift`/`unshift` are O(n)** — using them inside a loop turns a linear algorithm quadratic. The write pointer exists to avoid them.
- **Normalize `k` before rotating**: `k` can exceed `nums.length`; forgetting `k %= n` breaks the reversal indexes.
- **"Return k" problems**: the array's `.length` does not change. The judge reads `nums[0..k-1]`; whatever sits past `k` is ignored. Don't try to truncate.
- **Write from the back when merging** — front-to-back overwrites unread `nums1` values.
- **Boyer–Moore only finds the majority if one is guaranteed.** If existence isn't promised, you need a second verification pass.
- **`number[]` doesn't distinguish "sorted" or "non-empty."** TypeScript's structural types won't encode these preconditions for you — the doc comment on the signature is the only place that contract lives; don't expect the compiler to catch a caller passing an unsorted array to `merge`.

## Problem walkthroughs

### Merge Sorted Array ★

**Problem.** `nums1` (length `m + n`) holds `m` sorted numbers followed by `n` placeholder zeros. `nums2` (length `n`) is also sorted. Merge `nums2` into `nums1` so `nums1` holds all `m + n` numbers in ascending order. Mutate `nums1`; return nothing.

**Example.**

    nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
    → nums1 becomes [1,2,2,3,5,6]

**Steps.**
1. Set three indexes: `i = m - 1` (last real element of `nums1`), `j = n - 1` (last of `nums2`), `k = m + n - 1` (last slot overall).
2. Loop while `j >= 0`: if `i >= 0` and `nums1[i] > nums2[j]`, write `nums1[i]` at `k` and decrement `i`; otherwise write `nums2[j]` at `k` and decrement `j`. Decrement `k` either way.
3. Stop when `j < 0` — any remaining `nums1` prefix is already sorted and already in place, so there's nothing left to do.
4. Invariant: `k >= i` at all times, so a write at `k` never destroys an unread `nums1` element. That's why the merge works front-of-nothing, back-of-everything.

**Complexity.** O(m + n) time / O(1) space — each element is written exactly once.

### Remove Element

**Problem.** Given `nums` and a value `val`, remove every occurrence of `val` in place. Return `k`, the count of remaining elements; the first `k` slots of `nums` must hold the kept elements (order may be preserved).

**Example.**

    nums = [3,2,2,3], val = 3 → returns 2, nums starts with [2,2]

**Steps.**
1. Initialize `write = 0`.
2. For each `read` index, if `nums[read] !== val`, copy `nums[read]` to `nums[write]` and increment `write`.
3. Return `write`. Everything left of `write` is exactly the kept elements in original order.

**Complexity.** O(n) time / O(1) space — single sweep, one comparison per element.

### Remove Duplicates from Sorted Array ★

**Problem.** `nums` is sorted ascending. Deduplicate it in place so each value appears once, keeping relative order. Return `k`, the number of unique values; the first `k` slots must hold them.

**Example.**

    nums = [0,0,1,1,1,2,2,3,3,4] → returns 5, nums starts with [0,1,2,3,4]

**Steps.**
1. Initialize `write = 0`.
2. For each `read` index: keep `nums[read]` if `write === 0` (first element is always unique) or `nums[read] !== nums[write - 1]` (differs from the last kept value).
3. On keep, copy to `nums[write]` and increment `write`.
4. Return `write`. Because the array is sorted, duplicates are adjacent — comparing against only the last kept value is sufficient.

**Complexity.** O(n) time / O(1) space.

### Remove Duplicates from Sorted Array II

**Problem.** Same setup as above, but each value may appear **at most twice**. Return `k` and pack the first `k` slots.

**Example.**

    nums = [1,1,1,2,2,3] → returns 5, nums starts with [1,1,2,2,3]

**Steps.**
1. Same write-pointer sweep, different keep test: keep `nums[read]` when `write < 2` or `nums[read] !== nums[write - 2]`.
2. Comparing against the value two slots back means a third consecutive copy fails the test, but a second copy passes.
3. This generalizes: "at most `t` copies" is `write < t || nums[read] !== nums[write - t]`.

**Complexity.** O(n) time / O(1) space.

### Majority Element ★

**Problem.** Return the element that appears more than ⌊n/2⌋ times in `nums`. One is guaranteed to exist.

**Example.**

    nums = [2,2,1,1,1,2,2] → 2

**Steps.**
1. Keep a `candidate` and a `count`, starting `count = 0`.
2. For each element: if `count === 0`, adopt it as the candidate with `count = 1`; else increment `count` on a match, decrement on a mismatch.
3. Return the candidate. Every decrement cancels one candidate occurrence against one non-candidate occurrence; the true majority has more than half the array, so it can never be fully cancelled — it must be the final candidate.

**Complexity.** O(n) time / O(1) space — beats sorting (O(n log n)) and hashing (O(n) space).

### Rotate Array ★

**Problem.** Rotate `nums` to the right by `k` steps, in place. `k >= 0` and may exceed the array length. Return nothing.

**Example.**

    nums = [1,2,3,4,5,6,7], k = 3 → nums becomes [5,6,7,1,2,3,4]

**Steps.**
1. Normalize: `k %= nums.length`. If `k === 0`, done.
2. Reverse the whole array.
3. Reverse the first `k` elements.
4. Reverse the remaining `n - k` elements.
5. Why it works: a right-rotation moves the last `k` elements to the front as a block. Reversing everything puts that block at the front but backwards; the two partial reversals fix the internal order of each block.

**Complexity.** O(n) time / O(1) space — every element is swapped at most twice.

### Best Time to Buy and Sell Stock

**Problem.** `prices[i]` is a stock price on day `i`. Choose one day to buy and a later day to sell, maximizing profit. Return the max profit, or 0 if no profitable trade exists.

**Example.**

    prices = [7,1,5,3,6,4] → 5   (buy at 1, sell at 6)

**Steps.**
1. Track `minPrice` (lowest price seen so far) and `best` (best profit so far), starting `minPrice = prices[0]`, `best = 0`.
2. For each later price `p`: update `best = Math.max(best, p - minPrice)`, then `minPrice = Math.min(minPrice, p)`.
3. The best sell on day `i` always buys at the minimum before `i` — the running minimum makes that O(1) per day.

**Complexity.** O(n) time / O(1) space.

### Best Time to Buy and Sell Stock II

**Problem.** Same prices, but you may buy and sell as many times as you like (holding at most one share at a time). Return the maximum total profit.

**Example.**

    prices = [7,1,5,3,6,4] → 7   (1→5 = 4, plus 3→6 = 3)

**Steps.**
1. Sum every positive day-over-day increase: `if (prices[i] > prices[i-1]) profit += prices[i] - prices[i-1]`.
2. Why: any multi-day upswing decomposes into consecutive one-day gains, and no strategy can capture more than every positive daily delta.

**Complexity.** O(n) time / O(1) space.

### Jump Game

**Problem.** `nums[i]` is the maximum jump length from index `i`. Starting at index 0, return `true` if you can reach the last index.

**Example.**

    nums = [2,3,1,1,4] → true
    nums = [3,2,1,0,4] → false  (index 3 is a dead end)

**Steps.**
1. Track `farthest`, the highest index reachable so far (start 0).
2. Walk `i` from 0: if `i > farthest`, you're standing somewhere unreachable — return `false`.
3. Otherwise update `farthest = Math.max(farthest, i + nums[i])`; return `true` once `farthest >= nums.length - 1`.
4. Invariant: every index `<= farthest` is reachable, so extending `farthest` from any of them is legal.

**Complexity.** O(n) time / O(1) space.

### Jump Game II

**Problem.** Same array, reaching the last index is guaranteed possible. Return the **minimum** number of jumps needed.

**Example.**

    nums = [2,3,1,1,4] → 2   (0 → 1 → 4)

**Steps.**
1. Think in BFS layers: `currentEnd` is the far edge of the region reachable in `jumps` jumps; `farthest` is the far edge reachable in `jumps + 1`.
2. Walk `i` from 0 to `n - 2` (you never jump *from* the last index): update `farthest = Math.max(farthest, i + nums[i])`.
3. When `i === currentEnd`, you've exhausted the current layer: increment `jumps` and set `currentEnd = farthest`.
4. Return `jumps`. Each layer boundary corresponds to exactly one optimal jump, so the count is minimal.

**Complexity.** O(n) time / O(1) space.

### H-Index

**Problem.** Given an array `citations` where `citations[i]` counts citations of a researcher's i-th paper, return their h-index: the largest `h` such that at least `h` papers have `h` or more citations each.

**Example.**

    citations = [3,0,6,1,5] → 3   (three papers have ≥ 3 citations)

**Steps.**
1. Sort descending: `citations.sort((a, b) => b - a)`.
2. Walk `i` from 0 while `citations[i] > i` — at position `i` (0-based) you have `i + 1` papers with at least `citations[i]` citations, so `h = i + 1` is achievable exactly when `citations[i] >= i + 1`.
3. Return the count of positions where `citations[i] >= i + 1` (equivalently, the loop index where the walk stops).
4. For O(n): bucket-count citations capped at `n`, then scan buckets from `n` down accumulating paper counts until `count >= h`.

**Complexity.** O(n log n) time / O(1) space with sort; O(n) / O(n) with buckets.

### Insert Delete GetRandom O(1)

**Problem.** Design a set supporting `insert(val)`, `remove(val)`, and `getRandom()` — all average O(1). `getRandom` must return each stored element with equal probability. `insert`/`remove` return whether they changed the set.

**Example.**

    insert(1) → true, insert(1) → false, remove(2) → false,
    insert(2) → true, getRandom() → 1 or 2 with equal probability

**Steps.**
1. Keep two structures: an array `items: number[]` (for random access) and a `Map<number, number>` from value → its index in `items`.
2. `insert`: if the map has the value, return `false`; else push onto `items`, record its index in the map, return `true`.
3. `remove`: if absent, return `false`. Otherwise swap-delete: copy the **last** array element into the removed value's slot, update that element's index in the map, pop the array, delete the map entry.
4. `getRandom`: `items[Math.floor(Math.random() * items.length)]`.
5. The swap-delete is the whole trick — deleting from the middle of an array is O(n), but overwriting with the last element and popping is O(1) and keeps the array dense.

**Complexity.** O(1) average per operation / O(n) space.

### Product of Array Except Self

**Problem.** Return an array `answer` where `answer[i]` is the product of every element of `nums` except `nums[i]`. No division; O(n) time.

**Example.**

    nums = [1,2,3,4] → [24,12,8,6]

**Steps.**
1. First pass (left to right): set `answer[i]` = product of all elements strictly left of `i` (running prefix product; `answer[0] = 1`).
2. Second pass (right to left): keep a running `suffix` product starting at 1; multiply `answer[i] *= suffix`, then `suffix *= nums[i]`.
3. After both passes, `answer[i]` = (product left of `i`) × (product right of `i`) — exactly "everything except self," zeros handled with no special-casing.

**Complexity.** O(n) time / O(1) extra space (the output array doesn't count).

### Gas Station

**Problem.** There are `n` gas stations on a circle; `gas[i]` is fuel available at station `i`, `cost[i]` the fuel needed to drive to station `i + 1`. Return the starting station index from which you can complete a full loop with an empty initial tank, or `-1` if impossible. If a solution exists it is unique.

**Example.**

    gas = [1,2,3,4,5], cost = [3,4,5,1,2] → 3

**Steps.**
1. Track `total` (net fuel over the whole loop) and `tank` (net fuel since the current candidate start), plus `start = 0`.
2. For each `i`: add `gas[i] - cost[i]` to both `total` and `tank`.
3. If `tank < 0`, no start in `[start..i]` can work (any of them would arrive at `i + 1` with even less fuel) — set `start = i + 1`, `tank = 0`.
4. After the loop, return `total >= 0 ? start : -1`. If total fuel covers total cost, the last surviving candidate is guaranteed to complete the loop.

**Complexity.** O(n) time / O(1) space — one pass, no simulation of the full loop per candidate.

### Candy

**Problem.** Children stand in a line with `ratings`. Give each child at least one candy such that any child with a higher rating than an immediate neighbor gets more candies than that neighbor. Return the minimum total candies.

**Example.**

    ratings = [1,0,2] → 5   (candies [2,1,2])

**Steps.**
1. Initialize `candies` to all 1s.
2. Left-to-right pass: if `ratings[i] > ratings[i-1]`, set `candies[i] = candies[i-1] + 1` — satisfies every left-neighbor constraint minimally.
3. Right-to-left pass: if `ratings[i] > ratings[i+1]`, set `candies[i] = Math.max(candies[i], candies[i+1] + 1)` — the `max` keeps the left constraint intact while fixing the right one.
4. Sum the array. Each constraint is satisfied with the minimum possible increment, so the total is minimal.

**Complexity.** O(n) time / O(n) space for the candies array.

### Trapping Rain Water

**Problem.** Given `height`, an elevation map of bar heights, compute how much rainwater the terrain traps.

**Example.**

    height = [0,1,0,2,1,0,1,3,2,1,2,1] → 6

**Steps.**
1. Water above position `i` is `min(maxLeft(i), maxRight(i)) - height[i]` — bounded by the shorter of the tallest walls on each side.
2. Two pointers `left`/`right` from the ends, with running `leftMax` and `rightMax`.
3. If `leftMax <= rightMax`, the left side is the binding constraint: add `leftMax - height[left]` if positive, update `leftMax`, advance `left`. Otherwise do the mirror on the right.
4. The key insight: when `leftMax <= rightMax`, you already know `min(maxLeft, maxRight)` at `left` is exactly `leftMax` — some wall at least `rightMax` tall exists to the right, so you can settle that column without scanning further.

**Complexity.** O(n) time / O(1) space (vs O(n) space for the precomputed-arrays version).

### Roman to Integer

**Problem.** Convert a Roman numeral string (valid, range 1–3999) to an integer. Symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000; a smaller symbol before a larger one subtracts (IV = 4, CM = 900).

**Example.**

    "MCMXCIV" → 1994

**Steps.**
1. Build a symbol → value map (`Record<string, number>` or `Map<string, number>`).
2. Walk the string; for each character, if its value is **less than** the next character's value, subtract it from the total, otherwise add it.
3. That single comparison implements all six subtractive pairs (IV, IX, XL, XC, CD, CM) without special-casing them.

**Complexity.** O(n) time / O(1) space.

### Integer to Roman

**Problem.** Convert an integer in `[1, 3999]` to its Roman numeral.

**Example.**

    3749 → "MMMDCCXLIX"

**Steps.**
1. List value/symbol pairs in descending order **including the subtractive forms**, typed as `[number, string][]`: `[1000,"M"], [900,"CM"], [500,"D"], [400,"CD"], [100,"C"], [90,"XC"], [50,"L"], [40,"XL"], [10,"X"], [9,"IX"], [5,"V"], [4,"IV"], [1,"I"]`.
2. Greedily: for each pair, while `num >= value`, append the symbol and subtract the value.
3. Putting the subtractive pairs in the table is what makes plain greedy correct — 4 matches "IV" before it could ever emit "IIII".

**Complexity.** O(1) time and space — the value is bounded, at most 13 table entries.

### Length of Last Word

**Problem.** Given a string of words separated by spaces (possibly with trailing spaces), return the length of the last word.

**Example.**

    "   fly me   to   the moon  " → 4

**Steps.**
1. Set `i = s.length - 1`; walk left while `s[i] === " "` to skip trailing spaces.
2. Count characters while `i >= 0` and `s[i] !== " "`.
3. Return the count. Scanning from the end avoids allocating with `split` and touches only the tail of the string.

**Complexity.** O(n) worst case / O(1) space.

### Longest Common Prefix

**Problem.** Return the longest string that is a prefix of every string in the array; `""` if none.

**Example.**

    ["flower","flow","flight"] → "fl"

**Steps.**
1. Take `strs[0]` as the candidate prefix.
2. For each other string, shrink the candidate from the right (`candidate = candidate.slice(0, -1)`) while the string doesn't `startsWith(candidate)`.
3. If the candidate empties, return `""` early; otherwise whatever survives all strings is the answer.
4. The common prefix of all strings must be a prefix of the first one, so only shrinking is ever needed.

**Complexity.** O(S) time where S is total characters / O(1) extra space.

### Reverse Words in a String

**Problem.** Given a string with words separated by one or more spaces (possibly leading/trailing), return the words in reverse order joined by single spaces.

**Example.**

    "  the   sky is blue " → "blue is sky the"

**Steps.**
1. `s.trim().split(/\s+/)` — trim first so no empty tokens appear, and split on runs of whitespace to collapse multiple spaces.
2. `.reverse().join(" ")`.
3. For the O(1)-extra-space follow-up (relevant in C/C++): reverse the whole character array, then reverse each word in place, then compact extra spaces with a write pointer.

**Complexity.** O(n) time / O(n) space in TypeScript (strings are immutable).

### Zigzag Conversion

**Problem.** Write string `s` in a zigzag over `numRows` rows (down the first column, diagonally up to row 0, down again, …), then read it row by row and return the result.

**Example.**

    "PAYPALISHIRING", numRows = 3 → "PAHNAPLSIIGYIR"

**Steps.**
1. If `numRows === 1`, return `s` unchanged (no zigzag possible — this also avoids a division-by-zero-style bug in the direction flip).
2. Keep an array of `numRows` string buckets (`string[]`), a current `row = 0`, and a `step = 1`.
3. For each character: append to `rows[row]`, then flip `step` to `+1` at row 0 and to `-1` at row `numRows - 1`, then `row += step`.
4. Join the buckets. Simulating the walk is simpler and just as fast as deriving the index arithmetic.

**Complexity.** O(n) time / O(n) space.

### Find the Index of the First Occurrence in a String

**Problem.** Return the index of the first occurrence of `needle` in `haystack`, or `-1` if `needle` is not part of `haystack`.

**Example.**

    haystack = "sadbutsad", needle = "sad" → 0
    haystack = "leetcode", needle = "leeto" → -1

**Steps.**
1. Let `n = haystack.length`, `m = needle.length`. For each start `i` from 0 to `n - m`:
2. Compare `haystack[i + j]` to `needle[j]` for `j` in `[0, m)`; on a full match return `i`, on a mismatch break to the next `i`.
3. Return `-1` after the loop. This is the O(n·m) naive scan — fine at interview scale; mention KMP or the built-in `indexOf` (which you'd use in real code) for O(n + m).

**Complexity.** O(n·m) time / O(1) space for the naive scan.

### Text Justification

**Problem.** Given `words` and `maxWidth`, greedily pack as many words per line as fit (single spaces counted), then fully justify: distribute spaces so every line is exactly `maxWidth` wide, extra spaces going to the leftmost gaps. The last line — and any line with a single word — is left-justified and padded with trailing spaces. Return the array of lines.

**Example.**

    words = ["This","is","an","example","of","text","justification."], maxWidth = 16
    → ["This    is    an", "example  of text", "justification.  "]

**Steps.**
1. Greedy line packing: starting at word `i`, extend `j` while `lineLen + 1 + words[j].length <= maxWidth` (where `lineLen` counts words plus one space between each). The words `i..j-1` form one line.
2. For a full-justified line with `g = j - i - 1` gaps and `spaces = maxWidth - sumOfWordLengths`: each gap gets `Math.floor(spaces / g)` spaces, and the first `spaces % g` gaps get one extra.
3. Special cases — one word on the line (`g === 0`) or the final line: join with single spaces, then pad the right edge with spaces to `maxWidth`.
4. Repeat from `i = j` until all words are consumed. The greedy packing is forced by the problem statement, so the only real work is the space arithmetic.

**Complexity.** O(total characters) time / O(maxWidth) working space per line.

## Interview follow-ups

- After **Merge Sorted Array**: "What if you can't write from the back — say `nums1` has no spare capacity?" (allocate O(m) buffer, or gallop with insertion — discuss trade-offs.)
- After **Majority Element**: "What if no majority is guaranteed?" (verify the candidate with a second counting pass.) "Find all elements appearing more than ⌊n/3⌋ times?" (Boyer–Moore with two candidates.)
- After **Rotate Array**: "Do it with O(1) space a different way." (cyclic replacements — follow index chains, `gcd(n, k)` cycles.)
- After **Remove Duplicates II**: "Generalize to at most `t` duplicates." (compare against `nums[write - t]`.)

## The task

You're building the in-place array toolkit: four classic operations, each solvable in O(1) extra space. In-place means you mutate the array that was passed in — callers look at the array afterward, not at your return value (except where a count is specified).

### `merge(nums1: number[], m: number, nums2: number[], n: number): void`

`nums1` has length `m + n`: its first `m` elements are sorted ascending, and its last `n` slots are placeholders (zeros) reserved for the merge. `nums2` has `n` elements, also sorted ascending. Merge `nums2` into `nums1` so that `nums1` contains all `m + n` values in ascending order. **Mutate `nums1` in place; the return value is ignored.**

```ts
const nums1 = [1, 2, 3, 0, 0, 0];
merge(nums1, 3, [2, 5, 6], 3);
// nums1 is now [1, 2, 2, 3, 5, 6]

const a = [1];
merge(a, 1, [], 0);   // a is still [1]

const b = [0];
merge(b, 0, [2], 1);  // b is now [2]
```

Edge cases: `n === 0` (nothing to merge), `m === 0` (copy `nums2` across), duplicate values across the two arrays, negative numbers, and all of `nums2` smaller than all of `nums1` (forces every `nums1` element to shift).

### `removeDuplicates(nums: number[]): number`

`nums` is sorted ascending. Remove duplicates **in place** so each distinct value appears exactly once, preserving order. Return `k`, the number of distinct values; after the call, `nums[0..k-1]` must hold those values in ascending order. Elements from index `k` onward don't matter. Do not allocate a second array.

```ts
const nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
removeDuplicates(nums);         // returns 5
nums.slice(0, 5);               // [0, 1, 2, 3, 4]

removeDuplicates([1, 2, 3]);    // returns 3 (already unique)
removeDuplicates([7, 7, 7]);    // returns 1, first slot is 7
removeDuplicates([]);           // returns 0
```

Edge cases: empty array (return 0), single element, no duplicates at all, every element identical, negative values.

### `majorityElement(nums: number[]): number`

Return the value that appears more than `⌊nums.length / 2⌋` times. `nums` is non-empty and a majority element always exists. Target O(n) time and O(1) space (Boyer–Moore voting).

```ts
majorityElement([3, 2, 3]);              // 3
majorityElement([2, 2, 1, 1, 1, 2, 2]);  // 2
majorityElement([5]);                    // 5
```

Edge cases: single-element array, all elements identical, negative values, majority elements appearing at the ends rather than the middle.

### `rotate(nums: number[], k: number): void`

Rotate `nums` to the right by `k` steps, **in place**: the last `k` elements move to the front, everything else shifts right. `k >= 0` and may be larger than `nums.length` (rotating by the length is a no-op — normalize with `k % nums.length`). The return value is ignored; do it in O(1) extra space.

```ts
const nums = [1, 2, 3, 4, 5, 6, 7];
rotate(nums, 3);
// nums is now [5, 6, 7, 1, 2, 3, 4]

const a = [-1, -100, 3, 99];
rotate(a, 2);      // a is now [3, 99, -1, -100]

const b = [1, 2];
rotate(b, 4);      // b is unchanged: [1, 2] (4 % 2 === 0)
```

Edge cases: `k === 0`, `k` equal to the length, `k` much larger than the length, single-element array.
