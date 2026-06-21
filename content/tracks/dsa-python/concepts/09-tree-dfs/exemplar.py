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


def max_depth(root: TreeNode | None) -> int:
    """Return the maximum depth (number of nodes along the longest root-to-leaf path)."""
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))


def has_path_sum(root: TreeNode | None, target: int) -> bool:
    """Return True if any root-to-leaf path sums to target."""
    if root is None:
        return False
    if root.left is None and root.right is None:
        return root.val == target
    remainder = target - root.val
    return has_path_sum(root.left, remainder) or has_path_sum(root.right, remainder)


def lowest_common_ancestor(
    root: TreeNode | None, p: TreeNode, q: TreeNode
) -> TreeNode | None:
    """Return the lowest common ancestor of p and q in the binary tree."""
    if root is None:
        return None
    if root is p or root is q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root          # p and q split across left and right subtrees
    return left or right     # both in same subtree, or not found


def _build(vals: list[int | None]) -> TreeNode | None:
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])  # type: ignore[arg-type]
    queue: deque[TreeNode] = deque([root])
    i = 1
    while queue and i < len(vals):
        node = queue.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])  # type: ignore[arg-type]
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])  # type: ignore[arg-type]
            queue.append(node.right)
        i += 1
    return root
