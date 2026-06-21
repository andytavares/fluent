from collections import defaultdict


def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    """Return indices (i, j) with i < j where nums[i] + nums[j] == target."""
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        complement = target - x
        if complement in seen:
            return (seen[complement], i)
        seen[x] = i
    return None


def group_anagrams(words: list[str]) -> list[list[str]]:
    """Group words that are anagrams of each other into sublists."""
    groups: dict[str, list[str]] = defaultdict(list)
    for word in words:
        key = "".join(sorted(word))
        groups[key].append(word)
    return list(groups.values())


def longest_consecutive_sequence(nums: list[int]) -> int:
    """Return the length of the longest consecutive integer sequence in nums."""
    num_set = set(nums)
    best = 0
    for n in num_set:
        if n - 1 not in num_set:       # n is the start of a new sequence
            length = 1
            while n + length in num_set:
                length += 1
            best = max(best, length)
    return best
