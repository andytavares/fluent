# Dynamic Programming: 1D

## What you'll learn

How to recognize overlapping subproblems, define a recurrence relation, and reduce exponential brute force to polynomial time. The three problems here cover the three main 1D DP shapes: linear recurrence, skip-adjacent selection, and unbounded knapsack.

## Key concepts

### Pattern 1 — Linear recurrence (Climbing Stairs)

`dp[i] = dp[i-1] + dp[i-2]` — identical to Fibonacci. Space-optimize by keeping only the last two values.

```java
public static int climbingStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

### Pattern 2 — Skip-adjacent selection (House Robber)

At each house, choose: rob it (skip the previous) or skip it (keep the previous max).

```java
public static int rob(int[] nums) {
    if (nums.length == 1) return nums[0];
    int prev2 = nums[0], prev1 = Math.max(nums[0], nums[1]);
    for (int i = 2; i < nums.length; i++) {
        int curr = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

### Pattern 3 — Unbounded knapsack (Coin Change)

Build a dp array where `dp[i]` = minimum coins to make amount `i`. For each amount, try every coin.

```java
public static int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1); // sentinel: larger than any valid answer
    dp[0] = 0;                   // base case: 0 coins needed for amount 0
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}
```

Use `amount + 1` as sentinel instead of `Integer.MAX_VALUE` — adding 1 to `Integer.MAX_VALUE` overflows to a negative number, breaking the `Math.min` comparison.

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `climbingStairs` | O(n) | O(1) | Two variables; no array needed |
| `rob` | O(n) | O(1) | Two variables suffice |
| `coinChange` | O(n · k) | O(n) | n = amount; k = coin count |

## Common variations this pattern solves

1. **Min Cost Climbing Stairs** — `dp[i] = min(dp[i-1], dp[i-2]) + cost[i]`
2. **House Robber II (circular array)** — run rob twice: [0..n-2] and [1..n-1], take max
3. **Word Break** — `dp[i]` = can s[0..i-1] be segmented? Try all word lengths at each end
4. **Longest Increasing Subsequence** — `dp[i]` = LIS ending at i; O(n²) DP or O(n log n) patience sorting

## vs greedy

Coin change cannot be solved greedily — a greedy choice of the largest denomination sometimes leaves a remainder that can't be formed. DP is required. Climbing stairs could be solved with a closed-form formula (golden ratio), but DP is the expected interview approach.

## Watch out

- **`Integer.MAX_VALUE` as sentinel in coinChange**: `dp[i - coin] + 1` when `dp[i - coin] == Integer.MAX_VALUE` overflows to `Integer.MIN_VALUE`. Use `amount + 1` as the sentinel — it's always larger than any valid answer.
- **`dp[0] = 0` base case**: without it, every amount would initialize to the sentinel and never update. The base case is what starts the DP.
- **rob: handle single element before the loop**: `Math.max(nums[0], nums[1])` fails on a single-element array. Check `nums.length == 1` first.
- **climbingStairs n=1 and n=2**: the loop `for (int i = 3; ...)` never executes for small n. Handle with an early return.

## FAANG follow-up questions

> "Can you solve coinChange top-down (memoization)?" — Yes: `memo[amount] = min(memo[amount - coin] + 1)` for each coin. Cache results with an int array initialized to -1 to distinguish uncomputed from impossible.
>
> "What's the difference between 0/1 knapsack and unbounded knapsack?" — 0/1: each item used at most once (`i` iterates left to right; inner loop uses previous row). Unbounded: each item reusable (inner loop within the same row, `dp[i - coin]` already updated).
>
> "How would you do House Robber on a binary tree?" — DFS post-order: at each node return a pair `(rob_this, skip_this)`. `rob_this = node.val + skip_left + skip_right`. `skip_this = max(rob_left, skip_left) + max(rob_right, skip_right)`.
>
> "What if climbingStairs allows 1, 2, or 3 steps?" — Extend recurrence: `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]`. Keep three variables.

## The task

Implement three methods in `Solution`:

```java
// Returns the number of distinct ways to climb n stairs (1 or 2 steps at a time).
// climbingStairs(3) -> 3  (1+1+1, 1+2, 2+1)
public static int climbingStairs(int n)

// Returns the maximum amount you can rob without robbing adjacent houses.
// nums[i] = money in house i
// [2,7,9,3,1] -> 12  (rob 0,2,4: 2+9+1=12)
public static int rob(int[] nums)

// Returns the fewest coins needed to make up amount, or -1 if impossible.
// [1,5,10,25], amount=36 -> 3  (25+10+1)
// [2], amount=3 -> -1
public static int coinChange(int[] coins, int amount)
```
