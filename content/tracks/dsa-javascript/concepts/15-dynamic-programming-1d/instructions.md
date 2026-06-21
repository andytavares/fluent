# Dynamic Programming: 1D

## What you'll learn

How to identify DP problems, define state recurrences, and optimize from O(n) array space to O(1) rolling variables — covering the three most common 1D DP patterns in FAANG interviews.

## Key concepts

DP applies when: (1) there are overlapping subproblems and (2) the problem has optimal substructure. The two approaches: **memoization** (top-down recursion + cache) vs **tabulation** (bottom-up array). Bottom-up eliminates call stack overhead and makes space optimization obvious.

### Climbing stairs — linear Fibonacci recurrence

```
dp[i] = dp[i-1] + dp[i-2]
```

Why: to reach stair `i`, you came from `i-1` (1 step) or `i-2` (2 steps). Space-optimize to two variables:

```js
function climbingStairs(n) {
  if (n <= 1) return 1;
  let prev2 = 1, prev1 = 1; // dp[0], dp[1]
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

### House robber — skip-one recurrence

```
dp[i] = max(dp[i-1], dp[i-2] + nums[i])
```

Either skip house `i` (keep `dp[i-1]`) or rob it (can't rob `i-1`, so use `dp[i-2] + nums[i]`).

```js
function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    const curr = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

### Coin change — unbounded knapsack

```
dp[i] = min over coins of (dp[i - coin] + 1)   if coin <= i
```

Fill `dp` from 0 to `amount`. Infinity means "not achievable."

```js
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // base: 0 coins for amount 0
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

## Time and space complexity

| Problem | Time | Space (table) | Space (optimized) |
|---------|------|---------------|-------------------|
| climbingStairs | O(n) | O(n) | O(1) |
| rob | O(n) | O(n) | O(1) |
| coinChange | O(amount × \|coins\|) | O(amount) | — |

Brute force recursion: O(2^n) for climbing stairs, exponential for coin change. DP collapses this to polynomial.

## Common variations

- **House Robber II** (LC 213) — circular street; solve twice: rob [0..n-2] and [1..n-1], take max
- **Decode Ways** (LC 91) — Fibonacci-like DP on a digit string; each step can take 1 or 2 digits
- **Perfect squares** (LC 279) — same as coin change with coins = [1, 4, 9, 16, ...]
- **Word break** (LC 139) — `dp[i] = any j where dp[j] && word in dict`

## vs other languages

Python's `functools.lru_cache` makes memoization trivial. JavaScript has no such built-in — you use a `Map` or an array as a manual cache. The table-based approach shown here is idiomatic in any language.

## FAANG follow-up questions

After climbingStairs:
- "What if you can take 1, 2, or 3 steps?" (extend to `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]`; still O(n) O(1))
- "What's the relationship to Fibonacci?" (identical — climbingStairs(n) = Fibonacci(n+1))

After rob:
- "What if the houses are arranged in a circle?" (House Robber II — solve the linear problem twice: once for [0..n-2], once for [1..n-1]; return max)
- "What if you can skip up to k consecutive houses?" (sliding window DP; harder variant)

After coinChange:
- "What's the difference between this and the 0/1 knapsack?" (coin change allows unlimited uses of each coin; 0/1 knapsack allows at most one of each item — different inner loop order)
- "How do you count the number of ways (not minimum coins)?" (LC 518 — change `min` to `sum`, initialize `dp[0]=1`)

## Watch out

- **climbingStairs base case**: `n=0` should return 1 (one way to stay at ground) and `n=1` should return 1. Off-by-one here causes the whole Fibonacci sequence to shift.
- **rob empty array**: guard against `nums.length === 0`; return 0.
- **coinChange Infinity sentinel**: `dp[amount] === Infinity` means no solution — return `-1`. Using `Number.MAX_VALUE` instead of `Infinity` risks overflow when you add 1.
- **coinChange loop order**: outer loop over amounts, inner over coins. The reverse would give wrong results for the unbounded knapsack (each amount must be reachable using any number of coins).

## The task

### `climbingStairs(n)`

Count the distinct ways to climb `n` stairs taking 1 or 2 steps.

```js
climbingStairs(1) // 1
climbingStairs(2) // 2
climbingStairs(5) // 8
```

### `rob(nums)`

Maximum money robbed from houses without robbing adjacent ones.

```js
rob([1, 2, 3, 1]) // 4
rob([2, 7, 9, 3, 1]) // 12
rob([0]) // 0
```

### `coinChange(coins, amount)`

Minimum coins to make `amount`. Return `-1` if impossible.

```js
coinChange([1, 5, 11], 15) // 3
coinChange([2], 3)         // -1
coinChange([1], 0)         // 0
coinChange([1, 2, 5], 11)  // 3
```
