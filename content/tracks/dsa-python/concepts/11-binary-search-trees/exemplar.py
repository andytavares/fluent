# Run: python3 exemplar.py
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
    """In-order traversal of a BST is ascending, and the closest pair in a
    sorted sequence is adjacent — so track only the previously visited value
    and fold each in-order gap into the running minimum.
    O(n) time, O(h) stack.
    """
    prev = None
    best = float("inf")

    def walk(node):
        nonlocal prev, best
        if node is None:
            return
        walk(node.left)
        if prev is not None:
            best = min(best, node.val - prev)
        prev = node.val
        walk(node.right)

    walk(root)
    return best


def kth_smallest(root, k):
    """Iterative in-order with early exit: slide down the left spine pushing
    ancestors, pop the next value in sorted order, stop at the k-th pop.
    Nodes past the k-th are never touched.
    O(h + k) time, O(h) stack.
    """
    stack = []
    node = root
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right
    return -1  # unreachable when 1 <= k <= node count


def is_valid_bst(root):
    """Range propagation: every value in a subtree must lie strictly inside
    (lo, hi). Recursing left tightens hi, recursing right tightens lo — that
    is how a violation several levels below an ancestor is still caught.
    The <= / >= comparisons reject duplicates.
    O(n) time, O(h) stack.
    """

    def valid(node, lo, hi):
        if node is None:
            return True
        if node.val <= lo or node.val >= hi:
            return False
        return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)

    return valid(root, float("-inf"), float("inf"))


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
