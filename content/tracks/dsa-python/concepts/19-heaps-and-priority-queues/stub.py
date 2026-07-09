# Run: python3 stub.py
import heapq


def find_kth_largest(nums: list[int], k: int) -> int:
    """Return the k-th largest element of nums (duplicates count separately)."""
    # TODO: maintain a min-heap of the k largest elements seen so far;
    # push each x, pop when len(heap) > k; return heap[0] after the sweep
    return 0


def k_smallest_pairs(nums1: list[int], nums2: list[int], k: int) -> list[list[int]]:
    """Return the k pairs [u, v] (u from nums1, v from nums2) with the
    smallest sums, ordered by sum ascending."""
    # TODO: min-heap of (sum, i, j) triples, seeded with the first column
    # (i, 0) for i in range(min(k, len(nums1))); pop the smallest, emit it,
    # push the row successor (i, j + 1) if it exists
    return []


class MedianFinder:
    """Streaming median via two heaps: a max-heap (negated) for the lower
    half, a min-heap for the upper half."""

    def __init__(self) -> None:
        # TODO: self._low: list[int] = []   (max-heap, values negated)
        # TODO: self._high: list[int] = []  (min-heap, values as-is)
        pass

    def add_num(self, num: int) -> None:
        # TODO: route num into _low or _high, then rebalance so
        # len(_low) == len(_high) or len(_low) == len(_high) + 1
        pass

    def find_median(self) -> float:
        # TODO: odd total -> -_low[0]; even total -> (-_low[0] + _high[0]) / 2
        return 0.0


def main():
    print(find_kth_largest([3, 2, 1, 5, 6, 4], 2))  # 5
    print(k_smallest_pairs([1, 7, 11], [2, 4, 6], 3))  # [[1,2],[1,4],[1,6]]

    mf = MedianFinder()
    mf.add_num(1)
    mf.add_num(2)
    print(mf.find_median())  # 1.5
    mf.add_num(3)
    print(mf.find_median())  # 2


if __name__ == "__main__":
    main()
