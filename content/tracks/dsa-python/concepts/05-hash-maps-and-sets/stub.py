# Run: python3 stub.py


def is_anagram(s: str, t: str) -> bool:
    """Returns True if t is an anagram of s (same characters, same multiplicities)."""
    # TODO: lengths must match; count up over s, count down over t —
    # a missing/zero count during the count-down means False
    return False


def group_anagrams(strs: list[str]) -> list[list[str]]:
    """Groups anagrams together. Group order and order within groups don't matter."""
    # TODO: dict keyed by each string's canonical form ("".join(sorted(s)));
    # append into the bucket, return list(groups.values())
    return []


def two_sum(nums: list[int], target: int) -> list[int]:
    """Returns the 0-based indexes [i, j] (i < j) of the two positions summing to
    target. Exactly one solution exists."""
    # TODO: dict value -> index; check the complement BEFORE inserting nums[i]
    return []


def longest_consecutive(nums: list[int]) -> int:
    """Returns the length of the longest run of consecutive integer values."""
    # TODO: set of all values; only count upward from run starts
    # (values with no n - 1 in the set) to stay O(n)
    return 0


def main() -> None:
    print(is_anagram("anagram", "nagaram"))  # True
    print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
    # [["eat","tea","ate"],["tan","nat"],["bat"]] (any order)
    print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
    print(longest_consecutive([100, 4, 200, 1, 3, 2]))  # 4


if __name__ == "__main__":
    main()
