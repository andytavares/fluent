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
    return 0


def kth_smallest(root, k):
    return 0


def is_valid_bst(root):
    return False
