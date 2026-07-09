# Run: python3 exemplar.py


def max_sub_array(nums: list[int]) -> int:
    """Kadane's algorithm: ending_here is the best sum of a subarray ending
    exactly at the current element — extend the previous run or start
    fresh, whichever is larger (fresh wins exactly when the run went
    negative). best folds the optimum over all endpoints. Seeding with
    nums[0] (not 0) keeps the subarray non-empty on all-negative input.
    O(n) time, O(1) space.
    """
    ending_here = nums[0]
    best = nums[0]
    for num in nums[1:]:
        ending_here = max(num, ending_here + num)
        best = max(best, ending_here)
    return best


def max_subarray_sum_circular(nums: list[int]) -> int:
    """Circular variant: the answer either doesn't wrap (plain Kadane) or
    wraps — and a wrapping subarray is the complement of a contiguous
    middle, so its best sum is total - min_kadane. All four quantities
    come from one pass. Guard: if every element is negative
    (max_kadane < 0), the "wrap" would be the empty subarray — return the
    plain Kadane answer.
    O(n) time, O(1) space.
    """
    max_ending_here = nums[0]
    max_kadane = nums[0]
    min_ending_here = nums[0]
    min_kadane = nums[0]
    total = nums[0]
    for num in nums[1:]:
        max_ending_here = max(num, max_ending_here + num)
        max_kadane = max(max_kadane, max_ending_here)
        min_ending_here = min(num, min_ending_here + num)
        min_kadane = min(min_kadane, min_ending_here)
        total += num
    if max_kadane < 0:
        return max_kadane  # all negative — a wrap would be empty
    return max(max_kadane, total - min_kadane)


def main():
    print(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # 6
    print(max_sub_array([-3, -1, -2]))                     # -1

    print(max_subarray_sum_circular([1, -2, 3, -2]))  # 3
    print(max_subarray_sum_circular([5, -3, 5]))      # 10
    print(max_subarray_sum_circular([-3, -2, -3]))    # -2


if __name__ == "__main__":
    main()
