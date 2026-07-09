# Run: python3 exemplar.py

from collections import Counter, defaultdict


def is_anagram(s: str, t: str) -> bool:
    """Returns True if t is an anagram of s (same characters, same multiplicities).
    Count up over s, count down over t; with equal lengths, "never goes
    negative" implies every count ends at exactly zero.
    O(n) time, O(k) space for the alphabet used."""
    if len(s) != len(t):
        return False
    counts = Counter(s)
    for c in t:
        n = counts.get(c, 0)
        if not n:
            return False  # missing or already zero
        counts[c] = n - 1
    return True


def group_anagrams(strs: list[str]) -> list[list[str]]:
    """Groups anagrams by canonical key: the sorted string. Anagrams — and only
    anagrams — share a key, so each bucket is exactly one group.
    O(n · k log k) time, O(n · k) space."""
    groups: dict[str, list[str]] = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))
        groups[key].append(s)
    return list(groups.values())


def two_sum(nums: list[int], target: int) -> list[int]:
    """Returns the 0-based indexes [i, j] (i < j) of the pair summing to target.
    Check the complement before inserting the current value — that's what
    prevents pairing an element with itself while allowing duplicates.
    O(n) time, O(n) space."""
    seen: dict[int, int] = {}  # value -> index
    for i, x in enumerate(nums):
        complement = target - x
        if complement in seen:
            return [seen[complement], i]
        seen[x] = i
    return []  # unreachable given the "exactly one solution" guarantee


def longest_consecutive(nums: list[int]) -> int:
    """Returns the length of the longest run of consecutive integer values.
    The run-start guard (skip n when n - 1 is present) means each run is
    walked exactly once from its unique start — that's the O(n) proof.
    O(n) time, O(n) space."""
    values = set(nums)
    best = 0
    for n in values:
        if n - 1 in values:
            continue  # mid-run — its start will count it
        length = 1
        while n + length in values:
            length += 1
        best = max(best, length)
    return best


def main() -> None:
    print(is_anagram("anagram", "nagaram"))  # True
    print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
    # [["eat","tea","ate"],["tan","nat"],["bat"]] (any order)
    print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
    print(longest_consecutive([100, 4, 200, 1, 3, 2]))  # 4


if __name__ == "__main__":
    main()
