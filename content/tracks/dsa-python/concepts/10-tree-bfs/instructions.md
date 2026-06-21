# Tree BFS

## What you'll learn

How the `level_size` snapshot pattern cleanly separates BFS levels, why it's the right tool for "visible from the right side" and "zigzag" problems, and how a single boolean toggle extends standard BFS to zigzag traversal.

## Key concepts

BFS on trees processes nodes level by level. The critical pattern: **snapshot `len(queue)` before processing each level**, then iterate exactly that many times. Nodes enqueued during this loop belong to the next level.

### Level-order traversal

```python
from collections import deque

def level_order(root: TreeNode | None) -> list[list[int]]:
    if root is None:
        return []
    result: list[list[int]] = []
    queue: deque[TreeNode] = deque([root])
    while queue:
        level_size = len(queue)      # snapshot: exactly this many nodes at this level
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
```

### Right side view — last node at each level

```python
def right_side_view(root: TreeNode | None) -> list[int]:
    if root is None:
        return []
    result: list[int] = []
    queue: deque[TreeNode] = deque([root])
    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i == level_size - 1:      # last node at this level
                result.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return result
```

### Zigzag level order — alternate direction per level

```python
def zigzag_level_order(root: TreeNode | None) -> list[list[int]]:
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
```

**The reversal happens at output time**, not during BFS. You still enqueue left-to-right; you just reverse the collected level list for odd levels. This keeps the BFS logic unchanged.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Level order | O(n) | O(w) — max width of tree |
| Right side view | O(n) | O(w) |
| Zigzag level order | O(n) | O(w) |

For a complete binary tree, the last level has n/2 nodes, so max width w = O(n). BFS uses more space than DFS for wide trees; DFS uses more space for deep skewed trees.

## Common variations

- **Minimum Depth** — BFS: the depth of the first leaf reached is the minimum (since BFS visits level by level)
- **Connect Next Right Pointers** — process level by level, link adjacent nodes
- **Average of Levels** — `sum(level) / len(level)` for each level collected
- **Cousins in Binary Tree** — track (parent, depth) per node during BFS; cousins share depth but not parent

## vs DFS

| | BFS | DFS |
|--|-----|-----|
| Data structure | deque (queue) | call stack / explicit stack |
| Level separation | natural | requires depth parameter |
| Shortest path | guaranteed | not guaranteed |
| Space (balanced tree) | O(n) — last level | O(log n) — height |

When the problem asks "at each level" or "minimum depth", default to BFS. When it asks "any path from root to leaf", default to DFS.

## Watch out

- **`deque.popleft()` not `list.pop(0)`** — O(1) vs O(n). Always use `deque` for BFS.
- **`level_size = len(queue)` before the inner loop** — if you call `len(queue)` inside the loop it changes as you enqueue children.
- **`level[::-1]` creates a new list** — O(w) per level, but total work is O(n). Acceptable.
- **Right side view is not always the rightmost node in the tree** — it's the last node visible per level. If the right subtree has fewer levels, left subtree nodes become visible.

## FAANG follow-up questions

> "Can you implement `right_side_view` using DFS?" — Yes: preorder DFS tracking depth; add to result when `depth == len(result)` (first time seeing this level from the right). Pre-order ensures right children are visited before left when you recurse right first.

> "How would you print the left side view?" — Same pattern, but record `i == 0` (first node) at each level instead of `i == level_size - 1`.

> "What if the tree is a perfect binary tree with 2²⁰ leaves?" — BFS queue holds 2²⁰ ≈ 1M nodes at the last level. Memory could be an issue. DFS uses only O(log n) = 20 stack frames for the same tree.

## The task

```python
from collections import deque

def level_order(root: TreeNode | None) -> list[list[int]]:
    """Return level-order traversal as a list of lists, one per level."""

def right_side_view(root: TreeNode | None) -> list[int]:
    """Return the values visible from the right side of the tree
    (the last node at each level)."""

def zigzag_level_order(root: TreeNode | None) -> list[list[int]]:
    """Return level-order traversal where odd levels (1-indexed) go
    left-to-right and even levels go right-to-left."""
```

**Examples:**
- `level_order([3,9,20,null,null,15,7])` → `[[3],[9,20],[15,7]]`
- `right_side_view([1,2,3,null,5,null,4])` → `[1,3,4]`
- `zigzag_level_order([3,9,20,null,null,15,7])` → `[[3],[20,9],[15,7]]`
- `zigzag_level_order([1])` → `[[1]]`
- `zigzag_level_order([])` → `[]`
