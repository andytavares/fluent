# Run: python3 stub.py
#
# Every tree node is a TreeNode(val, left, right); missing children are
# None. An empty tree is None.
# BST invariant: for every node, ALL left-subtree values < node.val < ALL
# right-subtree values (strict -- duplicates are invalid).


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def get_minimum_difference(root):
    """Return the smallest absolute difference between any two node values."""
    # TODO: in-order traversal with a prev tracker -- the closest pair in a
    # sorted sequence is adjacent, so compare each value only to prev
    return 0


def kth_smallest(root, k):
    """Return the k-th smallest value in the BST (k is 1-indexed)."""
    # TODO: iterative in-order with an explicit stack; slide left, pop,
    # decrement k -- return the popped value when k hits 0 (early exit)
    return 0


def is_valid_bst(root):
    """Return True if the tree satisfies the BST invariant."""
    # TODO: propagate (lo, hi) bounds -- left tightens hi, right tightens lo;
    # checking only parent vs child misses violations against an ancestor
    return False


def main():
    def node(val, left=None, right=None):
        return TreeNode(val, left, right)

    bst = node(4, node(2, node(1), node(3)), node(6))
    print(get_minimum_difference(bst))  # 1
    print(kth_smallest(bst, 3))  # 3
    print(is_valid_bst(bst))  # True
    print(is_valid_bst(node(5, node(1), node(4, node(3), node(6)))))  # False


if __name__ == "__main__":
    main()
