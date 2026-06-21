from __future__ import annotations


class ListNode:
    def __init__(self, val: int = 0, next: ListNode | None = None) -> None:
        self.val = val
        self.next = next

    def __repr__(self) -> str:
        vals: list[int] = []
        curr: ListNode | None = self
        seen: set[int] = set()
        while curr and id(curr) not in seen:
            seen.add(id(curr))
            vals.append(curr.val)
            curr = curr.next
        return "->".join(str(v) for v in vals)


def reverse_list(head: ListNode | None) -> ListNode | None:
    """Reverse the linked list in place. Return the new head."""
    prev: ListNode | None = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev


def has_cycle(head: ListNode | None) -> bool:
    """Return True if the linked list contains a cycle."""
    slow = fast = head
    while fast and fast.next:
        slow = slow.next          # type: ignore[assignment]
        fast = fast.next.next
        if slow is fast:
            return True
    return False


def merge_two_sorted_lists(
    l1: ListNode | None, l2: ListNode | None
) -> ListNode | None:
    """Merge two sorted linked lists and return the head of the merged list."""
    dummy = ListNode(0)
    curr = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next
    curr.next = l1 or l2
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
