# Tree BFS

## What you'll learn

Tree DFS gave you recursion down paths; this concept gives you the other traversal: breadth-first, level by level, with a queue. The one idea that matters is the **level-size snapshot** — freeze the queue length before draining a level so you know exactly where one depth ends and the next begins. With that loop in hand, level order traversal, right side view, per-level averages, and zigzag ordering are each a one-line variation on the same template.

## Key concepts

### `collections.deque` — Python's actual queue

Python has no built-in queue type backed by a list — `list.pop(0)` is O(n), just like JavaScript's `Array.shift()`. The standard library fix is `collections.deque`, a doubly linked list with O(1) `popleft()` and `append()`:

```python
from collections import deque

queue = deque([root])
node = queue.popleft()  # O(1) — this is the whole reason to reach for deque
queue.append(node.left)
```

This replaces the "head index into a growing array" trick you'd use in a language without a deque — in Python you just use the real thing.

### The queue and the level-size snapshot

BFS visits nodes in order of distance from the root: the root, then both its children, then all four grandchildren, and so on. A plain queue gives you that order for free — but it does *not* tell you where level boundaries fall. The fix: at the top of each outer iteration, snapshot how many nodes are currently queued. That count is exactly one complete level, because every node queued so far is from the current depth and everything you push while draining it is from the next.

```python
from collections import deque

def level_order(root):
    if root is None:
        return []
    result = []
    queue = deque([root])
    while queue:
        level_size = len(queue)          # snapshot: exactly one level
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
```

Invariant: children pushed during the inner loop land at the *back* of the deque, so they are never drained as part of the current level's `for _ in range(level_size)` loop. That's the whole trick.

### Every level problem is this template plus one line

| Problem | Change to the template |
|---------|------------------------|
| Level order traversal | none — collect each level list |
| Right side view | keep only the value drained last in each level |
| Average of levels | sum the level, divide by the snapshot size |
| Zigzag level order | reverse the level list on odd depths |

Recognize this in interviews: if the problem statement says "per level", "by depth", "visible from the side", or "top to bottom", reach for the snapshot loop before anything else.

### Complexity of the flagship problems

| Problem | Time | Space |
|---------|------|-------|
| Level Order Traversal | O(n) | O(w) queue, w = max level width |
| Right Side View | O(n) | O(w) |
| Zigzag Level Order | O(n) | O(w) |

The queue peaks at the widest level — up to ⌈n/2⌉ nodes for a complete tree, so O(n) worst case.

## Watch out

- **Snapshot before draining.** `level_size = len(queue)` must be captured before the inner loop starts; reading `len(queue)` inside a `while` condition instead lets it grow as you push children, and levels bleed into each other.
- **`list.pop(0)` is quadratic.** Reach for `collections.deque` from the start; don't build a queue out of a plain `list`.
- **Guard the empty tree.** Return `[]` before touching the queue; a `None` in the queue crashes on `.left`.
- **Right side view is not the right spine.** In the tree `1 → (2, 3)` with `2.left = 4` and nothing below `3`, the view is `[1, 3, 4]` — once the right side runs out of depth, a left-subtree node becomes visible. Walking `node.right` pointers gives the wrong answer; the last node per BFS level is always right.
- **Zigzag reverses the collected level, not the queue.** Keep enqueueing left-then-right at every depth; flip only the output list. Reordering the queue corrupts every level below.
- **Push only non-`None` children.** Enqueueing `None` and filtering at dequeue works but doubles queue traffic and invites crashes.

## Problem walkthroughs

### Binary Tree Level Order Traversal ★

**Problem.** Given the root of a binary tree, return a list of lists: the node values at each depth, top to bottom, left to right within a level.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [[3], [9, 20], [15, 7]]
    empty tree                       →  []

**Steps.**
1. Return `[]` for a `None` root. Otherwise queue the root.
2. While the queue is non-empty: snapshot `level_size = len(queue)`, drain exactly that many nodes into a `level` list, pushing each node's non-`None` children as you go.
3. Append `level` to the result after the inner loop.
4. The snapshot is the correctness argument: everything queued at the top of an iteration is one full level, and children land at the back, beyond the current drain count.

**Complexity.** O(n) time / O(w) space — each node is queued and drained exactly once.

### Binary Tree Right Side View ★

**Problem.** Standing to the right of a binary tree, return the values you can see, top to bottom — the rightmost node at each depth.

**Example.**

    tree 1 → (2, 3), 2.right = 5, 3.right = 4  →  [1, 3, 4]
    tree 1 → (2, 3), 2.left = 4 (3 is a leaf)  →  [1, 3, 4]

**Steps.**
1. Run the level loop; you don't need the `level` list — just the values.
2. Inside the inner loop, when draining the last node of the level (the `level_size`-th one drained, i.e. `i == level_size - 1`), append its value to the result.
3. Children are enqueued left-to-right, so within a level the queue preserves left-to-right order — the last drained node is the rightmost one at that depth, whichever subtree it lives in.
4. Note the second example: the deepest visible node (`4`) hangs off the *left* child. That's why this is a BFS problem, not a walk down `right` pointers.

**Complexity.** O(n) time / O(w) space.

### Average of Levels in Binary Tree

**Problem.** Return a list where element `i` is the average of the node values at depth `i`.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [3, 14.5, 11]

**Steps.**
1. Same level loop; instead of collecting values, keep a running `total` across the inner loop.
2. After draining the level, append `total / level_size` — the snapshot doubles as the divisor, which is exactly why you took it.
3. Python integers are arbitrary precision, so overflow isn't a concern the way it is in fixed-width languages — but `/` always produces a `float`, which is what you want here.

**Complexity.** O(n) time / O(w) space.

### Binary Tree Zigzag Level Order Traversal ★

**Problem.** Return the level order traversal, but alternate direction per level: level 0 left-to-right, level 1 right-to-left, level 2 left-to-right, and so on.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [[3], [20, 9], [15, 7]]

**Steps.**
1. Run the plain level loop, always enqueueing children left-then-right — traversal order never changes.
2. Track the depth (or a `left_to_right` boolean you flip each level).
3. On right-to-left levels, reverse the collected `level` list before appending it — `level[::-1]`.
4. The insight: zigzag is a *presentation* change, not a *traversal* change. Solutions that mess with queue order break because children of a reversed level would be discovered in the wrong order for the level after it.

**Complexity.** O(n) time / O(w) space — the reverse costs O(level size), already paid for by draining it.

## Interview follow-ups

- After **Right Side View**: "Left side view?" (keep the first node drained, `i == 0`, instead of the last). "Do it with DFS?" (visit right child first, record a value whenever `depth == len(result)` — the first arrival at each depth is the rightmost node.)
- After **Level Order**: "Bottom-up level order?" (collect normally, reverse the result — don't traverse upside down.)
- After **Zigzag**: "Avoid the reverse?" (write into a pre-sized list back-to-front.)
- General: "Why BFS over DFS here?" — DFS with a depth parameter can group by level too (append to `result[depth]`), but BFS finds level boundaries without bookkeeping and its memory is bounded by tree *width* instead of *height*, which matters for deep, narrow trees.

## The task

Three level-by-level traversals over binary trees. Every node is `TreeNode(val, left, right)`; missing children are `None`, and an empty tree is `None` itself. All three functions must run in O(n) time.

```python
# The tree used in the samples below:
#        3
#       / \
#      9  20
#         / \
#        15  7
t = TreeNode(3,
    TreeNode(9),
    TreeNode(20, TreeNode(15), TreeNode(7)))
```

### `level_order(root)`

Return a list of lists: the node values at each depth, top to bottom, left to right within each level. An empty tree returns `[]`.

```python
level_order(t)              # [[3], [9, 20], [15, 7]]
level_order(TreeNode(1))    # [[1]]
level_order(None)           # []
```

Edge cases: empty tree, single node, skewed trees (every level has one node), negative values.

### `right_side_view(root)`

Return the values visible from the right side of the tree, top to bottom — the rightmost node at each depth. A node in a *left* subtree is visible when nothing at its depth exists further right. An empty tree returns `[]`.

```python
right_side_view(t)     # [3, 20, 7]
right_side_view(None)  # []

# 1 → (2, 3), where 2.left = 4 and 3 is a leaf: depth 2 only contains 4
u = TreeNode(1, TreeNode(2, TreeNode(4)), TreeNode(3))
right_side_view(u)     # [1, 3, 4]
```

Edge cases: empty tree, single node, right-only and left-only chains, deeper nodes hanging off left subtrees (the `[1, 3, 4]` case above — do not just follow `right` pointers).

### `zigzag_level_order(root)`

Return the level order traversal with alternating direction: level 0 left-to-right, level 1 right-to-left, and so on. An empty tree returns `[]`.

```python
zigzag_level_order(t)     # [[3], [20, 9], [15, 7]]
zigzag_level_order(None)  # []
```

Edge cases: empty tree, single node, levels with one node (reversing changes nothing), trees deep enough to flip direction several times.
