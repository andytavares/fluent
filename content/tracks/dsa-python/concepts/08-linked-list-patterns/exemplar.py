# Run: python3 exemplar.py
#
# Every list node is a small ListNode object; next is None at the tail.
# An empty list is None.



class ListNode:
    def __init__(self, val: int = 0, next: "ListNode | None" = None) -> None:
        self.val = val
        self.next = next


def has_cycle(head: "ListNode | None") -> bool:
    """Returns True if the list contains a cycle.
    Floyd's fast/slow: fast gains one node per step inside a cycle, so the
    pointers must meet; if fast reaches None, the list terminates.
    O(n) time, O(1) space."""
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True  # identity, never value comparison
    return False


def add_two_numbers(l1: "ListNode | None", l2: "ListNode | None") -> "ListNode | None":
    """Adds two numbers stored as reverse-order digit lists (head = ones digit).
    Reverse order means the walk adds digits exactly as carries propagate.
    The `or carry` in the loop condition emits the final carry digit.
    O(max(m, n)) time, O(1) space beyond the output."""
    dummy = ListNode(0)
    tail = dummy
    carry = 0
    while l1 is not None or l2 is not None or carry != 0:
        total = (l1.val if l1 is not None else 0) + (l2.val if l2 is not None else 0) + carry
        tail.next = ListNode(total % 10)
        tail = tail.next
        carry = total // 10
        if l1 is not None:
            l1 = l1.next
        if l2 is not None:
            l2 = l2.next
    return dummy.next


def merge_two_lists(list1: "ListNode | None", list2: "ListNode | None") -> "ListNode | None":
    """Merges two sorted lists by splicing the existing nodes. Returns the head.
    The dummy head absorbs the "which list starts the result?" question, and
    attaching the leftover list whole avoids walking it.
    O(m + n) time, O(1) space."""
    dummy = ListNode(0)
    tail = dummy
    while list1 is not None and list2 is not None:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 if list1 is not None else list2
    return dummy.next


def reverse_between(head: "ListNode | None", left: int, right: int) -> "ListNode | None":
    """Reverses positions left..right (1-indexed) in place. Returns the head.
    Front-insertion: anchor prev before the window, then move the node after
    `start` to the window's front, right-left times — the window ends up
    reversed and already spliced.
    O(n) time, O(1) space, one pass."""
    dummy = ListNode(0, head)
    prev = dummy
    for _ in range(left - 1):
        prev = prev.next

    start = prev.next  # becomes the window's tail
    for _ in range(right - left):
        move = start.next
        start.next = move.next
        move.next = prev.next
        prev.next = move
    return dummy.next


def list_from(vals: list[int]) -> "ListNode | None":
    """Builds a linked list from a list of values."""
    dummy = ListNode(0)
    tail = dummy
    for v in vals:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next


def to_list(head: "ListNode | None") -> list[int]:
    """Reads a linked list back into a Python list."""
    out = []
    node = head
    while node is not None:
        out.append(node.val)
        node = node.next
    return out


def main() -> None:
    cyclic = list_from([3, 2, 0, -4])
    node = cyclic
    while node.next is not None:
        node = node.next
    node.next = cyclic.next  # -4 loops back to 2
    print(has_cycle(cyclic))  # True

    print(to_list(add_two_numbers(list_from([2, 4, 3]), list_from([5, 6, 4]))))  # [7, 0, 8]
    print(to_list(merge_two_lists(list_from([1, 2, 4]), list_from([1, 3, 4]))))  # [1, 1, 2, 3, 4, 4]
    print(to_list(reverse_between(list_from([1, 2, 3, 4, 5]), 2, 4)))  # [1, 4, 3, 2, 5]


if __name__ == "__main__":
    main()
