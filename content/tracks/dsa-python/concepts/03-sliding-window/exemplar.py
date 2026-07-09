from collections import Counter


def longest_unique_substring(s: str) -> int:
    """Return the length of the longest substring without repeating characters."""
    seen: set[str] = set()
    left = best = 0
    for right in range(len(s)):
        while s[right] in seen:
            seen.remove(s[left])
            left += 1
        seen.add(s[right])
        best = max(best, right - left + 1)
    return best


def max_sum_subarray(nums: list[int], k: int) -> int:
    """Return the maximum sum of any contiguous subarray of exactly k elements."""
    if len(nums) < k:
        return 0
    window_sum = sum(nums[:k])
    best = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        best = max(best, window_sum)
    return best


def min_window_substring(s: str, t: str) -> str:
    """Return the minimum window substring of s containing all characters of t."""
    if not t or not s:
        return ""
    need: Counter[str] = Counter(t)
    missing = len(t)
    best_start = best_len = 0
    found_start = -1
    left = 0

    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1

        if missing == 0:
            # Shrink from left past any surplus characters
            while need[s[left]] < 0:
                need[s[left]] += 1
                left += 1
            window_len = right - left + 1
            if found_start == -1 or window_len < best_len:
                best_start, best_len = left, window_len
                found_start = left
            # Invalidate window and continue searching
            need[s[left]] += 1
            missing += 1
            left += 1

    return s[best_start : best_start + best_len] if found_start != -1 else ""
