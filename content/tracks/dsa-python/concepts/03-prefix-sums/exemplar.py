from collections import defaultdict


def build_prefix_sum(nums: list[int]) -> list[int]:
    """Return prefix sum array of length len(nums)+1 where prefix[0]=0."""
    prefix = [0] * (len(nums) + 1)
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    return prefix


def range_sum(prefix: list[int], i: int, j: int) -> int:
    """Return sum of nums[i..j] inclusive using the prefix sum array."""
    return prefix[j + 1] - prefix[i]


def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    """Return count of contiguous subarrays that sum to exactly k."""
    counts: dict[int, int] = defaultdict(int)
    counts[0] = 1
    total = 0
    prefix = 0
    for x in nums:
        prefix += x
        total += counts[prefix - k]
        counts[prefix] += 1
    return total
