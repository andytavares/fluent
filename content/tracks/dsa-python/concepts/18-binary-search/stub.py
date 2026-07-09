# Run: python3 stub.py


def search_insert(nums: list[int], target: int) -> int:
    """Return the index of target in sorted, distinct nums, or the index
    where it would be inserted to keep nums sorted."""
    # TODO: lower bound — left = 0, right = len(nums), loop while left < right;
    # nums[mid] < target -> left = mid + 1, else right = mid; return left
    return 0


def find_peak_element(nums: list[int]) -> int:
    """Return the index of any peak (strictly greater than both neighbors;
    outside the list counts as -infinity)."""
    # TODO: while left < right, compare nums[mid] with nums[mid + 1];
    # rising slope -> left = mid + 1, falling -> right = mid; return left
    return 0


def search_rotated(nums: list[int], target: int) -> int:
    """Return the index of target in a rotated sorted array of distinct
    values, or -1 if absent."""
    # TODO: exact-match template; nums[left] <= nums[mid] tells you which
    # half is sorted, then range-check target against that half to pick a side
    return -1


def search_range(nums: list[int], target: int) -> list[int]:
    """Return [first, last] indexes of target in a sorted list with
    duplicates, or [-1, -1] if absent."""
    # TODO: lower_bound(target) gives first (verify it actually holds target);
    # lower_bound(target + 1) - 1 gives last
    return [-1, -1]


def main():
    print(search_insert([1, 3, 5, 6], 5))  # 2
    print(search_insert([1, 3, 5, 6], 2))  # 1
    print(find_peak_element([1, 2, 3, 1]))  # 2
    print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))  # 4
    print(search_range([5, 7, 7, 8, 8, 10], 8))  # [3, 4]


if __name__ == "__main__":
    main()
