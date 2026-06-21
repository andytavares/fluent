def climbing_stairs(n: int) -> int:
    """Count distinct ways to climb n stairs, taking 1 or 2 steps at a time."""
    # TODO: rolling variables prev2, prev1; each step = prev1 + prev2
    return 0


def rob(nums: list[int]) -> int:
    """Maximum money robbing non-adjacent houses."""
    # TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i]); use rolling variables
    return 0


def coin_change(coins: list[int], amount: int) -> int:
    """Minimum coins to make amount. Return -1 if not possible."""
    # TODO: dp[a] = min over each coin: dp[a - coin] + 1; init dp[0]=0, rest=inf
    return 0


if __name__ == "__main__":
    print(climbing_stairs(2))   # 2
    print(climbing_stairs(3))   # 3
    print(climbing_stairs(5))   # 8
    print(rob([1, 2, 3, 1]))    # 4
    print(rob([2, 7, 9, 3, 1])) # 12
    print(coin_change([1, 2, 5], 11))  # 3
    print(coin_change([2], 3))         # -1
    print(coin_change([1], 0))         # 0
