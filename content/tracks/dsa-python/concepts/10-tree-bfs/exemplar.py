# Run: python3 exemplar.py
#
# Every tree node is a TreeNode(val, left, right); missing children are
# None. An empty tree is None.

from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def level_order(root):
    """Level order traversal via BFS with a deque.

    The level_size snapshot marks the boundary: children pushed while
    draining land at the back of the deque, so they always belong to the
    next level.
    O(n) time, O(w) space where w is the widest level.
    """
    if root is None:
        return []
    result = []
    queue = deque([root])
    while queue:
        level_size = len(queue)  # snapshot: exactly one level
        level = []
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result


def right_side_view(root):
    """Rightmost node per level: same level loop, but only the last node
    drained from each level is recorded. Enqueue order is left-to-right, so
    the last node of a level is its rightmost — even when it lives in a
    left subtree.
    O(n) time, O(w) space.
    """
    if root is None:
        return []
    result = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i == level_size - 1:  # last of this level
                result.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return result


def zigzag_level_order(root):
    """Zigzag is a presentation change, not a traversal change: children are
    always enqueued left-then-right, and only the collected level list is
    reversed on odd depths.
    O(n) time, O(w) space.
    """
    if root is None:
        return []
    result = []
    queue = deque([root])
    left_to_right = True
    while queue:
        level_size = len(queue)
        level = []
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level if left_to_right else level[::-1])
        left_to_right = not left_to_right
    return result


def main():
    def node(val, left=None, right=None):
        return TreeNode(val, left, right)

    root = node(3, node(9), node(20, node(15), node(7)))
    print(level_order(root))        # [[3],[9,20],[15,7]]
    print(right_side_view(root))    # [3,20,7]
    print(zigzag_level_order(root))  # [[3],[20,9],[15,7]]


if __name__ == "__main__":
    main()
