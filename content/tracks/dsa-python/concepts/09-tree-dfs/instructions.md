# Tree DFS

## What you'll learn

The three DFS traversal orders and which problems each solves, why postorder is the natural shape for "compute from subtrees up", and how lowest common ancestor (LCA) distills the same pattern into a genuinely hard interview problem.

## Key concepts

```python
class TreeNode:
    def __init__(
        self,
        val: int = 0,
        left: "TreeNode | None" = None,
        right: "TreeNode | None" = None,
    ) -> None:
        self.val = val
        self.left = left
        self.right = right
```

**Traversal orders:**

| Order | Visit sequence | When to use |
|-------|----------------|-------------|
| Preorder | root → left → right | Copy/serialize a tree, compute top-down |
| Inorder | left → root → right | BST sorted output |
| Postorder | left → right → root | Height, path sums, any "combine subtree results" |

### Max depth — postorder

```python
def max_depth(root: TreeNode | None) -> int:
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```

### Has path sum — preorder (carry state downward)

```python
def has_path_sum(root: TreeNode | None, target: int) -> bool:
    if root is None:
        return False
    if root.left is None and root.right is None:  # leaf
        return root.val == target
    remainder = target - root.val
    return has_path_sum(root.left, remainder) or has_path_sum(root.right, remainder)
```

### Lowest common ancestor — postorder with propagation

LCA of nodes `p` and `q` is the deepest node that is an ancestor of both. The recursive insight: if both `p` and `q` are found in different subtrees of a node, that node is the LCA.

```python
def lowest_common_ancestor(
    root: TreeNode | None, p: TreeNode, q: TreeNode
) -> TreeNode | None:
    if root is None:
        return None
    if root is p or root is q:
        return root                          # found one of them — return it
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root                          # p and q split across children
    return left or right                     # one side has both, or neither found
```

**Why this works:** if `p` is in the left subtree and `q` is in the right subtree (or vice versa), `left` and `right` are both non-None at exactly one node — the LCA. If both are in the same subtree, one side returns `None` and `left or right` propagates the found node upward.

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| Max depth | O(n) | O(h) call stack |
| Has path sum | O(n) | O(h) call stack |
| Lowest common ancestor | O(n) | O(h) call stack |

Where `h` = tree height: O(log n) balanced, O(n) skewed.

## Common variations

- **Diameter of Binary Tree** — postorder: `diameter = max(diameter, left_h + right_h)` at each node
- **Path Sum II** — collect all root-to-leaf paths that sum to target (backtracking on the recursion)
- **Serialize and Deserialize Binary Tree** — preorder DFS + delimiter encoding
- **Binary Tree Maximum Path Sum** — hard; postorder, track `max_gain` returning only one direction up

## vs other languages

Python's recursion limit is 1000 by default (`sys.getrecursionlimit()`). For a balanced tree of 10⁶ nodes (height ~20), this is fine. For a skewed tree (essentially a linked list), you'd need `sys.setrecursionlimit(1100)` or an iterative implementation. Java and C++ have much larger default stack sizes.

A nested `def dfs(node)` that closes over an outer `result` list is idiomatic Python — no need to pass `result` as a parameter or return it from the helper.

## Watch out

- **Base case must return 0 (not raise)** for `max_depth` — `None` nodes contribute 0 depth.
- **Leaf check:** `root.left is None and root.right is None` — both children must be `None`. A node with only one `None` child is not a leaf.
- **LCA uses `is` (identity), not `==` (equality).** Two different nodes could have the same value. The problem always passes actual node references.
- **LCA assumes both `p` and `q` exist in the tree** — the standard LeetCode constraint. If they might not exist, you need a different approach.

## FAANG follow-up questions

> "What if the tree is very deep (millions of nodes in a linked-list shape)?" — Switch to iterative DFS with an explicit stack to avoid Python's recursion limit.

> "Can LCA be done in O(log n) for a balanced BST?" — Yes, with BST properties you don't need a full scan: walk left if both p.val and q.val < root.val, walk right if both > root.val, otherwise root is the LCA. (That's concept 11.)

> "How would you modify `has_path_sum` to return all such paths?" — Use backtracking: append `root.val` to a path list, recurse, then pop on the way back (postorder).

## The task

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None): ...

def max_depth(root: TreeNode | None) -> int:
    """Return the maximum depth (number of nodes along the longest root-to-leaf path)."""

def has_path_sum(root: TreeNode | None, target: int) -> bool:
    """Return True if any root-to-leaf path sums to target."""

def lowest_common_ancestor(
    root: TreeNode | None, p: TreeNode, q: TreeNode
) -> TreeNode | None:
    """Return the lowest common ancestor of nodes p and q in the binary tree.
    All node values are unique. Both p and q exist in the tree."""
```

**Examples:**
- `max_depth([3,9,20,null,null,15,7])` → `3`
- `max_depth([])` → `0`
- `has_path_sum([5,4,8,11,null,13,4,7,2], 22)` → `True` (5+4+11+2)
- `has_path_sum([1,2,3], 5)` → `False`
- `lowest_common_ancestor([3,5,1,6,2,0,8], p=5, q=1)` → node 3
- `lowest_common_ancestor([3,5,1,6,2,0,8], p=5, q=4)` → node 5 (5 is ancestor of 4)
