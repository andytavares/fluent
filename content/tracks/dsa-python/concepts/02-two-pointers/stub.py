# Run: python3 stub.py


def is_palindrome(s: str) -> bool:
    """Returns True if s is a palindrome, ignoring non-alphanumeric chars and case."""
    # TODO: converging pointers; skip non-alphanumeric chars in place
    # (re-check left < right inside the skip loops)
    return False


def two_sum_ii(numbers: list[int], target: int) -> list[int]:
    """Returns the 1-based indexes [i, j] (i < j) of the two elements that sum
    to target. numbers is sorted ascending; exactly one solution exists."""
    # TODO: converging pointers; sum too small -> left += 1, too big -> right -= 1
    # remember the +1 for 1-based indexes
    return []


def container_with_most_water(heights: list[int]) -> int:
    """Returns the maximum water area between any two lines."""
    # TODO: converging pointers; always move the shorter-line pointer inward
    return 0


def three_sum(nums: list[int]) -> list[list[int]]:
    """Returns all unique triplets of values that sum to zero."""
    # TODO: sort numerically, fix pivot i, then converging pointers for the pair
    # skip duplicate pivots (i > 0 and nums[i] == nums[i-1]) and inner duplicates
    return []


def main() -> None:
    print(is_palindrome("A man, a plan, a canal: Panama"))  # True
    print(two_sum_ii([2, 7, 11, 15], 9))  # [1, 2]
    print(container_with_most_water([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
    print(three_sum([-1, 0, 1, 2, -1, -4]))  # [[-1, -1, 2], [-1, 0, 1]]


if __name__ == "__main__":
    main()
