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


def is_valid_bst(root: TreeNode | None) -> bool:
    """Return True if the tree satisfies the BST property for all nodes."""
    def validate(node: TreeNode | None, lo: float, hi: float) -> bool:
        if node is None:
            return True
        if not (lo < node.val < hi):
            return False
        return (validate(node.left, lo, node.val) and
                validate(node.right, node.val, hi))
    return validate(root, float('-inf'), float('inf'))


def kth_smallest(root: TreeNode | None, k: int) -> int:
    """Return the kth smallest value in the BST (1-indexed)."""
    stack: list[TreeNode] = []
    curr = root
    count = 0
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        count += 1
        if count == k:
            return curr.val
        curr = curr.right
    return -1


def build_bst_from_preorder(preorder: list[int]) -> TreeNode | None:
    """Construct and return the BST whose preorder traversal equals preorder."""
    if not preorder:
        return None
    root = TreeNode(preorder[0])
    i = 1
    while i < len(preorder) and preorder[i] < root.val:
        i += 1
    root.left = build_bst_from_preorder(preorder[1:i])
    root.right = build_bst_from_preorder(preorder[i:])
    return root


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
