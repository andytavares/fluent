def is_palindrome(s: str) -> bool:
    """Return True if s reads the same forwards and backwards.
    Ignore non-alphanumeric characters and treat as case-insensitive."""
    # TODO: use two pointers converging from both ends, skipping non-alnum chars
    return False


def container_with_most_water(heights: list[int]) -> int:
    """Given heights representing vertical lines, find two lines that form
    the container holding the most water. Return the maximum water volume."""
    # TODO: start with widest container, greedily move the shorter pointer inward
    return 0


def three_sum(nums: list[int]) -> list[list[int]]:
    """Return all unique triplets [a, b, c] such that a + b + c == 0.
    The result must not contain duplicate triplets."""
    # TODO: sort, then for each pivot use two pointers; skip duplicate pivots and values
    return []


if __name__ == "__main__":
    print(is_palindrome("A man, a plan, a canal: Panama"))  # True
    print(is_palindrome("race a car"))                       # False
    print(container_with_most_water([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
    print(container_with_most_water([1, 1]))                         # 1
    print(three_sum([-1, 0, 1, 2, -1, -4]))  # [[-1,-1,2],[-1,0,1]]
    print(three_sum([0, 0, 0]))              # [[0,0,0]]
