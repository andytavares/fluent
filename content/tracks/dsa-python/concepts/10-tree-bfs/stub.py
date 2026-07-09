# Run: python3 stub.py
#
# Every tree node is a TreeNode(val, left, right); missing children are
# None. An empty tree is None.


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def level_order(root):
    """Return node values grouped by depth, top to bottom, left to right."""
    # TODO: queue BFS; snapshot len(queue) before draining each level
    # so children pushed mid-level land in the *next* level
    return []


def right_side_view(root):
    """Return the rightmost node value at each depth, top to bottom."""
    # TODO: same level loop; record only the value drained last in each level
    # (not the right spine — a left-subtree node can be visible)
    return []


def zigzag_level_order(root):
    """Return the level order traversal with alternating direction per level."""
    # TODO: enqueue left-then-right at every depth; reverse the collected
    # level list on odd depths (never reorder the queue itself)
    return []


def main():
    def node(val, left=None, right=None):
        return TreeNode(val, left, right)

    root = node(3, node(9), node(20, node(15), node(7)))
    print(level_order(root))        # [[3],[9,20],[15,7]]
    print(right_side_view(root))    # [3,20,7]
    print(zigzag_level_order(root))  # [[3],[20,9],[15,7]]


if __name__ == "__main__":
    main()
