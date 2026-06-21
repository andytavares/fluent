from __future__ import annotations
import heapq


class ListNode:
    def __init__(self, val: int = 0, next: ListNode | None = None) -> None:
        self.val = val
        self.next = next


class MinHeap:
    """A min-heap backed by heapq."""

    def __init__(self) -> None:
        self._data: list[int] = []

    def push(self, val: int) -> None:
        heapq.heappush(self._data, val)

    def pop(self) -> int:
        return heapq.heappop(self._data)

    def peek(self) -> int:
        return self._data[0]

    def __len__(self) -> int:
        return len(self._data)


def k_largest_elements(nums: list[int], k: int) -> list[int]:
    """Return the k largest elements in any order."""
    heap: list[int] = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap


def merge_k_sorted_lists(lists: list[ListNode | None]) -> ListNode | None:
    """Merge k sorted linked lists into one sorted list."""
    dummy = ListNode(0)
    curr = dummy
    heap: list[tuple[int, int, ListNode]] = []

    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))

    return dummy.next


def _make_list(vals: list[int]) -> ListNode | None:
    if not vals:
        return None
    head = ListNode(vals[0])
    curr = head
    for v in vals[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head


def _to_vals(head: ListNode | None) -> list[int]:
    result: list[int] = []
    while head:
        result.append(head.val)
        head = head.next
    return result
