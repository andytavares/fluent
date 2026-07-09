# Run: python3 exemplar.py

from collections import Counter


def min_sub_array_len(target: int, nums: list[int]) -> int:
    """Returns the length of the shortest contiguous subarray with sum >= target,
    or 0 if none exists. Shrink-while-valid: positives make the sum monotone,
    so once the window goes invalid only expanding right can revive it.
    O(n) time, O(1) space."""
    left = 0
    total = 0
    best = float("inf")
    for right in range(len(nums)):
        total += nums[right]
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else int(best)


def length_of_longest_substring(s: str) -> int:
    """Returns the length of the longest substring without repeating characters.
    Grow-then-repair: a last-seen-index dict turns the repair into a single
    left-jump; the >= left guard ignores stale entries behind the window.
    O(n) time, O(min(n, alphabet)) space."""
    last_seen: dict[str, int] = {}  # char -> index of latest occurrence
    left = 0
    best = 0
    for right, c in enumerate(s):
        if c in last_seen and last_seen[c] >= left:
            left = last_seen[c] + 1  # jump past the in-window duplicate
        last_seen[c] = right
        best = max(best, right - left + 1)
    return best


def min_window(s: str, t: str) -> str:
    """Returns the shortest substring of s containing every character of t
    (duplicates included), or "" if no such window exists.
    need/window/formed machinery: formed counts distinct characters at their
    required frequency, making the validity check O(1) per move.
    O(|s| + |t|) time, O(alphabet of t) space."""
    if len(t) == 0 or len(t) > len(s):
        return ""

    need = Counter(t)  # char -> required count
    window: dict[str, int] = {}  # char -> count inside the window
    formed = 0  # distinct chars currently at required frequency
    left = 0
    best_len = float("inf")
    best_start = 0

    for right, c in enumerate(s):
        if c in need:
            window[c] = window.get(c, 0) + 1
            if window[c] == need[c]:
                formed += 1

        while formed == len(need):
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_start = left
            out = s[left]
            left += 1
            if out in need:
                window[out] -= 1
                if window[out] < need[out]:
                    formed -= 1

    return "" if best_len == float("inf") else s[best_start : best_start + int(best_len)]


def main() -> None:
    print(min_sub_array_len(7, [2, 3, 1, 2, 4, 3]))  # 2
    print(length_of_longest_substring("abcabcbb"))  # 3
    print(min_window("ADOBECODEBANC", "ABC"))  # "BANC"


if __name__ == "__main__":
    main()
