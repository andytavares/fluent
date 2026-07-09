# Dynamic Programming: 1D

## What you'll learn

A repeatable five-step method for dynamic programming — state, recurrence, base cases, iteration order, space optimization — applied to the five most-asked 1D DP problems. DP is where interviews separate "memorized the answer" from "can derive the answer"; the method is what lets you derive. This concept assumes the list fundamentals from Arrays & Strings; the Multidimensional DP concept extends the same five steps to grids and string pairs.

## Key concepts

DP applies when a problem has **overlapping subproblems** (the same smaller question gets asked repeatedly) and **optimal substructure** (the best answer to the big question is built from best answers to smaller ones). When both hold, a brute-force recursion that recomputes subproblems exponentially collapses to polynomial time by computing each subproblem once.

### The five-step method

Work through these in order, every time. Skipping to code is how DP solutions come out subtly wrong.

1. **State.** Define `dp[i]` in one precise sentence — *"`dp[i]` is the fewest coins that total amount `i`"*. If you can't state it in a sentence, the recurrence will be wrong. Precision matters: "ending exactly at `i`" and "among the first `i`" are different states with different recurrences.
2. **Recurrence.** Express `dp[i]` in terms of earlier states by enumerating the *last decision* — the final step/house/word/coin that produced state `i`. The cases must be exhaustive and (for counting problems) disjoint.
3. **Base cases.** The smallest states with direct answers, plus the sentinel for "impossible" states (`float('inf')` for minimization, `False` for reachability, `0` for counting).
4. **Iteration order.** Every state must be computed after the states it reads. In 1D that's almost always left to right.
5. **Space optimization.** If `dp[i]` only reads the previous `k` states, replace the list with `k` rolling variables. If it can read arbitrarily far back (Coin Change, Word Break, LIS), the list stays.

### Memoization vs tabulation

Top-down memoization = recursion plus a cache; bottom-up tabulation = fill a list in dependency order. They compute the same values. Python makes memoization especially convenient — `@functools.lru_cache` turns any pure recursive function into a memoized one with no manual cache bookkeeping:

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def climb(n: int) -> int:
    if n <= 1:
        return 1
    return climb(n - 1) + climb(n - 2)
```

The catch: Python's default recursion limit (`sys.getrecursionlimit()`, usually 1000) makes deep top-down recursion fail well before it would in a language with a bigger stack or explicit tail-call handling. Tabulation avoids the limit entirely and makes step 5 mechanical — you can *see* which slots each state reads.

### Template: Fibonacci-style recurrence

`dp[i]` reads the previous two states → two rolling variables.

```python
def climb_stairs(n: int) -> int:
    prev2 = 1  # dp[i-2], seeded with dp[0] = 1
    prev1 = 1  # dp[i-1], seeded with dp[1] = 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```

### Template: take-or-skip decision

Each element is either used (locking out a neighbor) or skipped:

```python
# dp[i] = max(dp[i-1], dp[i-2] + nums[i])  ->  same two rolling variables
prev2, prev1 = 0, 0
for num in nums:
    prev2, prev1 = prev1, max(prev1, prev2 + num)
return prev1
```

### Template: reaching back over the whole prefix

Coin Change and Word Break read arbitrary earlier states, so the list stays and there's an inner loop over "what the last piece was":

```python
dp = [float('inf')] * (amount + 1)
dp[0] = 0
for a in range(1, amount + 1):
    for coin in coins:
        if coin <= a:
            dp[a] = min(dp[a], dp[a - coin] + 1)
return -1 if dp[amount] == float('inf') else dp[amount]
```

### Complexity of the flagship problems

| Problem | Time | Space | Recurrence shape |
|---------|------|-------|-------------------|
| Climbing Stairs | O(n) | O(1) | last two states |
| House Robber | O(n) | O(1) | last two states |
| Word Break | O(n · L²), L = longest word | O(n) | any split point |
| Coin Change | O(amount × \|coins\|) | O(amount) | any last coin |
| Longest Increasing Subsequence | O(n²) table, O(n log n) tails | O(n) | any earlier element |

## Watch out

- **Base-case off-by-ones shift the whole answer.** Climbing Stairs needs `dp[0] = 1, dp[1] = 1` (one way to stand still); seeding `dp[1] = 1, dp[2] = 1` returns Fibonacci shifted by one for every input.
- **Coin Change's sentinel is `float('inf')`, and `dp[0] = 0` — not 1.** `float('inf') + 1` is still `float('inf')`, so unreachable states never look reachable. A large finite sentinel breaks that: adding 1 to it makes it comparable-wrong.
- **Word Break's table has `n + 1` entries.** `dp[i]` describes the prefix of *length* `i`, so the last word before position `i` is `s[j:i]` with `dp[j]` as the prerequisite. Indexing `dp` by character position instead of prefix length is the classic off-by-one.
- **LIS is *strictly* increasing.** In the tails optimization the binary search must find the first tail `>= num` and replace it; using `>` there lets equal values chain and reports `[7,7,7]` as length 3.
- **Rolling variables: use tuple assignment, and get the order right conceptually.** `prev2, prev1 = prev1, max(prev1, prev2 + num)` evaluates the entire right-hand side *before* any assignment happens — Python guarantees this, so there's no need for a temp variable, but it's still worth tracing through once to see why swapping the two sides would corrupt the next iteration in a language without tuple assignment.
- **`@lru_cache` needs hashable arguments.** A `list` argument raises `TypeError: unhashable type: 'list'`; convert to `tuple` first, or just tabulate instead.

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
3. **Base cases.** Conceptually `dp[-1] = 0` and `dp[-2] = 0` — starting both rolling variables at 0 encodes them and handles the empty list for free.
4. **Iteration order.** Left to right over the houses.
5. **Space optimization.** Two rolling variables, same shape as Climbing Stairs — the recurrence reads exactly two states back.

**Complexity.** O(n) time / O(1) space.

### Word Break ★

**Problem.** Given a string `s` and a dictionary `word_dict`, return `True` if `s` can be split into a sequence of one or more dictionary words. Words may be reused any number of times.

**Example.**

    s = "leetcode",  word_dict = ["leet","code"]                    → True
    s = "catsandog", word_dict = ["cats","dog","sand","and","cat"]  → False

**Steps.**
1. **State.** `dp[i]` = `True` iff the prefix `s[0:i]` (length `i`) can be segmented into dictionary words.
2. **Recurrence.** Enumerate the last word: `dp[i]` is true if any split point `j < i` has `dp[j]` true and `s[j:i]` in the dictionary.
3. **Base cases.** `dp[0] = True` — the empty prefix is trivially segmented.
4. **Iteration order.** `i` from 1 to `n`; inner `j` in any order (scanning `j` backward from `i - 1` and breaking on the first hit is a natural micro-optimization).
5. **Space optimization.** None available — `dp[i]` can read any `j` — but bound the inner loop by the longest dictionary word: no word longer than `L` can end at `i`, so only `j >= i - L` matters.
6. Put the dictionary in a `set` first; checking membership in a `list` inside the double loop adds a factor of the dictionary size. The DP is what kills the exponential blowup of naive recursion, which re-segments the same suffix over and over (the `"aaaa...b"` adversarial case).

**Complexity.** O(n · L²) time (n positions × L split points × O(L) slice-and-hash) / O(n) space.

### Coin Change ★

**Problem.** Given coin denominations `coins` (unlimited supply of each) and a target `amount`, return the *fewest* coins that sum exactly to `amount`, or `-1` if it can't be made.

**Example.**

    coins = [1,2,5], amount = 11 → 3    (5+5+1)
    coins = [2],     amount = 3  → -1

**Steps.**
1. **State.** `dp[a]` = fewest coins totaling exactly amount `a`.
2. **Recurrence.** Enumerate the last coin used: `dp[a] = 1 + min(dp[a - c])` over every coin `c <= a`.
3. **Base cases.** `dp[0] = 0`; every other slot starts at `float('inf')` ("not yet reachable" — and `float('inf') + 1` stays `float('inf')`, so unreachable states never contaminate reachable ones).
4. **Iteration order.** `a` ascending from 1 to `amount`; each `dp[a - c]` is already final when read.
5. **Space optimization.** None — the recurrence reaches back by arbitrary coin values, so the O(amount) list is inherent.
6. Return `-1 if dp[amount] == float('inf') else dp[amount]`. Note that greedy fails this problem: with `coins = [1,5,11]` and `amount = 15`, greedy takes 11+1+1+1+1 (5 coins); DP finds 5+5+5 (3).

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
5. **Space/time optimization.** The O(n²) table can be replaced by patience sorting: keep `tails`, where `tails[k]` is the smallest possible tail of any increasing subsequence of length `k + 1`. `tails` is always sorted, so for each number binary-search the first entry `>= num` (Python's `bisect.bisect_left` does exactly this) and overwrite it (or append if none). The answer is `len(tails)` — O(n log n). Note `tails` is *not* an actual subsequence; only its length is meaningful.
6. Why the overwrite is safe: replacing a tail with an equal-length-but-smaller tail never shortens any future subsequence — it only opens more extensions.

**Complexity.** O(n²) time / O(n) space for the table; O(n log n) / O(n) with tails.

## Interview follow-ups

After Climbing Stairs:
- "Steps of 1, 2, or 3?" — `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]`, three rolling variables.
- "n up to 10¹⁸?" — matrix exponentiation on the Fibonacci matrix, O(log n) (fast pow from the Math concept).

After House Robber:
- "Houses in a circle?" (House Robber II) — first and last can't both be robbed: solve the linear problem twice, on `nums[0:-1]` and `nums[1:]`, return the max.
- "Rob with at least `k` houses between hits?" — compare against `dp[i-k-1]` instead of `dp[i-2]`.

After Word Break:
- "Return one valid segmentation / all of them?" (Word Break II) — DFS with memoization on the suffix start index; the boolean DP tells you which branches can succeed.

After Coin Change:
- "Count the *ways* instead of the minimum?" (Coin Change II) — switch `min` to `+`, seed `dp[0] = 1`, and loop **coins outer, amounts inner** so each combination is counted once regardless of order.
- "Why does greedy fail here but work for US coins?" — US denominations form a canonical system; arbitrary ones don't (`[1,5,11]`, 15).

After LIS:
- "Recover the subsequence itself?" — keep a parent-pointer list alongside the table version and walk it back.
- "Longest *non-decreasing*?" — binary-search the first tail `> num` instead of `>= num` (`bisect.bisect_right`).
- "Russian Doll Envelopes?" — sort by width asc, height desc, then LIS on heights.

## The task

Five 1D DP classics. For each: state, recurrence, base cases, order, then code. Match the stated complexity — the O(1)-space versions where noted.

### `climb_stairs(n)`

Count the distinct ways to climb `n` stairs (`n >= 1`) taking 1 or 2 steps at a time. Two sequences are distinct if their step sizes differ at any point. O(n) time, O(1) space.

```python
climb_stairs(1)  # 1
climb_stairs(2)  # 2
climb_stairs(3)  # 3
climb_stairs(5)  # 8
```

Edge cases: `n = 1`, and `n = 45` (the answer, 1836311903, is exact — Python ints don't overflow).

### `rob(nums)`

`nums[i]` is the cash in house `i`; adjacent houses can't both be robbed. Return the maximum total. An empty list yields 0. O(n) time, O(1) space.

```python
rob([1, 2, 3, 1])   # 4
rob([2, 7, 9, 3, 1]) # 12
rob([])              # 0
rob([5])             # 5
```

Edge cases: empty list, single house, two houses (take the larger), the pattern `[2, 1, 1, 2]` → 4 (rob both ends — greedy "take every other house" fails).

### `word_break(s, word_dict)`

Return `True` if `s` can be split entirely into words from `word_dict` (each word usable any number of times), `False` otherwise. The empty string is segmentable (`True`). `word_dict` is a non-empty list of non-empty lowercase words. O(n · L²) time where `L` caps the word length.

```python
word_break("leetcode", ["leet", "code"])                        # True
word_break("applepenapple", ["apple", "pen"])                   # True
word_break("catsandog", ["cats", "dog", "sand", "and", "cat"])  # False
```

Edge cases: empty string (`True`), a word reused many times (`"aaaa"` with `["a"]`), overlapping candidates where the first greedy match dead-ends (`"cars"` with `["car", "ca", "rs"]` → `True`), and long adversarial inputs like `"aaa...ab"` that hang naive recursion.

### `coin_change(coins, amount)`

Return the minimum number of coins from `coins` (unlimited supply of each denomination) summing exactly to `amount`, or `-1` if impossible. `amount >= 0`; all denominations are positive. O(amount × |coins|) time.

```python
coin_change([1, 2, 5], 11)   # 3   (5+5+1)
coin_change([2], 3)          # -1
coin_change([1], 0)          # 0
coin_change([1, 5, 11], 15)  # 3   (5+5+5 — greedy would say 5)
```

Edge cases: `amount = 0` (zero coins), unreachable amounts (`-1`), a denomination larger than `amount`, cases where greedy largest-first is wrong.

### `length_of_lis(nums)`

Return the length of the longest strictly increasing subsequence of `nums` (not necessarily contiguous; empty list → 0). O(n²) is acceptable; O(n log n) with the tails technique is the follow-up standard.

```python
length_of_lis([10, 9, 2, 5, 3, 7, 101, 18])  # 4
length_of_lis([0, 1, 0, 3, 2, 3])            # 4
length_of_lis([7, 7, 7, 7])                  # 1
```

Edge cases: empty list (0), single element (1), all-equal values (1 — strictness), fully descending input (1), fully ascending input (`n`).
