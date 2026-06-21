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
    if root is None:
        return []
    result: list[list[int]] = []
    queue: deque[TreeNode] = deque([root])
    while queue:
        level_size = len(queue)
        level: list[int] = []
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result


def right_side_view(root: TreeNode | None) -> list[int]:
    """Return values visible from the right side (last node at each level)."""
    if root is None:
        return []
    result: list[int] = []
    queue: deque[TreeNode] = deque([root])
    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i == level_size - 1:
                result.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return result


def zigzag_level_order(root: TreeNode | None) -> list[list[int]]:
    """Return level-order where odd levels go left-to-right, even go right-to-left."""
    if root is None:
        return []
    result: list[list[int]] = []
    queue: deque[TreeNode] = deque([root])
    left_to_right = True
    while queue:
        level_size = len(queue)
        level: list[int] = []
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


def _build(vals: list) -> TreeNode | None:
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
