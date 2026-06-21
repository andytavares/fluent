from collections import defaultdict


def build_prefix_sum(nums: list[int]) -> list[int]:
    """Return prefix sum array of length len(nums)+1 where prefix[0]=0."""
    # TODO: prefix[i+1] = prefix[i] + nums[i]
    return []


def range_sum(prefix: list[int], i: int, j: int) -> int:
    """Return sum of nums[i..j] inclusive using the prefix sum array."""
    # TODO: prefix[j+1] - prefix[i]
    return 0


def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    """Return count of contiguous subarrays that sum to exactly k."""
    # TODO: use a running prefix sum and a hash map counting occurrences
    return 0


if __name__ == "__main__":
    prefix = build_prefix_sum([1, 2, 3, 4, 5])
    print(prefix)                        # [0, 1, 3, 6, 10, 15]
    print(range_sum(prefix, 1, 3))       # 9
    print(subarray_sum_equals_k([1, 1, 1], 2))    # 2
    print(subarray_sum_equals_k([1, 2, 3], 3))    # 2
