# Run: python3 stub.py


def merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
    """Merges sorted nums2 into sorted nums1 in place.
    nums1 has length m + n; its last n slots are placeholders.
    Mutates nums1 — the return value is ignored."""
    # TODO: three indexes from the back (i = m-1, j = n-1, k = m+n-1);
    # place the larger of nums1[i]/nums2[j] at k until nums2 is exhausted


def remove_duplicates(nums: list[int]) -> int:
    """Removes duplicates from a sorted list in place.
    Returns k — nums[0:k] holds the distinct values in order."""
    # TODO: write pointer; keep nums[read] when write == 0
    # or nums[read] != nums[write - 1]
    return 0


def majority_element(nums: list[int]) -> int:
    """Returns the element appearing more than len(nums) // 2 times.
    A majority element is guaranteed to exist."""
    # TODO: Boyer-Moore voting — adopt a candidate when count hits 0,
    # increment on match, decrement on mismatch
    return 0


def rotate(nums: list[int], k: int) -> None:
    """Rotates the list right by k steps, in place.
    k >= 0, may exceed len(nums). Mutates nums — the return value is ignored."""
    # TODO: k %= len(nums), then three reversals:
    # whole list, first k elements, remaining n - k elements


def main() -> None:
    nums1 = [1, 2, 3, 0, 0, 0]
    merge(nums1, 3, [2, 5, 6], 3)
    print(nums1)  # [1, 2, 2, 3, 5, 6]

    dedup = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
    k = remove_duplicates(dedup)
    print(k, dedup[:k])  # 5 [0, 1, 2, 3, 4]

    print(majority_element([2, 2, 1, 1, 1, 2, 2]))  # 2

    rot = [1, 2, 3, 4, 5, 6, 7]
    rotate(rot, 3)
    print(rot)  # [5, 6, 7, 1, 2, 3, 4]


if __name__ == "__main__":
    main()
