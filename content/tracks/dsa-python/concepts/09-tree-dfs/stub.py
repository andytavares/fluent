# Run: python3 stub.py
#
# Every tree node is a TreeNode(val, left, right); missing children are
# None. An empty tree is None.


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_depth(root):
    """Return the number of nodes on the longest root-to-leaf path."""
    # TODO: bottom-up — None is 0; otherwise 1 + max of the children's depths
    return 0


def is_same_tree(p, q):
    """Return True if p and q are structurally identical with equal values."""
    # TODO: lockstep — both None true; one None false; compare vals,
    # then recurse on (p.left, q.left) and (p.right, q.right)
    return False


def invert_tree(root):
    """Mirror the tree in place (swap every node's children). Return the root."""
    # TODO: swap root.left and root.right (tuple assignment), recurse into
    # both, return root
    return None


def has_path_sum(root, target_sum):
    """Return True if some root-to-leaf path sums exactly to target_sum."""
    # TODO: top-down — None is False; at a leaf (no children) compare
    # target_sum == root.val; otherwise recurse with target_sum - root.val
    return False


def main():
    def node(val, left=None, right=None):
        return TreeNode(val, left, right)

    t = node(3, node(9), node(20, node(15), node(7)))
    print(max_depth(t))  # 3
    print(is_same_tree(node(1, node(2), node(3)), node(1, node(2), node(3))))  # True
    print(has_path_sum(node(1, node(2), node(3)), 4))  # True (1 -> 3)


if __name__ == "__main__":
    main()
