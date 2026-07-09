# Run: python3 exemplar.py


def merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
    """Merges sorted nums2 into sorted nums1 in place, filling from the back
    so writes never clobber unread nums1 values (k stays >= i).
    O(m + n) time, O(1) space."""
    i = m - 1
    j = n - 1
    k = m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1
    # Remaining nums1 prefix (if any) is already sorted and in place.


def remove_duplicates(nums: list[int]) -> int:
    """Removes duplicates from a sorted list in place with a write pointer.
    Duplicates are adjacent in sorted input, so comparing against the last
    kept value is sufficient. O(n) time, O(1) space."""
    write = 0
    for read in range(len(nums)):
        if write == 0 or nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write


def majority_element(nums: list[int]) -> int:
    """Boyer-Moore voting: pair each candidate occurrence against a
    non-candidate occurrence and cancel; the true majority (> n/2) can never
    be fully cancelled, so it is the final candidate.
    O(n) time, O(1) space."""
    candidate = nums[0]
    count = 0
    for x in nums:
        if count == 0:
            candidate = x
            count = 1
        elif x == candidate:
            count += 1
        else:
            count -= 1
    return candidate


def _reverse_range(nums: list[int], lo: int, hi: int) -> None:
    """Reverses nums[lo:hi+1] in place."""
    while lo < hi:
        nums[lo], nums[hi] = nums[hi], nums[lo]
        lo += 1
        hi -= 1


def rotate(nums: list[int], k: int) -> None:
    """Rotates right by k via three reversals: a right-rotation moves the
    last k elements to the front as a block; reversing everything puts the
    block in front backwards, then two partial reversals fix each block's
    order. O(n) time, O(1) space."""
    n = len(nums)
    if n == 0:
        return
    k %= n
    if k == 0:
        return
    _reverse_range(nums, 0, n - 1)
    _reverse_range(nums, 0, k - 1)
    _reverse_range(nums, k, n - 1)


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
