# Run: python3 exemplar.py
#
# Every tree node is a TreeNode(val, left, right); missing children are
# None. An empty tree is None.


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_depth(root):
    """Return the number of nodes on the longest root-to-leaf path.

    Bottom-up: each call answers for its whole subtree; None anchors at 0.
    O(n) time, O(h) space.
    """
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))


def is_same_tree(p, q):
    """Return True if p and q are structurally identical with equal values.

    Lockstep recursion on a pair of nodes; the None combinations come first,
    and `and` short-circuits on the first mismatch.
    O(min(m, n)) time, O(h) space.
    """
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    return (
        p.val == q.val
        and is_same_tree(p.left, q.left)
        and is_same_tree(p.right, q.right)
    )


def invert_tree(root):
    """Mirror the tree in place (swap every node's children). Return the root.

    One swap per node; tuple assignment avoids the lost-subtree bug.
    O(n) time, O(h) space.
    """
    if root is None:
        return None
    root.left, root.right = root.right, root.left
    invert_tree(root.left)
    invert_tree(root.right)
    return root


def has_path_sum(root, target_sum):
    """Return True if some root-to-leaf path sums exactly to target_sum.

    Top-down: subtract while descending; decide only at a real leaf.
    The None case doubles as "an empty tree has no paths".
    O(n) time, O(h) space.
    """
    if root is None:
        return False
    if root.left is None and root.right is None:
        return target_sum == root.val
    return (
        has_path_sum(root.left, target_sum - root.val)
        or has_path_sum(root.right, target_sum - root.val)
    )


def main():
    def node(val, left=None, right=None):
        return TreeNode(val, left, right)

    t = node(3, node(9), node(20, node(15), node(7)))
    print(max_depth(t))  # 3
    print(is_same_tree(node(1, node(2), node(3)), node(1, node(2), node(3))))  # True
    print(has_path_sum(node(1, node(2), node(3)), 4))  # True (1 -> 3)


if __name__ == "__main__":
    main()
