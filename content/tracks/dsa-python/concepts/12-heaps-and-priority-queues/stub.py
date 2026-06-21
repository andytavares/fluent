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
        """Push val onto the heap."""
        # TODO: heapq.heappush
        pass

    def pop(self) -> int:
        """Remove and return the minimum element."""
        # TODO: heapq.heappop
        return 0

    def peek(self) -> int:
        """Return the minimum element without removing it."""
        # TODO: return self._data[0]
        return 0

    def __len__(self) -> int:
        return len(self._data)


def k_largest_elements(nums: list[int], k: int) -> list[int]:
    """Return the k largest elements in any order."""
    # TODO: maintain a min-heap of size k; pop when len exceeds k
    return []


def merge_k_sorted_lists(lists: list[ListNode | None]) -> ListNode | None:
    """Merge k sorted linked lists into one sorted list."""
    # TODO: seed heap with (node.val, i, node) for each list head;
    #       pop min, append to result, push node.next if exists;
    #       use (val, i, node) tuple to avoid comparing ListNode objects
    return None


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


if __name__ == "__main__":
    h = MinHeap()
    h.push(5); h.push(3); h.push(8)
    print(h.peek())   # 3
    print(h.pop())    # 3
    print(h.peek())   # 5
    print(len(h))     # 2
    print(sorted(k_largest_elements([3, 2, 1, 5, 6, 4], 2)))  # [5, 6]
    lists = [_make_list([1, 4, 5]), _make_list([1, 3, 4]), _make_list([2, 6])]
    print(_to_vals(merge_k_sorted_lists(lists)))  # [1,1,2,3,4,4,5,6]
