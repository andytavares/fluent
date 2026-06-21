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
    # TODO: recursive helper with (lo, hi) bounds; tighten lo at right child, hi at left
    return False


def kth_smallest(root: TreeNode | None, k: int) -> int:
    """Return the kth smallest value in the BST (1-indexed)."""
    # TODO: iterative inorder; outer: while curr or stack; inner: push left spine; pop and count
    return 0


def build_bst_from_preorder(preorder: list[int]) -> TreeNode | None:
    """Construct and return the BST whose preorder traversal equals preorder."""
    # TODO: root is preorder[0]; find split where values become > root.val;
    #       recurse on left slice and right slice
    return None


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
    print(is_valid_bst(_build([2, 1, 3])))                       # True
    print(is_valid_bst(_build([5, 1, 4, None, None, 3, 6])))    # False
    print(kth_smallest(_build([3, 1, 4, None, 2]), 1))          # 1
    bst = build_bst_from_preorder([8, 5, 1, 7, 10, 12])
    print(bst.val if bst else None)                              # 8 (root)
