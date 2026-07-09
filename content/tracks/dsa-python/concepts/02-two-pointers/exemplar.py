# Run: python3 exemplar.py


def is_palindrome(s: str) -> bool:
    """Returns True if s is a palindrome, ignoring non-alphanumeric chars and case.
    Skips junk characters with the pointers themselves — no cleaned copy.
    O(n) time, O(1) space."""
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True


def two_sum_ii(numbers: list[int], target: int) -> list[int]:
    """Returns the 1-based indexes [i, j] of the pair summing to target.
    Sorted input makes one comparison per step decisive: a too-small sum can
    only be fixed by advancing left, a too-large one by retreating right.
    O(n) time, O(1) space."""
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left + 1, right + 1]
        if total < target:
            left += 1
        else:
            right -= 1
    return []  # unreachable given the "exactly one solution" guarantee


def container_with_most_water(heights: list[int]) -> int:
    """Returns the maximum water area between any two lines.
    Move the shorter-line pointer inward — the shorter line caps the area of
    every container it could form inside the current window.
    O(n) time, O(1) space."""
    left, right = 0, len(heights) - 1
    max_area = 0
    while left < right:
        area = min(heights[left], heights[right]) * (right - left)
        max_area = max(max_area, area)
        if heights[left] <= heights[right]:
            left += 1
        else:
            right -= 1
    return max_area


def three_sum(nums: list[int]) -> list[list[int]]:
    """Returns all unique triplets of values that sum to zero.
    Sort, fix a pivot, run converging pointers on the rest. Duplicate skips
    at the pivot and both inner pointers guarantee uniqueness without a set.
    O(n^2) time, O(1) auxiliary space (output excluded)."""
    nums = sorted(nums)
    result: list[list[int]] = []

    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # skip duplicate pivots
        if nums[i] > 0:
            break  # three positives can't sum to zero

        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1

    return result


def main() -> None:
    print(is_palindrome("A man, a plan, a canal: Panama"))  # True
    print(two_sum_ii([2, 7, 11, 15], 9))  # [1, 2]
    print(container_with_most_water([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
    print(three_sum([-1, 0, 1, 2, -1, -4]))  # [[-1, -1, 2], [-1, 0, 1]]


if __name__ == "__main__":
    main()
