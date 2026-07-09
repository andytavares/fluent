# Dynamic Programming: 1D

## What you'll learn

A repeatable five-step method for dynamic programming — state, recurrence, base cases, iteration order, space optimization — applied to the five most-asked 1D DP problems. DP is where interviews separate "memorized the answer" from "can derive the answer"; the method is what lets you derive. This concept assumes the array fundamentals from Arrays & Strings; the Multidimensional DP concept extends the same five steps to grids and string pairs.

## Key concepts

DP applies when a problem has **overlapping subproblems** (the same smaller question gets asked repeatedly) and **optimal substructure** (the best answer to the big question is built from best answers to smaller ones). When both hold, a brute-force recursion that recomputes subproblems exponentially collapses to polynomial time by computing each subproblem once.

### The five-step method

Work through these in order, every time. Skipping to code is how DP solutions come out subtly wrong.

1. **State.** Define `dp[i]` in one precise sentence — *"`dp[i]` is the fewest coins that total amount `i`"*. If you can't state it in a sentence, the recurrence will be wrong. Precision matters: "ending exactly at `i`" and "among the first `i`" are different states with different recurrences.
2. **Recurrence.** Express `dp[i]` in terms of earlier states by enumerating the *last decision* — the final step/house/word/coin that produced state `i`. The cases must be exhaustive and (for counting problems) disjoint.
3. **Base cases.** The smallest states with direct answers, plus the sentinel for "impossible" states (`Infinity` for minimization, `false` for reachability, `0` for counting).
4. **Iteration order.** Every state must be computed after the states it reads. In 1D that's almost always left to right.
5. **Space optimization.** If `dp[i]` only reads the previous `k` states, replace the array with `k` rolling variables. If it can read arbitrarily far back (Coin Change, Word Break, LIS), the array stays.

### Memoization vs tabulation

Top-down memoization = recursion plus a cache; bottom-up tabulation = fill an array in dependency order. They compute the same values. In TypeScript, prefer tabulation: there's no built-in cache decorator (Python's `functools.lru_cache` has no counterpart), and recursion depth beyond ~10⁴ frames risks a stack overflow at runtime — the type checker won't warn you about that. Tabulation also makes step 5 mechanical — you can *see* which slots each state reads.

### Template: Fibonacci-style recurrence

`dp[i]` reads the previous two states → two rolling variables.

```ts
function climbStairs(n: number): number {
  let prev2 = 1; // dp[i-2], seeded with dp[0] = 1
  let prev1 = 1; // dp[i-1], seeded with dp[1] = 1
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

### Template: take-or-skip decision

Each element is either used (locking out a neighbor) or skipped:

```ts
// dp[i] = max(dp[i-1], dp[i-2] + nums[i])  →  same two rolling variables
let prev2 = 0, prev1 = 0;
for (const num of nums) {
  const curr = Math.max(prev1, prev2 + num);
  prev2 = prev1;
  prev1 = curr;
}
return prev1;
```

### Template: reaching back over the whole prefix

Coin Change and Word Break read arbitrary earlier states, so the array stays and there's an inner loop over "what the last piece was":

```ts
const dp: number[] = new Array(amount + 1).fill(Infinity);
dp[0] = 0;
for (let a = 1; a <= amount; a++) {
  for (const coin of coins) {
    if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
  }
}
return dp[amount] === Infinity ? -1 : dp[amount];
```

### Complexity of the flagship problems

| Problem | Time | Space | Recurrence shape |
|---------|------|-------|------------------|
| Climbing Stairs | O(n) | O(1) | last two states |
| House Robber | O(n) | O(1) | last two states |
| Word Break | O(n · L²), L = longest word | O(n) | any split point |
| Coin Change | O(amount × \|coins\|) | O(amount) | any last coin |
| Longest Increasing Subsequence | O(n²) table, O(n log n) tails | O(n) | any earlier element |

## Watch out

- **Base-case off-by-ones shift the whole answer.** Climbing Stairs needs `dp[0] = 1, dp[1] = 1` (one way to stand still); seeding `dp[1] = 1, dp[2] = 1` returns Fibonacci shifted by one for every input.
- **Coin Change's sentinel is `Infinity`, and `dp[0] = 0` — not 1.** `Infinity + 1` is still `Infinity`, so unreachable states never look reachable. A large finite sentinel like `Number.MAX_SAFE_INTEGER` breaks that: adding 1 to it makes it comparable-wrong.
- **Word Break's table has `n + 1` entries.** `dp[i]` describes the prefix of *length* `i`, so the last word before position `i` is `s.slice(j, i)` with `dp[j]` as the prerequisite. Indexing `dp` by character position instead of prefix length is the classic off-by-one.
- **LIS is *strictly* increasing.** In the tails optimization the binary search must find the first tail `>= num` and replace it; using `>` there (or `tails[mid] <= num` in the condition) lets equal values chain and reports `[7,7,7]` as length 3.
- **Rolling variables: update order matters.** Compute `curr` from `prev1`/`prev2` *before* shifting them. Swapping the two assignment lines corrupts the next iteration.
- **Memoized recursion can blow the stack.** `climbStairs(10000)` top-down is ~10⁴ frames deep — near V8's default limit. Tabulate.

## Problem walkthroughs

### Climbing Stairs ★

**Problem.** You climb a staircase of `n` steps, taking 1 or 2 steps at a time. Return how many distinct step sequences reach the top.

**Example.**

    n = 2 → 2    (1+1, 2)
    n = 3 → 3    (1+1+1, 1+2, 2+1)

**Steps.**
1. **State.** `dp[i]` = number of distinct ways to reach step `i`.
2. **Recurrence.** The last move was a 1-step from `i-1` or a 2-step from `i-2`, and those two sets of sequences are disjoint and cover everything: `dp[i] = dp[i-1] + dp[i-2]`.
3. **Base cases.** `dp[0] = 1` (the empty sequence), `dp[1] = 1`.
4. **Iteration order.** `i` ascending from 2 to `n`.
5. **Space optimization.** Only the last two states are read → two rolling variables, O(1) space.
6. The result is the Fibonacci sequence shifted by one — worth saying out loud in an interview.

**Complexity.** O(n) time / O(1) space.

### House Robber ★

**Problem.** `nums[i]` is the cash in house `i` on a street. You can't rob two adjacent houses. Return the maximum total you can rob.

**Example.**

    [1,2,3,1]     → 4    (houses 0 and 2)
    [2,7,9,3,1]   → 12   (houses 0, 2, 4)

**Steps.**
1. **State.** `dp[i]` = maximum loot obtainable from the first `i + 1` houses (house `i` robbed or not — the state doesn't care, which is what makes it composable).
2. **Recurrence.** Last decision at house `i`: skip it (`dp[i-1]`) or rob it, which forbids house `i-1` (`dp[i-2] + nums[i]`). Take the max.
3. **Base cases.** Conceptually `dp[-1] = 0` and `dp[-2] = 0` — starting both rolling variables at 0 encodes them and handles the empty array for free.
4. **Iteration order.** Left to right over the houses.
5. **Space optimization.** Two rolling variables, same shape as Climbing Stairs — the recurrence reads exactly two states back.

**Complexity.** O(n) time / O(1) space.

### Word Break ★

**Problem.** Given a string `s` and a dictionary `wordDict`, return `true` if `s` can be split into a sequence of one or more dictionary words. Words may be reused any number of times.

**Example.**

    s = "leetcode",  wordDict = ["leet","code"]              → true
    s = "catsandog", wordDict = ["cats","dog","sand","and","cat"] → false

**Steps.**
1. **State.** `dp[i]` = `true` iff the prefix `s.slice(0, i)` (length `i`) can be segmented into dictionary words.
2. **Recurrence.** Enumerate the last word: `dp[i]` is true if any split point `j < i` has `dp[j]` true and `s.slice(j, i)` in the dictionary.
3. **Base cases.** `dp[0] = true` — the empty prefix is trivially segmented.
4. **Iteration order.** `i` from 1 to `n`; inner `j` in any order (scanning `j` backward from `i - 1` and breaking on the first hit is a natural micro-optimization).
5. **Space optimization.** None available — `dp[i]` can read any `j` — but bound the inner loop by the longest dictionary word: no word longer than `L` can end at `i`, so only `j >= i - L` matters.
6. Put the dictionary in a `Set` first; `Array.includes` inside the double loop adds a factor of the dictionary size. The DP is what kills the exponential blowup of naive recursion, which re-segments the same suffix over and over (the `"aaaa...b"` adversarial case).

**Complexity.** O(n · L²) time (n positions × L split points × O(L) slice-and-hash) / O(n) space.

### Coin Change ★

**Problem.** Given coin denominations `coins` (unlimited supply of each) and a target `amount`, return the *fewest* coins that sum exactly to `amount`, or `-1` if it can't be made.

**Example.**

    coins = [1,2,5], amount = 11 → 3    (5+5+1)
    coins = [2],     amount = 3  → -1

**Steps.**
1. **State.** `dp[a]` = fewest coins totaling exactly amount `a`.
2. **Recurrence.** Enumerate the last coin used: `dp[a] = 1 + min(dp[a - c])` over every coin `c <= a`.
3. **Base cases.** `dp[0] = 0`; every other slot starts at `Infinity` ("not yet reachable" — and `Infinity + 1` stays `Infinity`, so unreachable states never contaminate reachable ones).
4. **Iteration order.** `a` ascending from 1 to `amount`; each `dp[a - c]` is already final when read.
5. **Space optimization.** None — the recurrence reaches back by arbitrary coin values, so the O(amount) array is inherent.
6. Return `dp[amount] === Infinity ? -1 : dp[amount]`. Note that greedy fails this problem: with `coins = [1,5,11]` and `amount = 15`, greedy takes 11+1+1+1+1 (5 coins); DP finds 5+5+5 (3).

**Complexity.** O(amount × |coins|) time / O(amount) space.

### Longest Increasing Subsequence ★

**Problem.** Return the length of the longest *strictly* increasing subsequence of `nums` (elements keep their relative order but need not be contiguous).

**Example.**

    [10,9,2,5,3,7,101,18] → 4    (2,3,7,101 — or 2,5,7,101)
    [7,7,7,7]             → 1

**Steps.**
1. **State.** `dp[i]` = length of the longest strictly increasing subsequence *ending exactly at* index `i`. ("Ending exactly at" is essential — without it you can't extend.)
2. **Recurrence.** Enumerate the previous element of the subsequence: `dp[i] = 1 + max(dp[j])` over all `j < i` with `nums[j] < nums[i]`; just `1` if no such `j`.
3. **Base cases.** Every `dp[i]` starts at 1 (the element alone).
4. **Iteration order.** `i` ascending; the answer is `max(dp)`, not `dp[n-1]` — the LIS can end anywhere.
5. **Space/time optimization.** The O(n²) table can be replaced by patience sorting: keep `tails`, where `tails[k]` is the smallest possible tail of any increasing subsequence of length `k + 1`. `tails` is always sorted, so for each number binary-search the first entry `>= num` and overwrite it (or append if none). The answer is `tails.length` — O(n log n). Note `tails` is *not* an actual subsequence; only its length is meaningful.
6. Why the overwrite is safe: replacing a tail with an equal-length-but-smaller tail never shortens any future subsequence — it only opens more extensions.

**Complexity.** O(n²) time / O(n) space for the table; O(n log n) / O(n) with tails.

## Interview follow-ups

After Climbing Stairs:
- "Steps of 1, 2, or 3?" — `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]`, three rolling variables.
- "n up to 10¹⁸?" — matrix exponentiation on the Fibonacci matrix, O(log n) (fast pow from the Math concept).

After House Robber:
- "Houses in a circle?" (House Robber II) — first and last can't both be robbed: solve the linear problem twice, on `nums[0..n-2]` and `nums[1..n-1]`, return the max.
- "Rob with at least `k` houses between hits?" — compare against `dp[i-k-1]` instead of `dp[i-2]`.

After Word Break:
- "Return one valid segmentation / all of them?" (Word Break II) — DFS with memoization on the suffix start index; the boolean DP tells you which branches can succeed.

After Coin Change:
- "Count the *ways* instead of the minimum?" (Coin Change II) — switch `min` to `+`, seed `dp[0] = 1`, and loop **coins outer, amounts inner** so each combination is counted once regardless of order.
- "Why does greedy fail here but work for US coins?" — US denominations form a canonical system; arbitrary ones don't (`[1,5,11]`, 15).

After LIS:
- "Recover the subsequence itself?" — keep a parent-pointer array alongside the table version and walk it back.
- "Longest *non-decreasing*?" — binary-search the first tail `> num` instead of `>= num`.
- "Russian Doll Envelopes?" — sort by width asc, height desc, then LIS on heights.

## The task

Five 1D DP classics. For each: state, recurrence, base cases, order, then code. Match the stated complexity — the O(1)-space versions where noted.

### `climbStairs(n: number): number`

Count the distinct ways to climb `n` stairs (`n >= 1`) taking 1 or 2 steps at a time. Two sequences are distinct if their step sizes differ at any point. O(n) time, O(1) space.

```ts
climbStairs(1);  // 1
climbStairs(2);  // 2
climbStairs(3);  // 3
climbStairs(5);  // 8
```

Edge cases: `n = 1`, and `n = 45` (the answer, 1836311903, still fits a double exactly — no overflow handling needed).

### `rob(nums: number[]): number`

`nums[i]` is the cash in house `i`; adjacent houses can't both be robbed. Return the maximum total. An empty array yields 0. O(n) time, O(1) space.

```ts
rob([1, 2, 3, 1]);        // 4
rob([2, 7, 9, 3, 1]);     // 12
rob([]);                  // 0
rob([5]);                 // 5
```

Edge cases: empty array, single house, two houses (take the larger), the pattern `[2, 1, 1, 2]` → 4 (rob both ends — greedy "take every other house" fails).

### `wordBreak(s: string, wordDict: string[]): boolean`

Return `true` if `s` can be split entirely into words from `wordDict` (each word usable any number of times), `false` otherwise. The empty string is segmentable (`true`). `wordDict` is a non-empty array of non-empty lowercase words. O(n · L²) time where `L` caps the word length.

```ts
wordBreak("leetcode", ["leet", "code"]);                       // true
wordBreak("applepenapple", ["apple", "pen"]);                  // true
wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"]); // false
```

Edge cases: empty string (`true`), a word reused many times (`"aaaa"` with `["a"]`), overlapping candidates where the first greedy match dead-ends (`"cars"` with `["car", "ca", "rs"]` → `true`), and long adversarial inputs like `"aaa...ab"` that hang naive recursion.

### `coinChange(coins: number[], amount: number): number`

Return the minimum number of coins from `coins` (unlimited supply of each denomination) summing exactly to `amount`, or `-1` if impossible. `amount >= 0`; all denominations are positive. O(amount × |coins|) time.

```ts
coinChange([1, 2, 5], 11);   // 3   (5+5+1)
coinChange([2], 3);          // -1
coinChange([1], 0);          // 0
coinChange([1, 5, 11], 15);  // 3   (5+5+5 — greedy would say 5)
```

Edge cases: `amount = 0` (zero coins), unreachable amounts (`-1`), a denomination larger than `amount`, cases where greedy largest-first is wrong.

### `lengthOfLIS(nums: number[]): number`

Return the length of the longest strictly increasing subsequence of `nums` (not necessarily contiguous; empty array → 0). O(n²) is acceptable; O(n log n) with the tails technique is the follow-up standard.

```ts
lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]);  // 4
lengthOfLIS([0, 1, 0, 3, 2, 3]);            // 4
lengthOfLIS([7, 7, 7, 7]);                  // 1
```

Edge cases: empty array (0), single element (1), all-equal values (1 — strictness), fully descending input (1), fully ascending input (`n`).
