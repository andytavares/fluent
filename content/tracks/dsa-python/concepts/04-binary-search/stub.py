def binary_search(nums: list[int], target: int) -> int:
    """Return the index of target in sorted nums, or -1 if not found."""
    # TODO: maintain lo/hi with lo <= hi; compute mid; narrow each iteration
    return -1


def search_insert_position(nums: list[int], target: int) -> int:
    """Return the index where target is found, or where it would be inserted."""
    # TODO: lo < hi variant; hi starts at len(nums); lo converges to answer
    return 0


def find_min_in_rotated_array(nums: list[int]) -> int:
    """Given a rotated sorted array with no duplicates, return the minimum element."""
    # TODO: compare nums[mid] to nums[hi] to decide which half holds the minimum
    return 0


if __name__ == "__main__":
    print(binary_search([1, 3, 5, 7, 9], 5))           # 2
    print(binary_search([1, 3, 5, 7, 9], 4))           # -1
    print(search_insert_position([1, 3, 5, 6], 2))     # 1
    print(search_insert_position([1, 3, 5, 6], 7))     # 4
    print(find_min_in_rotated_array([3, 4, 5, 1, 2]))  # 1
    print(find_min_in_rotated_array([1]))               # 1
