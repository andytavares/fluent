from __future__ import annotations
from collections import deque


class TreeNode:
    def __init__(
        self,
        val: int = 0,
        left: TreeNode | None = None,
        right: TreeNode | None = None,
    ) -> None:
        self.val = val
        self.left = left
        self.right = right


def level_order(root: TreeNode | None) -> list[list[int]]:
    """Return level-order traversal as a list of lists, one per level."""
    # TODO: deque([root]); snapshot len(queue) before each level; collect then append
    return []


def right_side_view(root: TreeNode | None) -> list[int]:
    """Return values visible from the right side (last node at each level)."""
    # TODO: BFS level by level; record node.val when i == level_size - 1
    return []


def zigzag_level_order(root: TreeNode | None) -> list[list[int]]:
    """Return level-order where odd levels go left-to-right, even go right-to-left."""
    # TODO: same as level_order but toggle direction; reverse the collected level list
    return []


def _build(vals: list) -> TreeNode | None:
    """Build a tree from level-order list (None = missing node)."""
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    q: deque[TreeNode] = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root


if __name__ == "__main__":
    root = _build([3, 9, 20, None, None, 15, 7])
    print(level_order(root))               # [[3], [9, 20], [15, 7]]
    root2 = _build([1, 2, 3, None, 5, None, 4])
    print(right_side_view(root2))          # [1, 3, 4]
    print(zigzag_level_order(root))        # [[3], [20, 9], [15, 7]]
