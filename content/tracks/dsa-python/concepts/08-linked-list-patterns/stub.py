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
    # TODO: track prev, curr, next_node; rewire curr.next = prev each iteration
    return None


def has_cycle(head: ListNode | None) -> bool:
    """Return True if the linked list contains a cycle."""
    # TODO: Floyd's: slow moves 1 step, fast moves 2; they meet if there's a cycle
    return False


def merge_two_sorted_lists(
    l1: ListNode | None, l2: ListNode | None
) -> ListNode | None:
    """Merge two sorted linked lists and return the head of the merged list."""
    # TODO: use a dummy head; advance whichever list has the smaller current value;
    #       attach the remaining non-empty list at the end
    return None


def _make_list(vals: list[int]) -> ListNode | None:
    """Helper: build a linked list from a list of values."""
    if not vals:
        return None
    head = ListNode(vals[0])
    curr = head
    for v in vals[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head


if __name__ == "__main__":
    head = _make_list([1, 2, 3, 4, 5])
    print(reverse_list(head))                            # 5->4->3->2->1
    print(has_cycle(_make_list([1, 2, 3])))             # False
    l1 = _make_list([1, 2, 4])
    l2 = _make_list([1, 3, 4])
    print(merge_two_sorted_lists(l1, l2))               # 1->1->2->3->4->4
