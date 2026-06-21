# Dynamic Programming: 1D

## What you'll learn

How to identify overlapping subproblems, define a `dp[i]` recurrence, handle base cases, and optimize space from O(n) to O(1) when the recurrence only looks back a fixed number of steps. You'll implement `climbingStairs` (Fibonacci-style), `rob` (skip-one recurrence), and `coinChange` (unbounded knapsack).

## Key concepts

### The DP framework

1. **Define the subproblem**: what does `dp[i]` represent?
2. **Write the recurrence**: how does `dp[i]` depend on smaller subproblems?
3. **Base cases**: what are the smallest valid `dp[i]` values?
4. **Iteration order**: compute smaller subproblems first.
5. **Space optimization**: if the recurrence only reads `dp[i-1]` and `dp[i-2]`, you only need two variables.

### Fibonacci-style — Climbing Stairs

```typescript
function climbingStairs(n: number): number {
  // dp[i] = ways to reach step i
  // dp[1] = 1, dp[2] = 2
  // dp[i] = dp[i-1] + dp[i-2]  (arrive from one step below or two below)
  if (n <= 2) return n;
  let prev2 = 1; // dp[i-2]
  let prev1 = 2; // dp[i-1]
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
// Time: O(n)  Space: O(1)
```

### Skip-one recurrence — House Robber

At each house, you either skip it (take `dp[i-1]`) or rob it (take `dp[i-2] + nums[i]`).

```typescript
function rob(nums: number[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  let prev2 = nums[0];                     // dp[0]
  let prev1 = Math.max(nums[0], nums[1]);  // dp[1]

  for (let i = 2; i < nums.length; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
// Time: O(n)  Space: O(1)
```

### Unbounded knapsack — Coin Change

`dp[i]` = minimum coins to make amount `i`. For each amount, try every coin: if using this coin makes a better solution, update `dp[i]`.

```typescript
function coinChange(coins: number[], amount: number): number {
  // Infinity signals "impossible"; dp[0] = 0 coins to make 0
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
// Time: O(amount × coins.length)  Space: O(amount)
```

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `climbingStairs` | O(n) | O(1) | Two-variable rolling window |
| `rob` | O(n) | O(1) | Two-variable rolling window |
| `coinChange` | O(amount · C) | O(amount) | C = number of coin denominations |

## Common variations

- **House Robber II (circular)** — run `rob` twice: once on `nums[0..n-2]` and once on `nums[1..n-1]`; take the max
- **Word Break** — `dp[i] = true` if any word in the dictionary ends at `i` and `dp[i-word.length]` is also true
- **Longest Increasing Subsequence** — O(n²) DP or O(n log n) patience sort
- **Decode Ways** — count ways to decode a digit string; handle leading zeros as impossible

## vs top-down memoization

Bottom-up DP (filling a table iteratively) avoids recursion stack overhead and is often faster in practice. Top-down memoization (recursion + cache) is sometimes clearer to write first. Both are O(n × subproblem-size).

In TypeScript, a `Map<number, number>` works as a memoization cache. For `coinChange`, the bottom-up approach is idiomatic and avoids the risk of stack overflow for large amounts.

## Watch out

- **`dp[1] = Math.max(nums[0], nums[1])`**: for house robber with two houses, the answer is the max of the two (you pick the better one, not both). Writing `dp[1] = nums[1]` forgets the case where `nums[0] > nums[1]`.
- **Seeding `dp` with `Infinity` vs `-1`**: `Infinity` works well with `Math.min`; `-1` does not. Only convert to `-1` at the final return, not during computation.
- **Coin change with large amount**: `amount` can be up to 10,000 in LeetCode; `dp` has 10,001 entries. Don't fill `new Array(amount + 1)` with 0 — that's the wrong initial value (0 would mean "zero coins needed" for every amount).
- **`coin <= i` guard**: prevents accessing `dp[i - coin]` with a negative index, which would return `undefined` in JS and give wrong results.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you solve House Robber on a circular array?" (Two passes: rob `nums[0..n-2]` and `nums[1..n-1]` separately. Return the max. This handles the case where the first and last houses are adjacent.)
> - "Can you do `coinChange` with memoization instead of bottom-up?" (Yes — `memo(amount) = 1 + min(memo(amount - coin))`. But you risk stack overflow for large amounts without TCO.)
> - "What if coins have limited quantities (0/1 knapsack)?" (Change the inner loop order: for 0/1 knapsack, iterate amounts from high to low so each coin is used at most once.)
> - "How would you count the number of ways to make the amount (not minimize coins)?" (`dp[i] += dp[i - coin]` instead of `Math.min`. This is the "combination sum IV" problem.)

## The task

Implement three functions:

```typescript
// Return the number of distinct ways to climb n stairs (1 or 2 steps at a time).
// n=1 → 1,  n=2 → 2,  n=3 → 3,  n=5 → 8
function climbingStairs(n: number): number

// Return the maximum amount you can rob from houses in a line
// without robbing two adjacent houses.
// [1,2,3,1] → 4  (house 0 + house 2)
// [2,7,9,3,1] → 12  (house 0 + house 2 + house 4)
function rob(nums: number[]): number

// Return the fewest coins needed to make up amount using unlimited coins.
// Return -1 if it's impossible.
// coins=[1,5,11], amount=15 → 3  (5+5+5)
// coins=[2], amount=3       → -1
function coinChange(coins: number[], amount: number): number
```
