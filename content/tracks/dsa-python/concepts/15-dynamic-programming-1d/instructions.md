# Dynamic Programming: 1D

## What you'll learn

The two DP formulations (top-down vs bottom-up), how to identify the recurrence relation, and when space optimization collapses a full DP table to rolling variables — applied to climbing stairs, house robber, and coin change.

## Key concepts

DP solves problems with **overlapping subproblems** by storing results. Two equivalent approaches:

- **Top-down (memoization):** recurse naturally, cache results. Use `@functools.lru_cache` or a `dict`.
- **Bottom-up (tabulation):** fill a table iteratively from base cases up.

For 1D DP, the state is a single integer (index, amount, etc.).

### Climbing stairs — Fibonacci recurrence

How many ways to climb `n` stairs taking 1 or 2 steps? `ways(n) = ways(n-1) + ways(n-2)`.

```python
def climbing_stairs(n: int) -> int:
    if n <= 2:
        return n
    prev2, prev1 = 1, 2           # ways(1)=1, ways(2)=2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```

Only the last two values are needed — O(1) space rolling variables instead of O(n) array.

### House Robber — max non-adjacent subarray

```python
def rob(nums: list[int]) -> int:
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    for i in range(2, len(nums)):
        prev2, prev1 = prev1, max(prev1, prev2 + nums[i])
    return prev1
```

Recurrence: `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`. Skip a house or rob it and add the best we could do two houses back.

### Coin Change — unbounded knapsack

Minimum coins to make `amount`. Every coin denomination can be used unlimited times.

```python
def coin_change(coins: list[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0                      # 0 coins to make amount 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return int(dp[amount]) if dp[amount] != float('inf') else -1
```

**Build-up:** `dp[a]` = min coins to make exactly `a`. For each amount, try every coin and take the best. `float('inf')` as sentinel for "unreachable."

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Climbing stairs | O(n) | O(1) rolling |
| House robber | O(n) | O(1) rolling |
| Coin change | O(amount · len(coins)) | O(amount) |

## Common variations

- **Climbing Stairs with k steps** — `dp[i] = sum(dp[i-j] for j in 1..k)`; needs an O(k) window
- **House Robber II** — circular arrangement; solve twice: `[0..n-2]` and `[1..n-1]`, take max
- **Coin Change II** — count distinct combinations (not minimum count); different DP formulation
- **Word Break** — can string be segmented using a dictionary; `dp[i] = any(dp[j] and s[j:i] in dict)`

## vs other approaches

Climbing stairs with pure recursion is O(2^n) — exponential. Memoization brings it to O(n). The rolling-variables bottom-up approach is O(n) time, O(1) space. The same pattern applies to house robber.

Coin change by greedy (always pick the largest coin) **does not work** in general — it fails for `coins=[1,5,11], amount=15` (greedy gives `11+1+1+1+1 = 5 coins`; DP gives `5+5+5 = 3 coins`).

## Watch out

- **`dp[0] = 0` must be set before the coin change loop** — it's the base case. Without it, all amounts are unreachable.
- **`float('inf')` as sentinel:** Python correctly computes `min(float('inf'), finite_int + 1) = finite_int + 1`. Returning `float('inf')` from `dp[amount]` means the amount is unreachable → return -1.
- **Rolling variables in house robber:** `prev2, prev1 = prev1, max(prev1, prev2 + nums[i])` — both sides evaluate before assignment. This is a Python parallel assignment — no temp variable needed.
- **`@lru_cache` and mutable arguments:** `lru_cache` requires hashable arguments. A `list` argument won't work; convert to `tuple` first.

## FAANG follow-up questions

> "How would you memoize `climbing_stairs` top-down?" — `@functools.lru_cache(maxsize=None)` on a recursive function `def climb(n)`. The cache stores results for each `n`.

> "Can `coin_change` be solved with BFS?" — Yes: treat amounts as graph nodes, coins as edges. BFS from 0 gives the shortest path (minimum coins) to `amount`. Same O(amount · coins) complexity, but higher constant due to queue overhead.

> "What's the difference between Coin Change (minimum coins) and Coin Change II (number of ways)?" — In Coin Change II, the inner loop order matters: iterate coins in the outer loop to avoid counting permutations as distinct combinations.

## The task

```python
def climbing_stairs(n: int) -> int:
    """Return the number of distinct ways to climb n stairs,
    taking either 1 or 2 steps at a time."""

def rob(nums: list[int]) -> int:
    """Return the maximum amount you can rob from houses without
    robbing two adjacent houses. nums[i] is the value at house i."""

def coin_change(coins: list[int], amount: int) -> int:
    """Return the minimum number of coins to make up amount.
    Coins can be reused. Return -1 if it's not possible."""
```

**Examples:**
- `climbing_stairs(2)` → `2`, `climbing_stairs(3)` → `3`, `climbing_stairs(5)` → `8`
- `rob([1,2,3,1])` → `4`, `rob([2,7,9,3,1])` → `12`
- `coin_change([1,2,5], 11)` → `3`
- `coin_change([2], 3)` → `-1`
- `coin_change([1], 0)` → `0`
- `coin_change([1,5,11], 15)` → `3` (5+5+5, not 11+1+1+1+1)
