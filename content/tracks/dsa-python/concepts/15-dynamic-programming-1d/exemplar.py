def climbing_stairs(n: int) -> int:
    """Count distinct ways to climb n stairs, taking 1 or 2 steps at a time."""
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1


def rob(nums: list[int]) -> int:
    """Maximum money robbing non-adjacent houses."""
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    for i in range(2, len(nums)):
        prev2, prev1 = prev1, max(prev1, prev2 + nums[i])
    return prev1


def coin_change(coins: list[int], amount: int) -> int:
    """Minimum coins to make amount. Return -1 if not possible."""
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return int(dp[amount]) if dp[amount] != float('inf') else -1
