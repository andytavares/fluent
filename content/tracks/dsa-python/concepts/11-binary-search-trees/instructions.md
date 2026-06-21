# Binary Search Trees

## What you'll learn

The BST invariant and why naive "check adjacent nodes" validation is wrong, how BST order reduces LCA from O(n) to O(h), and how preorder traversal uniquely determines a BST structure.

## Key concepts

**BST invariant:** for every node, all values in its left subtree are strictly less than `node.val`, and all values in its right subtree are strictly greater. This must hold globally — not just for adjacent parent-child pairs.

### Validate BST — carry bounds, don't check neighbors

The common mistake: only checking `node.left.val < node.val < node.right.val`. This misses cross-subtree violations like a node in the right subtree that is less than the root.

```python
def is_valid_bst(root: TreeNode | None) -> bool:
    def validate(node: TreeNode | None, lo: float, hi: float) -> bool:
        if node is None:
            return True
        if not (lo < node.val < hi):
            return False
        return (validate(node.left, lo, node.val) and
                validate(node.right, node.val, hi))
    return validate(root, float('-inf'), float('inf'))
```

### Kth Smallest — iterative inorder (in-order = sorted for BST)

```python
def kth_smallest(root: TreeNode | None, k: int) -> int:
    stack: list[TreeNode] = []
    curr = root
    count = 0
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left          # go as far left as possible
        curr = stack.pop()
        count += 1
        if count == k:
            return curr.val
        curr = curr.right
    return -1
```

### Build BST from preorder — BST split point

In a BST preorder sequence, the root is `preorder[0]`. All values less than the root form the left subtree; all values greater form the right subtree.

```python
def build_bst_from_preorder(preorder: list[int]) -> TreeNode | None:
    if not preorder:
        return None
    root = TreeNode(preorder[0])
    # Find first index where value > root.val (right subtree start)
    i = 1
    while i < len(preorder) and preorder[i] < root.val:
        i += 1
    root.left = build_bst_from_preorder(preorder[1:i])
    root.right = build_bst_from_preorder(preorder[i:])
    return root
```

**O(n²) worst case** for skewed trees. O(n log n) average. The O(n) solution uses a monotonic stack or an upper-bound parameter to decide recursion without slicing.

## Time and space complexity

| Operation | BST average | BST worst (skewed) |
|-----------|-------------|---------------------|
| Validate BST | O(n) | O(n) |
| Kth Smallest | O(h + k) | O(n) |
| Build from Preorder | O(n log n) avg | O(n²) worst |
| LCA (BST-aware) | O(h) | O(n) |

## Common variations

- **Insert into BST** — recurse left/right based on value; create leaf
- **Delete from BST** — three cases: leaf, one child, two children (replace with inorder successor)
- **Convert Sorted Array to BST** — always pick middle as root for height-balanced result
- **LCA in BST** — iterative: walk left if both < root, right if both > root, else root is LCA

## vs other languages

Python has no built-in BST. For production use: `sortedcontainers.SortedList` (PyPI) provides O(log n) insert/delete/find. Java has `TreeMap` and `TreeSet`. C++ has `std::set` / `std::map`. In interviews, you're always implementing the BST yourself.

`float('-inf')` and `float('inf')` compare correctly with integers in Python — safe to use as boundary sentinels in `is_valid_bst`.

## Watch out

- **The classic BST validation trap:** `[10, 5, 15, null, null, 6, 20]` is invalid because `6 < 10` but sits in the right subtree. Local parent-child checks miss this. Only the global bounds approach catches it.
- **Iterative inorder uses two loops:** outer `while curr or stack`, inner `while curr` to push left spine. The inner loop advances `curr = curr.left` all the way to `None`, then the outer pops and moves right.
- **`preorder` assumes a valid BST preorder sequence** — no duplicates, all values unique.
- **Preorder split:** use a linear scan to find the partition index. `bisect_left(preorder, root.val)` won't work directly since the array is not sorted.

## FAANG follow-up questions

> "Why does iterative inorder avoid the recursion limit but recursive doesn't?" — Both are O(h) space; recursive uses the call stack while iterative uses an explicit stack. Python's call stack limit is ~1000; your explicit stack can be as large as memory allows.

> "Can you build a balanced BST from a sorted array in O(n)?" — Yes: `root = mid = sorted_arr[n//2]`, recurse on left and right halves. Same O(n) as preorder build but always balanced.

> "How would you find the floor/ceiling of a value in a BST?" — Walk left/right based on comparisons; track the last valid candidate at each step.

## The task

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None): ...

def is_valid_bst(root: TreeNode | None) -> bool:
    """Return True if the tree satisfies the BST property for all nodes."""

def kth_smallest(root: TreeNode | None, k: int) -> int:
    """Return the kth smallest value in the BST (1-indexed)."""

def build_bst_from_preorder(preorder: list[int]) -> TreeNode | None:
    """Construct and return the BST whose preorder traversal equals preorder."""
```

**Examples:**
- `is_valid_bst([2,1,3])` → `True`
- `is_valid_bst([5,1,4,null,null,3,6])` → `False`
- `is_valid_bst([10,5,15,null,null,6,20])` → `False` (6 in right subtree but < 10)
- `kth_smallest([3,1,4,null,2], k=1)` → `1`
- `kth_smallest([5,3,6,2,4,null,null,1], k=3)` → `3`
- `build_bst_from_preorder([8,5,1,7,10,12])` → BST with inorder `[1,5,7,8,10,12]`
