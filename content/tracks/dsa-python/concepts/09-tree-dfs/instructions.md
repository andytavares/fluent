# Binary Tree

## What you'll learn

Structural recursion on binary trees — the skill this whole group reduces to. You'll learn the two shapes tree recursion takes (bottom-up: combine the children's answers; top-down: thread an accumulator along the path), lockstep recursion over two trees at once, and the "return one thing, track another" pattern behind Binary Tree Maximum Path Sum. The fourteen problems here range from four-line classics (Maximum Depth, Invert) to genuine hard-mode material (Max Path Sum, BST Iterator, Count Complete Tree Nodes in O(log² n)).

## Key concepts

### The node representation

Every tree node here is a small class with a value and two child pointers; missing children are `None`, and an empty tree is `None` itself:

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

#     3
#    / \
#   9  20
#      / \
#     15  7
root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
```

Tests describe trees as **level-order lists** with `None` marking absent children (children of absent nodes are omitted): the tree above is `[3, 9, 20, None, None, 15, 7]`.

### Bottom-up recursion — an answer per subtree

The most common shape: the function computes something about the whole subtree rooted at `root` by combining the answers for `root.left` and `root.right`. The `None` case anchors everything:

```python
def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```

Depth, node counts, subtree sums, "is this subtree balanced/a BST" — all the same skeleton with a different combine step. The call stack does the traversal bookkeeping for you.

### Top-down recursion — state threaded along the path

When the answer depends on the *path from the root* rather than the subtree below, pass an accumulator down instead of combining results up:

```python
def has_path_sum(root, target_sum):
    if root is None:
        return False
    if root.left is None and root.right is None:  # leaf
        return target_sum == root.val
    return (has_path_sum(root.left, target_sum - root.val)
            or has_path_sum(root.right, target_sum - root.val))
```

Subtracting on the way down means each call asks the same-shaped question: "does a root-to-leaf path in *this* subtree sum to *this* target?" Sum Root to Leaf Numbers threads `acc * 10 + val` the same way.

### Lockstep recursion — two trees at once

Comparing trees means recursing on a *pair* of nodes and enumerating the `None` combinations first:

```python
def is_same_tree(p, q):
    if p is None and q is None:
        return True   # both absent
    if p is None or q is None:
        return False  # one absent
    return (p.val == q.val
            and is_same_tree(p.left, q.left)
            and is_same_tree(p.right, q.right))
```

Symmetric Tree is the same function with the legs crossed: compare `a.left` with `b.right` and `a.right` with `b.left`.

### Return one thing, track another

Some problems need a value the recursion can't return directly. Binary Tree Maximum Path Sum returns "best *downward* path starting here" from each call — that's what a parent can extend — while updating a best-seen-anywhere variable in the enclosing scope for the arch through each node. In Python this means the helper closes over a `nonlocal` variable rather than a global — keeping the two roles separate is the entire difficulty of the problem.

### Complexity of the flagship problems

| Problem | Time | Space | Shape |
|---------|------|-------|-------|
| Maximum Depth | O(n) | O(h) | bottom-up |
| Same Tree | O(min(m, n)) | O(h) | lockstep |
| Invert Binary Tree | O(n) | O(h) | bottom-up |
| Path Sum | O(n) | O(h) | top-down |

`h` is the tree height: O(log n) balanced, O(n) fully skewed — the recursion stack is your space cost.

## Watch out

- **`None` check first.** Touch `root.val` before checking `root is None` and the whole suite crashes with `AttributeError`. Every tree function starts with the `None` case.
- **A leaf is a node with no children.** Reaching `None` is *not* reaching a leaf: `has_path_sum(None, 0)` must be `False` (an empty tree has no root-to-leaf paths), and a node with one child is not a leaf — the path must continue through the existing child.
- **Values can be negative.** No pruning like "stop when the running sum exceeds the target" — a later −5 can rescue the path. Max Path Sum must initialize its best to `float("-inf")`, not 0.
- **Same Tree compares structure *and* values.** `[1, 2]` vs `[1, None, 2]` have equal traversal *values* but different shapes — the one-`None` case must return `False`.
- **Swap with tuple assignment when inverting.** `root.left, root.right = root.right, root.left` swaps atomically; doing it as two separate statements loses a subtree.
- **Depth counts nodes here, not edges.** A single-node tree has depth 1. Off-by-one between the two conventions is a classic interview stumble.
- **Recursion depth equals tree height.** Python's default recursion limit is ~1000 frames (`sys.getrecursionlimit()`); a skewed chain of a few thousand nodes will blow it with `RecursionError` where an iterative rewrite (explicit stack) would not. This is stricter than most languages — know the limit exists.

## Problem walkthroughs

### Maximum Depth of Binary Tree ★

**Problem.** Return the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.

**Example.**

    [3,9,20,None,None,15,7] → 3
    [1,None,2]              → 2

**Steps.**
1. Base case: `root is None` → 0.
2. Recurse on both children and return `1 + max(left_depth, right_depth)`.
3. That's the whole function — the longest path through the root goes through whichever child is deeper, plus the root itself.

**Complexity.** O(n) time / O(h) recursion stack.

### Same Tree ★

**Problem.** Given two trees `p` and `q`, return `True` if they are structurally identical with equal values at every position.

**Example.**

    [1,2,3] vs [1,2,3]     → True
    [1,2]   vs [1,None,2]  → False   (same values, mirrored shape)

**Steps.**
1. Both `None` → `True` (two empty trees match).
2. Exactly one `None` → `False` (shape mismatch).
3. Values differ → `False`.
4. Otherwise recurse in lockstep: `is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`. The `and` short-circuits on the first mismatch, so unequal trees exit early.

**Complexity.** O(min(m, n)) time / O(h) space.

### Invert Binary Tree ★

**Problem.** Mirror the tree in place: every node's left and right subtrees swap. Return the root.

**Example.**

    [4,2,7,1,3,6,9] → [4,7,2,9,6,3,1]
    [2,1,3]         → [2,3,1]

**Steps.**
1. Base case: `root is None` → return `None`.
2. Swap the children: `root.left, root.right = root.right, root.left`.
3. Recurse into both (now-swapped) children — the order of swap vs recurse doesn't matter, as long as each node swaps exactly once.
4. Return `root` so calls compose.

**Complexity.** O(n) time / O(h) space — one swap per node.

### Symmetric Tree

**Problem.** Return `True` if the tree is a mirror of itself around its center.

**Example.**

    [1,2,2,3,4,4,3]       → True
    [1,2,2,None,3,None,3] → False

**Steps.**
1. Define a helper `is_mirror(a, b)` on a *pair* of nodes: both `None` → `True`; one `None` → `False`; values differ → `False`.
2. Recurse with the legs crossed: `is_mirror(a.left, b.right) and is_mirror(a.right, b.left)` — outer children pair with outer, inner with inner.
3. The answer is `is_mirror(root.left, root.right)` (empty tree → `True`).
4. This is Same Tree with one comparison reflected — recognizing that reuse is the point.

**Complexity.** O(n) time / O(h) space.

### Construct Binary Tree from Preorder and Inorder Traversal

**Problem.** Rebuild a tree from its `preorder` and `inorder` traversals. All values are distinct.

**Example.**

    preorder = [3,9,20,15,7], inorder = [9,3,15,20,7] → [3,9,20,None,None,15,7]

**Steps.**
1. `preorder[0]` is always the root. Find it in `inorder`: everything left of it is the left subtree's inorder, everything right is the right subtree's.
2. The left-inorder's *length* tells you how many entries of `preorder` (after the root) belong to the left subtree — that splits `preorder` too.
3. Recurse on the two (preorder-slice, inorder-slice) pairs to build the children.
4. For O(n): precompute a value → inorder-index `dict`, and recurse on index bounds plus a moving preorder cursor instead of slicing lists — slicing makes it O(n²) in time and garbage.

**Complexity.** O(n) time / O(n) space for the map + O(h) recursion.

### Construct Binary Tree from Inorder and Postorder Traversal

**Problem.** Same reconstruction, but from `inorder` and `postorder`. All values distinct.

**Example.**

    inorder = [9,3,15,20,7], postorder = [9,15,7,20,3] → [3,9,20,None,None,15,7]

**Steps.**
1. The root is now the **last** element of `postorder` (postorder visits root last).
2. Split `inorder` around the root exactly as before.
3. Consume `postorder` from the end with a cursor, and build the **right subtree first** — walking backward through postorder yields root, then the right subtree's nodes, then the left's.
4. Same value → index map, same index-bounds recursion; only the cursor direction and build order change.

**Complexity.** O(n) time / O(n) space for the map + O(h) recursion.

### Populating Next Right Pointers in Each Node II

**Problem.** Each node gains a `next` pointer. Set every node's `next` to the nearest node to its right **on the same level**, or `None` if none exists. The tree is arbitrary (not perfect). O(1) extra space beyond the pointers themselves.

**Example.**

    [1,2,3,4,5,None,7] → next chains: 1→None; 2→3→None; 4→5→7→None

**Steps.**
1. Process one level at a time using the `next` pointers you built for the level above — that's what replaces the BFS queue.
2. For the level being built, keep a dummy head and a `tail`; walk `cur` across the current level via `cur.next`.
3. For each `cur`, append its existing children: `if cur.left: tail.next = cur.left; tail = tail.next`, same for `cur.right`.
4. When `cur` runs out, drop to the next level: `cur = dummy.next`, reset the dummy's `next` and `tail`.
5. The dummy head absorbs "which node starts the next level?" — the same sentinel trick as in linked lists, which is no accident: each level *is* a linked list.

**Complexity.** O(n) time / O(1) extra space.

### Flatten Binary Tree to Linked List

**Problem.** Flatten the tree in place into a "linked list" using the `right` pointers, in **preorder** order; every `left` becomes `None`.

**Example.**

    [1,2,5,3,4,None,6] → 1→2→3→4→5→6  (all via right pointers)

**Steps.**
1. Walk `curr` down the tree. If `curr.left` is `None`, just move to `curr.right`.
2. Otherwise find the **rightmost node of the left subtree** — the last node preorder visits before returning to `curr`'s right subtree.
3. Rewire: that rightmost node's `right = curr.right`; then `curr.right = curr.left`; then `curr.left = None`.
4. Move on to `curr.right` and repeat. This is the Morris-traversal trick: O(1) space because the predecessor hunt replaces the stack.
5. Each node is visited at most twice (once by `curr`, once during a predecessor hunt), so it's still linear.

**Complexity.** O(n) time / O(1) space (the recursive version is O(h)).

### Path Sum ★

**Problem.** Given `root` and `target_sum`, return `True` if some **root-to-leaf** path's values sum exactly to `target_sum`. An empty tree has no paths.

**Example.**

    [5,4,8,11,None,13,4,7,2,None,None,None,1], target_sum = 22 → True   (5+4+11+2)
    [1,2,3], target_sum = 5                                    → False

**Steps.**
1. `root is None` → `False`. This also encodes "empty tree has no paths" — even for `target_sum == 0`.
2. Leaf check: no left *and* no right → return `target_sum == root.val`.
3. Otherwise recurse on both children with `target_sum - root.val`; return the `or`.
4. The leaf check must come before recursing, and must be a real leaf check — testing at `None` instead would accept paths that stop at a one-child node's missing side.

**Complexity.** O(n) time / O(h) space.

### Sum Root to Leaf Numbers

**Problem.** Each root-to-leaf path spells a number (digits top to bottom). Return the sum of all these numbers. Node values are digits 0–9.

**Example.**

    [1,2,3]     → 25    (12 + 13)
    [4,9,0,5,1] → 1026  (495 + 491 + 40)

**Steps.**
1. Thread the running number down: `dfs(node, acc)` where the new accumulator is `acc * 10 + node.val`.
2. At a leaf, return the accumulated number.
3. At an internal node, return `dfs(left) + dfs(right)`, treating a `None` child as contributing 0 — but only recurse into children that exist, or handle `node is None → 0` and rely on the leaf check firing first for real leaves.
4. The `× 10` shift is why this is top-down: a node cannot know its number without the digits above it.

**Complexity.** O(n) time / O(h) space.

### Binary Tree Maximum Path Sum

**Problem.** A path is any sequence of nodes connected by parent-child edges — it may start and end anywhere, but cannot branch or revisit. Return the maximum possible sum of a path's values. Values may be negative; the path has at least one node.

**Example.**

    [1,2,3]                     → 6    (2 + 1 + 3)
    [-10,9,20,None,None,15,7]   → 42   (15 + 20 + 7)

**Steps.**
1. Write `gain(node)`: the best sum of a **downward** path starting at `node` — that's the only shape a parent can extend upward.
2. Compute `left_gain = max(gain(node.left), 0)` and the same for the right — clamping at 0 is "taking nothing from a negative subtree."
3. The best path **arching through** `node` is `node.val + left_gain + right_gain`; fold it into a `best` variable via `nonlocal` in the enclosing scope (initialize to `float("-inf")` — all-negative trees must still pick a node).
4. Return `node.val + max(left_gain, right_gain)` — a downward path can continue through only one child.
5. The split between what's *returned* (extendable path) and what's *recorded* (complete arch) is the entire problem.

**Complexity.** O(n) time / O(h) space.

### Binary Search Tree Iterator

**Problem.** Build an iterator over a BST's inorder (ascending) traversal: `next()` returns the next value, `has_next()` says whether one remains. Both must average O(1) time with O(h) memory — you may not flatten the whole tree upfront.

**Example.**

    BST [7,3,15,None,None,9,20]: next()→3, next()→7, has_next()→True, next()→9 …

**Steps.**
1. Keep an explicit stack (a Python `list` used as a stack) holding the path of "nodes whose left subtree is done but who haven't been visited."
2. `_push_left(node)`: from `node`, walk left pushing every node. Initialize the iterator with `_push_left(root)`.
3. `next()`: pop a node — it's the smallest unvisited. Before returning its value, `_push_left(node.right)` to queue up its successor chain.
4. `has_next()`: stack non-empty.
5. Each node is pushed and popped exactly once across the whole iteration, so `next()` is amortized O(1); the stack never exceeds the tree height. This is recursion converted to a *pausable* explicit stack.

**Complexity.** Amortized O(1) per `next` / O(h) space.

### Count Complete Tree Nodes

**Problem.** Count the nodes of a **complete** binary tree (every level full except possibly the last, which fills left to right) in better than O(n).

**Example.**

    [1,2,3,4,5,6] → 6
    []            → 0

**Steps.**
1. Measure the tree's left spine (keep going `left`) and right spine (keep going `right`) heights.
2. If they're equal, the tree is *perfect*: return `2**h - 1` directly — no traversal.
3. If not, recurse: `1 + count(root.left) + count(root.right)`.
4. Why it's fast: at every level of recursion, at least one of the two children is a perfect tree (completeness guarantees it), so only one branch actually recurses. O(log n) levels × O(log n) spine measurement = O(log² n).

**Complexity.** O(log² n) time / O(log n) space.

### Lowest Common Ancestor of a Binary Tree

**Problem.** Given the root and two nodes `p` and `q` that both exist in the tree, return their lowest common ancestor — the deepest node that has both among its descendants (a node counts as its own descendant).

**Example.**

    [3,5,1,6,2,0,8,None,None,7,4]: LCA(5, 1) → 3;  LCA(5, 4) → 5

**Steps.**
1. Base case: if `root` is `None`, or `root is p`, or `root is q`, return `root` — you've found nothing, or found one of the targets.
2. Recurse into both children; collect `left` and `right`.
3. If both came back non-`None`, `p` and `q` live in different subtrees — `root` is the LCA.
4. Otherwise return whichever side is non-`None` (both targets are down there, and the deeper call already identified their LCA — or one target is an ancestor of the other, covered by the base case returning early).
5. Compare node *identity* (`is`, not `==`), and note the search legitimately stops at `p` or `q` without exploring below — since both are guaranteed present, that's safe.

**Complexity.** O(n) time / O(h) space.

## Interview follow-ups

- After **Maximum Depth**: "Iteratively?" — BFS counting levels, or DFS with an explicit `(node, depth)` stack. "Minimum depth?" — beware the trap: a one-child node's depth goes through the existing child, not the missing one.
- After **Invert Binary Tree**: "Without recursion?" — a queue or stack of pending nodes; swap children as each node is visited.
- After **Path Sum**: "Return all the paths" (carry the path list, copy on hit) or "count paths that don't need to start at the root" (prefix-sum map down the path).
- After **Lowest Common Ancestor**: "Nodes have parent pointers?" — walk both ancestors upward like finding the intersection of two linked lists. "It's a BST?" — descend from the root using ordering; first node between `p` and `q` in value is the LCA.
- After **BST Iterator**: "Add `prev()`" — a second stack for the right spine, or thread predecessor pointers.

## The task

Four tree-recursion classics. Every tree node is `TreeNode(val, left, right)`; missing children are `None`, and an empty tree is `None` itself:

```python
# The tree [3, 9, 20, None, None, 15, 7]:
TreeNode(3,
    TreeNode(9),
    TreeNode(20, TreeNode(15), TreeNode(7)))
```

In the samples, `tree([...])` builds a tree from a **level-order list** where `None` marks an absent child and children of absent nodes are omitted — the test suite constructs and compares trees exactly this way.

### `max_depth(root)`

Return the number of nodes on the longest root-to-leaf path. The empty tree has depth 0; a single node has depth 1. O(n) time.

```python
max_depth(tree([3, 9, 20, None, None, 15, 7]))  # 3
max_depth(tree([1, None, 2]))                   # 2
max_depth(None)                                 # 0
```

Edge cases: empty tree, single node, a skewed chain (depth = node count).

### `is_same_tree(p, q)`

Return `True` if trees `p` and `q` are structurally identical with equal values at every position; `False` otherwise. Either argument may be `None`. O(min(m, n)) time.

```python
is_same_tree(tree([1, 2, 3]), tree([1, 2, 3]))  # True
is_same_tree(tree([1, 2]), tree([1, None, 2]))  # False  (mirrored shape)
is_same_tree(tree([1, 2, 1]), tree([1, 1, 2]))  # False  (values swapped)
is_same_tree(None, None)                        # True
```

Edge cases: both empty (`True`), exactly one empty (`False`), same shape with one differing leaf value, mirrored shapes with identical value multisets.

### `invert_tree(root)`

Mirror the tree **in place** — swap every node's left and right subtrees — and return the root of the same tree you were given (mutate the given nodes; don't build a copy). O(n) time.

```python
invert_tree(tree([4, 2, 7, 1, 3, 6, 9]))  # tree([4, 7, 2, 9, 6, 3, 1])
invert_tree(tree([2, 1, 3]))              # tree([2, 3, 1])
invert_tree(None)                         # None
```

Edge cases: empty tree (`None` in, `None` out), single node (unchanged), one-sided nodes (the lone child switches sides).

### `has_path_sum(root, target_sum)`

Return `True` if some **root-to-leaf** path's values sum exactly to `target_sum`. A leaf is a node with no children; an empty tree has no paths at all, so the answer for `None` is always `False` — even when `target_sum` is 0. Values (and `target_sum`) may be negative. O(n) time.

```python
has_path_sum(tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1]), 22)  # True
has_path_sum(tree([1, 2, 3]), 5)  # False  (paths sum to 3 and 4)
has_path_sum(tree([1, 2]), 1)     # False  (1 is not a leaf — the path continues)
has_path_sum(None, 0)             # False
```

Edge cases: empty tree, single node equal / not equal to `target_sum`, one-child nodes (the path must reach the real leaf), negative values that make a path sum come back down to the target.
