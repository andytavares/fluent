# Every list node is a small ListNode object; next is None at the tail.
# An empty list is None.



class ListNode:
    def __init__(self, val: int = 0, next: "ListNode | None" = None) -> None:
        self.val = val
        self.next = next


def has_cycle(head: "ListNode | None") -> bool:
    return False


def add_two_numbers(l1: ListNode, l2: ListNode) -> "ListNode | None":
    return None


def merge_two_lists(list1: "ListNode | None", list2: "ListNode | None") -> "ListNode | None":
    return None


def reverse_between(head: "ListNode | None", left: int, right: int) -> "ListNode | None":
    return None


def list_from(vals: list[int]) -> "ListNode | None":
    dummy = ListNode(0)
    tail = dummy
    for v in vals:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next


def to_list(head: "ListNode | None") -> list[int]:
    out = []
    node = head
    while node is not None:
        out.append(node.val)
        node = node.next
    return out
