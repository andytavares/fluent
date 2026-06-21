from __future__ import annotations


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
    # TODO: base case None -> 0; recursive: 1 + max(depth(left), depth(right))
    return 0


def has_path_sum(root: TreeNode | None, target: int) -> bool:
    """Return True if any root-to-leaf path sums to target."""
    # TODO: check leaf; recurse with target - root.val; return False for None
    return False


def lowest_common_ancestor(
    root: TreeNode | None, p: TreeNode, q: TreeNode
) -> TreeNode | None:
    """Return the lowest common ancestor of p and q in the binary tree."""
    # TODO: if root is None/p/q return root; recurse left and right;
    #       if both non-None return root; else return whichever is non-None
    return None


def _build(vals: list[int | None]) -> TreeNode | None:
    """Build a tree from level-order list (None = missing node)."""
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])  # type: ignore[arg-type]
    from collections import deque
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


if __name__ == "__main__":
    root = _build([3, 9, 20, None, None, 15, 7])
    print(max_depth(root))          # 3
    root2 = _build([5, 4, 8, 11, None, 13, 4, 7, 2])
    print(has_path_sum(root2, 22))  # True
