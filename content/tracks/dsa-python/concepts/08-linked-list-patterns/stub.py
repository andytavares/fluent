# Run: python3 stub.py
#
# Every list node is a small ListNode object; next is None at the tail.
# An empty list is None.



class ListNode:
    def __init__(self, val: int = 0, next: "ListNode | None" = None) -> None:
        self.val = val
        self.next = next


def has_cycle(head: "ListNode | None") -> bool:
    """Returns True if the list contains a cycle."""
    # TODO: Floyd's fast/slow — slow moves 1, fast moves 2
    # loop while fast is not None and fast.next is not None; compare node identity
    return False


def add_two_numbers(l1: ListNode, l2: ListNode) -> "ListNode | None":
    """Adds two numbers stored as reverse-order digit lists (head = ones digit).
    Returns the sum in the same format."""
    # TODO: dummy head + carry; loop while l1 or l2 or carry
    # digit = total % 10, carry = total // 10
    return None


def merge_two_lists(list1: "ListNode | None", list2: "ListNode | None") -> "ListNode | None":
    """Merges two sorted lists by splicing the existing nodes. Returns the head."""
    # TODO: dummy head + tail; attach the smaller head each step,
    # then attach the leftover list; return dummy.next
    return None


def reverse_between(head: "ListNode | None", left: int, right: int) -> "ListNode | None":
    """Reverses positions left..right (1-indexed) in place. Returns the head."""
    # TODO: dummy head; walk prev to position left-1; front-insert the node
    # after start, right-left times; return dummy.next
    return None


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
