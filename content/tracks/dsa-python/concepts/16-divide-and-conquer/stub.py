# Run: python3 stub.py
#
# Node representations:
#   binary tree node: TreeNode(val, left, right)  (absent children are None)
#   linked list node: ListNode(val, next)         (last node's next is None)


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def sorted_array_to_bst(nums):
    """Build a height-balanced BST from a sorted list of distinct integers."""
    # TODO: recurse on inclusive index bounds (lo, hi) -- NOT on slices;
    # base case lo > hi -> None; mid = (lo + hi) // 2 becomes the root,
    # left = build(lo, mid - 1), right = build(mid + 1, hi)
    return None


def sort_list(head):
    """Sort a linked list ascending in O(n log n), relinking existing nodes."""
    # TODO: merge sort -- base case 0 or 1 nodes;
    # split with slow = head, fast = head.next (fast head start!),
    # cut with slow.next = None, recurse on both halves, then merge
    # with a dummy head + tail pointer
    return None


def merge_k_lists(lists):
    """Merge k sorted linked lists into one sorted list in O(N log k),
    reusing the existing nodes."""
    # TODO: pairwise rounds -- while more than one list remains, merge
    # lists[i] with lists[i+1] (odd one passes through); reuse the same
    # two-list merge as sort_list
    return None


def from_list(values):
    head = None
    tail = None
    for v in values:
        node = ListNode(v)
        if head is None:
            head = node
        else:
            tail.next = node
        tail = node
    return head


def to_list(head):
    out = []
    node = head
    while node is not None:
        out.append(node.val)
        node = node.next
    return out


def main():
    print(sorted_array_to_bst([1, 2, 3]))

    print(to_list(sort_list(from_list([4, 2, 1, 3]))))
    # [1, 2, 3, 4]

    lists = [from_list([1, 4, 5]), from_list([1, 3, 4]), from_list([2, 6])]
    print(to_list(merge_k_lists(lists)))
    # [1, 1, 2, 3, 4, 4, 5, 6]


if __name__ == "__main__":
    main()
