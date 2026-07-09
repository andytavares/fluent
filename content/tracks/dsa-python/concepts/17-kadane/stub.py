# Run: python3 stub.py


def max_sub_array(nums: list[int]) -> int:
    """Return the largest sum of any contiguous non-empty subarray."""
    # TODO: Kadane — ending_here = max(num, ending_here + num);
    # fold into best each step. Seed BOTH with nums[0], not 0
    # (all-negative arrays!)
    return 0


def max_subarray_sum_circular(nums: list[int]) -> int:
    """Return the largest sum of any non-empty subarray of the CIRCULAR
    array (may wrap past the end; each element used at most once)."""
    # TODO: one pass computing max_kadane, min_kadane (same recurrence with
    # min), and total; wrap answer = total - min_kadane.
    # Guard: if max_kadane < 0 (all negative) the wrap would be empty —
    # return max_kadane directly
    return 0


def main():
    print(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # 6
    print(max_sub_array([-3, -1, -2]))                     # -1

    print(max_subarray_sum_circular([1, -2, 3, -2]))  # 3
    print(max_subarray_sum_circular([5, -3, 5]))      # 10
    print(max_subarray_sum_circular([-3, -2, -3]))    # -2


if __name__ == "__main__":
    main()
