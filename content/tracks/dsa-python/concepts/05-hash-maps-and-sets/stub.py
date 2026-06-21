from collections import defaultdict


def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    """Return indices (i, j) with i < j where nums[i] + nums[j] == target.
    Return None if no such pair exists."""
    # TODO: store value -> index in a dict; check for complement before storing
    return None


def group_anagrams(words: list[str]) -> list[list[str]]:
    """Group words that are anagrams of each other into sublists."""
    # TODO: use sorted characters as the grouping key; defaultdict(list) as grouper
    return []


def longest_consecutive_sequence(nums: list[int]) -> int:
    """Return the length of the longest consecutive integer sequence in nums."""
    # TODO: build a set of all nums; for each sequence start (n-1 not in set),
    #       count the run length forward
    return 0


if __name__ == "__main__":
    print(two_sum([2, 7, 11, 15], 9))    # (0, 1)
    print(two_sum([3, 2, 4], 6))         # (1, 2)
    print(two_sum([1, 2, 3], 10))        # None
    print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
    print(longest_consecutive_sequence([100, 4, 200, 1, 3, 2]))  # 4
    print(longest_consecutive_sequence([]))                        # 0
