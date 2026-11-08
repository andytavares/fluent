## What you build

You solve the five most-asked 1D dynamic programming problems with one five-step method: state, recurrence, base cases, iteration order and space optimization. The method lets you derive an answer instead of recalling it. This lesson builds on **Kadane's Algorithm**.

## Key concepts

### Dynamic programming needs two properties

The first property is overlapping subproblems: the same smaller question comes up again and again. The second is optimal substructure: the best answer to the big question comes from best answers to smaller ones. When both hold, you compute each subproblem once. An exponential brute-force recursion then becomes polynomial.

### The five-step method

Do these steps in order, every time. If you skip to code, the solution often comes out wrong in small ways.

1. **State.** Define `dp[i]` in one precise sentence, for example "`dp[i]` is the fewest coins that total amount `i`". If you cannot state it in a sentence, the recurrence will be wrong. "Ending exactly at `i`" and "among the first `i`" are different states with different recurrences.
2. **Recurrence.** Write `dp[i]` in terms of earlier states. List every possible last decision: the final step, house, word or coin that produced state `i`. The cases must cover everything. For counting problems, they must also not overlap.
3. **Base cases.** These are the smallest states with direct answers. Add the sentinel for impossible states: a value larger than any valid answer for minimization, `false` for reachability, `0` for counting.
4. **Iteration order.** Compute every state after the states it reads. In 1D, that is almost always left to right.
5. **Space optimization.** If `dp[i]` reads only the previous `k` states, replace the array with `k` rolling variables. If it can read any earlier state, as in Coin Change, Word Break and LIS, keep the array.

### Memoization and tabulation compute the same values

Top-down memoization is recursion plus a cache, such as a `HashMap<Integer, Integer>`. Bottom-up tabulation fills an array in dependency order. In Java, prefer tabulation. Java has no built-in cache decorator like Python's `functools.lru_cache`. Recursion deeper than a few thousand frames can throw `StackOverflowError`. Tabulation also makes step 5 mechanical, because you see which slots each state reads.

### A Fibonacci-style recurrence needs two variables

`dp[i]` reads the previous two states, so two rolling variables are enough.

```java
public static int climbStairs(int n) {
    // dp[i-2], seeded with dp[0] = 1
    int prev2 = 1;
    // dp[i-1], seeded with dp[1] = 1
    int prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

### A take-or-skip decision also needs two variables

You either use each element, which locks out a neighbor, or skip it.

```java
// dp[i] = max(dp[i-1], dp[i-2] + nums[i])
int prev2 = 0, prev1 = 0;
for (int num : nums) {
    int curr =
        Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = curr;
}
return prev1;
```

### Reaching back over the whole prefix keeps the array

Coin Change and Word Break read any earlier state. So the array stays, and an inner loop tries each possible last piece.

```java
int[] dp = new int[amount + 1];
// sentinel: more than any real answer
Arrays.fill(dp, amount + 1);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (int coin : coins) {
        if (coin <= a)
            dp[a] = Math.min(
                dp[a], dp[a - coin] + 1);
    }
}
return dp[amount] > amount
    ? -1 : dp[amount];
```

### Complexity of the main problems

| Problem | Time | Space | Recurrence shape |
|---------|------|-------|------------------|
| Climbing Stairs | O(n) | O(1) | last two states |
| House Robber | O(n) | O(1) | last two states |
| Word Break | O(n · L²), L = longest word | O(n) | any split point |
| Coin Change | O(amount × \|coins\|) | O(amount) | any last coin |
| Longest Increasing Subsequence | O(n²) table, O(n log n) tails | O(n) | any earlier element |

## Watch out

- An off-by-one base case shifts the whole answer.
- Climbing Stairs needs `dp[0] = 1, dp[1] = 1`: there is one way to stand still.
- Seeding `dp[1] = 1, dp[2] = 1` returns Fibonacci shifted by one for every input.
- In Coin Change, the sentinel is `amount + 1`, and `dp[0] = 0`, not 1.
- `amount + 1` is larger than any real answer. Adding 1 to it still exceeds `amount`, so unreachable states never look reachable.
- Do not use `Integer.MAX_VALUE` as the sentinel. Adding 1 overflows to `Integer.MIN_VALUE`, which wins every `Math.min`.
- The Word Break table has `n + 1` entries. `dp[i]` describes the prefix of length `i`.
- The last word before position `i` is `s.substring(j, i)`, and `dp[j]` must be true.
- Indexing `dp` by character position instead of prefix length is the classic off-by-one.
- LIS is strictly increasing. In the tails version, find the first tail `>= num` and replace it.
- With `>` there, or `tails[mid] <= num`, equal values chain. `[7,7,7]` then reports length 3.
- With rolling variables, compute `curr` from `prev1` and `prev2` before you shift them.
- Swapping the two assignment lines corrupts the next iteration.
- Memoized recursion can overflow the stack. Top-down `climbStairs(10000)` is about 10⁴ frames deep. Tabulate.

## Problem walkthroughs

### Climbing Stairs ★

**Problem.** You climb a staircase of `n` steps, 1 or 2 steps at a time. Return how many distinct step sequences reach the top.

**Example.**

```
n = 2 → 2  (1+1, 2)
n = 3 → 3  (1+1+1, 1+2, 2+1)
```

**Steps.**

1. **State.** `dp[i]` is the number of distinct ways to reach step `i`.
2. **Recurrence.** The last move was a 1-step from `i-1` or a 2-step from `i-2`. Those two sets of sequences do not overlap and cover everything: `dp[i] = dp[i-1] + dp[i-2]`.
3. **Base cases.** `dp[0] = 1`, the empty sequence, and `dp[1] = 1`.
4. **Iteration order.** `i` ascending from 2 to `n`.
5. **Space optimization.** The recurrence reads only the last two states, so use two rolling variables and O(1) space.

The result is the Fibonacci sequence shifted by one. Say that out loud in an interview.

**Complexity.** O(n) time, O(1) space.

### House Robber ★

**Problem.** `nums[i]` is the cash in house `i` on a street. You cannot rob two adjacent houses. Return the maximum total you can rob.

**Example.**

```
[1,2,3,1]   → 4   (houses 0 and 2)
[2,7,9,3,1] → 12  (houses 0, 2, 4)
```

**Steps.**

1. **State.** `dp[i]` is the maximum loot from the first `i + 1` houses. The state does not care whether you robbed house `i`, and that makes it composable.
2. **Recurrence.** At house `i`, either skip it (`dp[i-1]`) or rob it. Robbing it forbids house `i-1`, so it gives `dp[i-2] + nums[i]`. Take the maximum.
3. **Base cases.** Think of `dp[-1] = 0` and `dp[-2] = 0`. Starting both rolling variables at 0 encodes them, and handles the empty array for free.
4. **Iteration order.** Left to right over the houses.
5. **Space optimization.** Use two rolling variables, the same shape as Climbing Stairs. The recurrence reads exactly two states back.

**Complexity.** O(n) time, O(1) space.

### Word Break ★

**Problem.** Given a string `s` and a dictionary `wordDict`, return `true` if you can split `s` into a sequence of one or more dictionary words. You can reuse words any number of times.

**Example.**

```
s = "leetcode"
wordDict = ["leet","code"] → true
s = "catsandog"
wordDict = ["cats","dog","sand",
            "and","cat"] → false
```

**Steps.**

1. **State.** `dp[i]` is `true` if and only if you can split the prefix `s.substring(0, i)`, of length `i`, into dictionary words.
2. **Recurrence.** Try each possible last word. `dp[i]` is true if some split point `j < i` has `dp[j]` true and `s.substring(j, i)` in the dictionary.
3. **Base cases.** `dp[0] = true`: the empty prefix needs no words.
4. **Iteration order.** `i` from 1 to `n`. The inner `j` can go in any order. Scanning `j` backward from `i - 1` and stopping at the first hit is a natural small speedup.
5. **Space optimization.** None, because `dp[i]` can read any `j`. But bound the inner loop by the longest dictionary word `L`. No longer word can end at `i`, so only `j >= i - L` matters.

Put the dictionary in a `HashSet<String>` first. `List.contains` inside the double loop adds a factor of the dictionary size.

The table stops the exponential growth of plain recursion. Plain recursion splits the same suffix again and again, as in the adversarial `"aaaa...b"` case.

**Complexity.** O(n · L²) time: n positions, L split points and O(L) per substring and hash. O(n) space.

### Coin Change ★

**Problem.** Given coin values `coins`, with an unlimited supply of each, and a target `amount`, return the fewest coins that sum exactly to `amount`. Return `-1` if no combination works.

**Example.**

```
coins = [1,2,5], amount = 11
  → 3  (5+5+1)
coins = [2], amount = 3 → -1
```

**Steps.**

1. **State.** `dp[a]` is the fewest coins that total exactly amount `a`.
2. **Recurrence.** Try each possible last coin: `dp[a] = 1 + min(dp[a - c])` over every coin `c <= a`.
3. **Base cases.** `dp[0] = 0`. Every other slot starts at the sentinel `amount + 1`, meaning "not yet reachable". It is larger than any real answer, and `amount + 2` still exceeds `amount`. So unreachable states never affect reachable ones.
4. **Iteration order.** `a` ascending from 1 to `amount`. Each `dp[a - c]` is final when you read it.
5. **Space optimization.** None. The recurrence reaches back by any coin value, so you need the O(amount) array.

Return `dp[amount] > amount ? -1 : dp[amount]`.

Greedy fails this problem. With `coins = [1,5,11]` and `amount = 15`, greedy takes 11+1+1+1+1, 5 coins. Dynamic programming finds 5+5+5, 3 coins.

**Complexity.** O(amount × |coins|) time, O(amount) space.

### Longest Increasing Subsequence ★

**Problem.** Return the length of the longest strictly increasing subsequence of `nums`. The elements keep their relative order, but they do not have to be next to each other.

**Example.**

```
[10,9,2,5,3,7,101,18] → 4
  (2,3,7,101 or 2,5,7,101)
[7,7,7,7] → 1
```

**Steps.**

1. **State.** `dp[i]` is the length of the longest strictly increasing subsequence that ends exactly at index `i`. "Ends exactly at" is essential; without it, you cannot extend.
2. **Recurrence.** Try each possible previous element: `dp[i] = 1 + max(dp[j])` over all `j < i` with `nums[j] < nums[i]`. If no such `j` exists, `dp[i]` is `1`.
3. **Base cases.** Every `dp[i]` starts at 1, the element alone.
4. **Iteration order.** `i` ascending. The answer is `max(dp)`, not `dp[n-1]`, because the LIS can end anywhere.
5. **Time optimization.** Replace the O(n²) table with patience sorting. Keep `tails`, where `tails[k]` is the smallest tail of any increasing subsequence of length `k + 1`.
6. `tails` is always sorted. For each number, binary search the first entry `>= num` and overwrite it, or append if none exists. The answer is the size of `tails`, in O(n log n).

`tails` is not a real subsequence; only its length has meaning. The overwrite is safe: a smaller tail of the same length never shortens a future subsequence. It only allows more extensions.

**Complexity.** O(n²) time and O(n) space for the table. O(n log n) time and O(n) space with tails.

## Interview follow-ups

After Climbing Stairs:

- "Steps of 1, 2 or 3?" Use `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]` with three rolling variables.
- "n up to 10¹⁸?" Use matrix exponentiation on the Fibonacci matrix, O(log n). It uses the fast power from the Math concept.

After House Robber:

- "The houses are in a circle." (House Robber II) You cannot rob both the first and the last house. Solve the linear problem on `nums[0..n-2]` and on `nums[1..n-1]`, and return the maximum.
- "Leave at least `k` houses between robberies." Compare against `dp[i-k-1]` instead of `dp[i-2]`.

After Word Break:

- "Return one valid split, or all of them." (Word Break II) Use DFS with memoization on the suffix start index. The boolean table tells you which branches can succeed.

After Coin Change:

- "Count the ways instead of the minimum." (Coin Change II) Change `min` to `+` and seed `dp[0] = 1`. Loop over coins in the outer loop and amounts in the inner loop, so each combination counts once in any order.
- "Why does greedy fail here but work for US coins?" US coin values form a canonical system. Arbitrary values, such as `[1,5,11]` with 15, do not.

After LIS:

- "Recover the subsequence itself." Keep a parent-pointer array next to the table version, and walk it back.
- "Find the longest non-decreasing subsequence." Binary search the first tail `> num` instead of `>= num`.
- "Russian Doll Envelopes?" Sort by width ascending and height descending, then run LIS on the heights.

## The task

Write five classic 1D dynamic programming functions as static methods of `Solution`. For each, find the state, the recurrence, the base cases and the order, then write the code. Meet each complexity limit, including O(1) space where stated.

### `climbStairs(int n)`

`n >= 1`.

1. Count the distinct ways to climb `n` stairs, 1 or 2 steps at a time.
2. Two sequences are distinct if their step sizes differ at any point.
3. Run in O(n) time and O(1) space.

```java
climbStairs(1); // 1
climbStairs(2); // 2
climbStairs(3); // 3
climbStairs(5); // 8
```

Edge cases:

- `n = 1`.
- `n = 45`: the answer, 1836311903, fits an `int` exactly. You need no overflow handling.

### `rob(int[] nums)`

`nums[i]` is the cash in house `i`. You cannot rob two adjacent houses.

1. Return the maximum total.
2. An empty array gives 0.
3. Run in O(n) time and O(1) space.

```java
rob(new int[]{1, 2, 3, 1}); // 4
rob(new int[]{2, 7, 9, 3, 1}); // 12
rob(new int[]{}); // 0
rob(new int[]{5}); // 5
```

Edge cases:

- An empty array.
- A single house.
- Two houses: take the larger.
- `{2, 1, 1, 2}` gives 4: rob both ends. Greedy "every other house" fails.

### `wordBreak(String s, List<String> wordDict)`

`wordDict` is a non-empty list of non-empty lowercase words.

1. Return `true` if you can split all of `s` into words from `wordDict`. Otherwise, return `false`.
2. You can use each word any number of times.
3. The empty string returns `true`.
4. Run in O(n · L²) time, where `L` is the longest word length.

```java
// true
wordBreak("leetcode",
    List.of("leet", "code"));
// true
wordBreak("applepenapple",
    List.of("apple", "pen"));
// false
wordBreak("catsandog", List.of("cats",
    "dog", "sand", "and", "cat"));
```

Edge cases:

- The empty string: `true`.
- A word reused many times: `"aaaa"` with `["a"]`.
- The first greedy match dead-ends: `"cars"` with `["car", "ca", "rs"]` gives `true`.
- Long adversarial inputs such as `"aaa...ab"` hang plain recursion.

### `coinChange(int[] coins, int amount)`

`amount >= 0`. All coin values are positive.

1. Return the minimum number of coins that sum exactly to `amount`. You have an unlimited supply of each value.
2. Return `-1` if no combination works.
3. Run in O(amount × |coins|) time.

```java
// 3: 5+5+1
coinChange(new int[]{1, 2, 5}, 11);
coinChange(new int[]{2}, 3); // -1
coinChange(new int[]{1}, 0); // 0
// 3: 5+5+5; greedy says 5
coinChange(new int[]{1, 5, 11}, 15);
```

Edge cases:

- `amount = 0`: zero coins.
- Unreachable amounts: `-1`.
- A coin larger than `amount`.
- Cases where greedy largest-first is wrong.

### `lengthOfLIS(int[] nums)`

1. Return the length of the longest strictly increasing subsequence of `nums`.
2. The subsequence does not have to be contiguous.
3. An empty array gives 0.
4. O(n²) passes. O(n log n) with tails is the follow-up standard.

```java
// 4
lengthOfLIS(
    new int[]{10, 9, 2, 5, 3, 7, 101, 18});
// 4
lengthOfLIS(new int[]{0, 1, 0, 3, 2, 3});
lengthOfLIS(new int[]{7, 7, 7, 7}); // 1
```

Edge cases:

- An empty array: 0.
- A single element: 1.
- All-equal values: 1, because the order is strict.
- Fully descending input: 1.
- Fully ascending input: `n`.
