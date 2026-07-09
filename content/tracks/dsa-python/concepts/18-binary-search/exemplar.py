# Run: python3 exemplar.py


def _lower_bound(nums: list[int], target: int) -> int:
    """First index with nums[i] >= target. Half-open interval [left, right);
    right = mid keeps a candidate answer in range, left = mid + 1 discards
    indexes that are provably too small.
    O(log n) time, O(1) space.
    """
    left, right = 0, len(nums)
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left


def search_insert(nums: list[int], target: int) -> int:
    """Return the index of target in sorted, distinct nums, or its
    insertion point. The lower bound answers both cases at once: if target
    exists, the first index >= target IS its index.
    O(log n) time, O(1) space.
    """
    return _lower_bound(nums, target)


def find_peak_element(nums: list[int]) -> int:
    """Return the index of any peak. One neighbor comparison is the
    monotonic predicate: a rising slope at mid guarantees a peak strictly
    to the right (the array ends at a -infinity wall), a falling slope
    keeps mid in play.
    O(log n) time, O(1) space.
    """
    left, right = 0, len(nums) - 1
    while left < right:
        mid = left + (right - left) // 2  # mid < right, so mid + 1 is in bounds
        if nums[mid] < nums[mid + 1]:
            left = mid + 1
        else:
            right = mid
    return left


def search_rotated(nums: list[int], target: int) -> int:
    """Return the index of target in a rotated sorted array of distinct
    values, or -1. Split anywhere and at least one half is sorted; an O(1)
    range test against the sorted half decides which side to keep.
    O(log n) time, O(1) space.
    """
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[left] <= nums[mid]:
            # Left half [left..mid] is sorted (<= handles the left == mid window).
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            # Right half [mid..right] is sorted.
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1


def search_range(nums: list[int], target: int) -> list[int]:
    """Return [first, last] occurrence indexes of target, or [-1, -1]. Two
    lower bounds: the first >= target, and the first >= target + 1 minus
    one — no linear expansion, so all-duplicate arrays stay logarithmic.
    O(log n) time, O(1) space.
    """
    first = _lower_bound(nums, target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    last = _lower_bound(nums, target + 1) - 1
    return [first, last]


def main():
    print(search_insert([1, 3, 5, 6], 5))  # 2
    print(search_insert([1, 3, 5, 6], 2))  # 1
    print(find_peak_element([1, 2, 3, 1]))  # 2
    print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))  # 4
    print(search_range([5, 7, 7, 8, 8, 10], 8))  # [3, 4]


if __name__ == "__main__":
    main()
