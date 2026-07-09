# Run: python3 exemplar.py
import heapq


def find_kth_largest(nums: list[int], k: int) -> int:
    """Keep a min-heap of the k largest elements seen so far; its root is
    the smallest of the k largest, i.e. the k-th largest overall.
    O(n log k) time, O(k) space.
    """
    heap: list[int] = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]


def k_smallest_pairs(nums1: list[int], nums2: list[int], k: int) -> list[list[int]]:
    """Best-first expansion over the m x n grid of index pairs, without
    materializing it. Seed the first column, then from each popped cell
    push only its row successor — every cell has exactly one path into the
    heap, so no visited-set is needed.
    O(k log k) time, O(min(k, m)) space.
    """
    if not nums1 or not nums2 or k <= 0:
        return []

    heap: list[tuple[int, int, int]] = []
    for i in range(min(k, len(nums1))):
        heapq.heappush(heap, (nums1[i] + nums2[0], i, 0))

    result: list[list[int]] = []
    while heap and len(result) < k:
        _, i, j = heapq.heappop(heap)
        result.append([nums1[i], nums2[j]])
        if j + 1 < len(nums2):
            heapq.heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
    return result


class MedianFinder:
    """Two heaps: _low is a max-heap (values negated) holding the smaller
    half, _high is a min-heap holding the larger half. len(_low) is always
    equal to or exactly one more than len(_high), and every _low element
    is <= every _high element.
    O(log n) per add_num, O(1) per find_median, O(n) space.
    """

    def __init__(self) -> None:
        self._low: list[int] = []   # max-heap, values negated
        self._high: list[int] = []  # min-heap, values as-is

    def add_num(self, num: int) -> None:
        if not self._low or num <= -self._low[0]:
            heapq.heappush(self._low, -num)
        else:
            heapq.heappush(self._high, num)

        # Rebalance: _low may lead by at most one element.
        if len(self._low) > len(self._high) + 1:
            heapq.heappush(self._high, -heapq.heappop(self._low))
        elif len(self._high) > len(self._low):
            heapq.heappush(self._low, -heapq.heappop(self._high))

    def find_median(self) -> float:
        if len(self._low) > len(self._high):
            return float(-self._low[0])
        return (-self._low[0] + self._high[0]) / 2


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
