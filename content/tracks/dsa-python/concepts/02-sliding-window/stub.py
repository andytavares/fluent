def longest_unique_substring(s: str) -> int:
    """Return the length of the longest substring without repeating characters."""
    # TODO: variable-size sliding window using a set to track characters in window
    return 0


def max_sum_subarray(nums: list[int], k: int) -> int:
    """Return the maximum sum of any contiguous subarray of exactly k elements."""
    # TODO: seed the first window with sum(nums[:k]), then slide: +new, -oldest
    return 0


def min_window_substring(s: str, t: str) -> str:
    """Return the minimum window substring of s containing all characters of t.
    Return "" if no such window exists."""
    # TODO: use a Counter for t's frequencies and a 'missing' counter;
    #       expand right, shrink left once missing == 0, track best window
    return ""


if __name__ == "__main__":
    print(longest_unique_substring("abcabcbb"))          # 3
    print(longest_unique_substring("bbbbb"))              # 1
    print(max_sum_subarray([2, 1, 5, 1, 3, 2], 3))      # 9
    print(max_sum_subarray([-1, -2, -3, -4], 2))         # -3
    print(min_window_substring("ADOBECODEBANC", "ABC"))  # BANC
    print(min_window_substring("a", "b"))                 # ""
