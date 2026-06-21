def binary_search(nums: list[int], target: int) -> int:
    """Return the index of target in sorted nums, or -1 if not found."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def search_insert_position(nums: list[int], target: int) -> int:
    """Return the index where target is found, or where it would be inserted."""
    lo, hi = 0, len(nums)  # hi = len(nums) allows insert-at-end
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid  # mid may be the answer; don't skip it
    return lo


def find_min_in_rotated_array(nums: list[int]) -> int:
    """Given a rotated sorted array with no duplicates, return the minimum element."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1  # pivot (minimum) is in the right half
        else:
            hi = mid      # minimum is in left half or at mid
    return nums[lo]
