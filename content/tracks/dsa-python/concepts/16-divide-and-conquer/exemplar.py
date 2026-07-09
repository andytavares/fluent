# Run: python3 exemplar.py
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
    """Builds a height-balanced BST by making the middle element the root and
    recursing on the halves: sortedness gives the BST property for free, and
    halving bounds the subtree height difference by 1 at every node.
    Recursing on index bounds (not slices) keeps it O(n).
    O(n) time, O(log n) recursion depth.
    """

    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi))

    return build(0, len(nums) - 1)


def merge_two(a, b):
    """Merges two sorted lists by relinking existing nodes: dummy head + tail
    pointer, always appending the smaller front node, then splicing the
    leftover run. Handles None inputs naturally. O(|a| + |b|) time.
    """
    dummy = ListNode()
    tail = dummy
    while a is not None and b is not None:
        if a.val <= b.val:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a if a is not None else b
    return dummy.next


def sort_list(head):
    """Merge sort on a linked list: fast/slow split (fast starts at head.next
    so a 2-node list splits 1 + 1), CUT the list so the halves are
    independent, recurse, then merge. Only pointers move -- no nodes are
    allocated.
    O(n log n) time, O(log n) recursion stack.
    """
    if head is None or head.next is None:
        return head

    slow = head
    fast = head.next
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    mid = slow.next
    slow.next = None  # cut -- without this the recursion never shrinks

    return merge_two(sort_list(head), sort_list(mid))


def merge_k_lists(lists):
    """Merges k sorted lists by pairwise rounds: each round halves the list
    count, and every node is touched once per round -> O(N log k) total,
    versus O(N*k) for sequential folding.
    O(N log k) time, O(1) extra space beyond the round lists.
    """
    if len(lists) == 0:
        return None
    current = lists
    while len(current) > 1:
        merged = []
        for i in range(0, len(current), 2):
            if i + 1 < len(current):
                merged.append(merge_two(current[i], current[i + 1]))
            else:
                merged.append(current[i])
        current = merged
    return current[0]


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
