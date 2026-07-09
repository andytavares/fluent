# Run: python3 stub.py


def min_sub_array_len(target: int, nums: list[int]) -> int:
    """Returns the length of the shortest contiguous subarray with sum >= target,
    or 0 if none exists. nums contains only positive integers."""
    # TODO: expand right, adding nums[right] to a running total;
    # while total >= target, record right - left + 1 and shrink from the left
    return 0


def length_of_longest_substring(s: str) -> int:
    """Returns the length of the longest substring without repeating characters."""
    # TODO: dict of char -> last-seen index; on a duplicate at index >= left,
    # jump left past it (the >= left guard stops backwards moves — "abba")
    return 0


def min_window(s: str, t: str) -> str:
    """Returns the shortest substring of s containing every character of t
    (duplicates included), or "" if no such window exists."""
    # TODO: need dict from t (Counter); expand right updating window counts and
    # a formed counter (formed += 1 only when a count reaches its requirement);
    # while formed == len(need), record the window and shrink from the left;
    # track best_start/best_len and slice once at the end
    return ""


def main() -> None:
    print(min_sub_array_len(7, [2, 3, 1, 2, 4, 3]))  # 2
    print(length_of_longest_substring("abcabcbb"))  # 3
    print(min_window("ADOBECODEBANC", "ABC"))  # "BANC"


if __name__ == "__main__":
    main()
