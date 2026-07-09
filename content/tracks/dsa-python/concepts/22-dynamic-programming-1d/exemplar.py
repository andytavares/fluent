from bisect import bisect_left


def climb_stairs(n: int) -> int:
    """dp[i] = dp[i-1] + dp[i-2] (last move was 1 or 2 steps); only the
    last two states are read, so two rolling variables replace the table.
    O(n) time, O(1) space.
    """
    prev2 = 1  # dp[i-2], seeded with dp[0] = 1
    prev1 = 1  # dp[i-1], seeded with dp[1] = 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1


def rob(nums: list[int]) -> int:
    """dp[i] = max(skip house i, rob it on top of dp[i-2]). Starting both
    rolling variables at 0 encodes the empty base cases.
    O(n) time, O(1) space.
    """
    prev2, prev1 = 0, 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    return prev1


def word_break(s: str, word_dict: list[str]) -> bool:
    """dp[i] = the length-i prefix is segmentable; enumerate the last word
    s[j:i]. The inner loop is capped by the longest word — no word longer
    than that can end at i.
    O(n * L^2) time, O(n) space.
    """
    words = set(word_dict)
    max_len = max((len(w) for w in word_dict), default=0)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True  # empty prefix
    for i in range(1, n + 1):
        j = i - 1
        while j >= 0 and i - j <= max_len:
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
            j -= 1
    return dp[n]


def coin_change(coins: list[int], amount: int) -> int:
    """dp[a] = 1 + min(dp[a - c]) over coins; float('inf') marks
    "unreachable" and survives the +1 without corrupting comparisons.
    O(amount * len(coins)) time, O(amount) space.
    """
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a and dp[a - coin] + 1 < dp[a]:
                dp[a] = dp[a - coin] + 1
    return -1 if dp[amount] == float("inf") else int(dp[amount])


def length_of_lis(nums: list[int]) -> int:
    """Patience technique: tails[k] is the smallest possible tail of an
    increasing subsequence of length k + 1. tails stays sorted, so each
    number binary-searches the first tail >= it (bisect_left) and
    overwrites (strictness), or appends when it extends everything.
    O(n log n) time, O(n) space.
    """
    tails: list[int] = []
    for num in nums:
        idx = bisect_left(tails, num)
        if idx == len(tails):
            tails.append(num)
        else:
            tails[idx] = num
    return len(tails)


if __name__ == "__main__":
    print(climb_stairs(5))  # 8
    print(rob([2, 7, 9, 3, 1]))  # 12
    print(word_break("leetcode", ["leet", "code"]))  # True
    print(coin_change([1, 2, 5], 11))  # 3
    print(length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]))  # 4
