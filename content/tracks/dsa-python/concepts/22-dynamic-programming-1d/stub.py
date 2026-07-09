def climb_stairs(n: int) -> int:
    """Return the number of distinct ways to climb n stairs,
    taking either 1 or 2 steps at a time."""
    # TODO: dp[i] = dp[i-1] + dp[i-2], dp[0] = dp[1] = 1;
    # roll two variables — O(1) space
    return 0


def rob(nums: list[int]) -> int:
    """Return the maximum amount you can rob from houses without
    robbing two adjacent houses. nums[i] is the value at house i."""
    # TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i]); start both rolling
    # variables at 0 (handles the empty list too)
    return 0


def word_break(s: str, word_dict: list[str]) -> bool:
    """Return True if s can be split entirely into dictionary words."""
    # TODO: dp[i] = some j < i with dp[j] and s[j:i] in the dict;
    # dp[0] = True; use a set; dp has len(s) + 1 entries
    return False


def coin_change(coins: list[int], amount: int) -> int:
    """Return the fewest coins summing exactly to amount, or -1 if impossible."""
    # TODO: dp[a] = 1 + min(dp[a - c]) over coins c <= a; dp[0] = 0,
    # everything else float('inf'); return -1 when dp[amount] stays inf
    return -1


def length_of_lis(nums: list[int]) -> int:
    """Return the length of the longest strictly increasing subsequence."""
    # TODO: dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i],
    # answer = max(dp) — or the O(n log n) tails + binary search version
    return 0


if __name__ == "__main__":
    print(climb_stairs(5))  # 8
    print(rob([2, 7, 9, 3, 1]))  # 12
    print(word_break("leetcode", ["leet", "code"]))  # True
    print(coin_change([1, 2, 5], 11))  # 3
    print(length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]))  # 4
