def is_palindrome(s: str) -> bool:
    """Return True if s reads the same forwards and backwards.
    Ignore non-alphanumeric characters and treat as case-insensitive."""
    lo, hi = 0, len(s) - 1
    while lo < hi:
        while lo < hi and not s[lo].isalnum():
            lo += 1
        while lo < hi and not s[hi].isalnum():
            hi -= 1
        if s[lo].lower() != s[hi].lower():
            return False
        lo += 1
        hi -= 1
    return True


def container_with_most_water(heights: list[int]) -> int:
    """Given heights representing vertical lines, find two lines that form
    the container holding the most water. Return the maximum water volume."""
    lo, hi = 0, len(heights) - 1
    max_water = 0
    while lo < hi:
        water = (hi - lo) * min(heights[lo], heights[hi])
        max_water = max(max_water, water)
        # Moving the taller wall inward cannot improve the area;
        # only moving the shorter wall gives a chance at a taller container.
        if heights[lo] <= heights[hi]:
            lo += 1
        else:
            hi -= 1
    return max_water


def three_sum(nums: list[int]) -> list[list[int]]:
    """Return all unique triplets [a, b, c] such that a + b + c == 0."""
    nums.sort()
    result: list[list[int]] = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # skip duplicate pivots
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                result.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]:
                    lo += 1
                while lo < hi and nums[hi] == nums[hi - 1]:
                    hi -= 1
                lo += 1
                hi -= 1
            elif s < 0:
                lo += 1
            else:
                hi -= 1
    return result
