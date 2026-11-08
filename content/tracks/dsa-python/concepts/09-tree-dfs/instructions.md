## What you build

You write four tree functions: `max_depth`, `is_same_tree`, `invert_tree` and `has_path_sum`. Each one uses structural recursion, the skill that every tree problem reduces to. This lesson builds on **Linked List**.

## Key concepts

### A tree node is a value and two child pointers

A missing child is `None`. An empty tree is `None` itself.

```python
class TreeNode:
    def __init__(self, val=0,
                 left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

#     3
#    / \
#   9  20
#      / \
#     15  7
root = TreeNode(3,
    TreeNode(9),
    TreeNode(20,
        TreeNode(15), TreeNode(7)))
```

The tests describe a tree as a level-order list. `None` marks an absent child, and the list omits the children of absent nodes. The tree above is `[3, 9, 20, None, None, 15, 7]`.

### Bottom-up recursion combines the answers of the children

The function computes an answer for the subtree at `root` from the answers for `root.left` and `root.right`. The `None` case anchors the recursion.

```python
def max_depth(root):
    if root is None:
        return 0
    return 1 + max(
        max_depth(root.left),
        max_depth(root.right),
    )
```

Depth, node counts, subtree sums and "is this subtree balanced" all use this skeleton with a different combine step. The call stack does the traversal bookkeeping for you.

### Top-down recursion passes state along the path

When the answer depends on the path from the root, pass an accumulator down. Do not combine results up.

```python
def has_path_sum(root, target_sum):
    if root is None:
        return False
    rest = target_sum - root.val
    # A leaf: no children
    if not root.left and not root.right:
        return rest == 0
    return (
        has_path_sum(root.left, rest)
        or has_path_sum(root.right, rest)
    )
```

Each call asks the same question: "does a root-to-leaf path in this subtree sum to this target?" Sum Root to Leaf Numbers passes `acc * 10 + val` down in the same way.

### Lockstep recursion walks two trees at once

To compare two trees, recurse on a pair of nodes. Handle the `None` combinations first.

```python
def is_same_tree(p, q):
    # Both absent
    if p is None and q is None:
        return True
    # One absent
    if p is None or q is None:
        return False
    return (p.val == q.val
        and is_same_tree(p.left, q.left)
        and is_same_tree(p.right, q.right))
```

Symmetric Tree is the same function with the legs crossed. It compares `a.left` with `b.right` and `a.right` with `b.left`.

### Some recursions return one value and track another

Some problems need a value that the recursion cannot return directly. In Binary Tree Maximum Path Sum, each call returns the best downward path from its node, because a parent can extend only that. A `nonlocal` variable in the enclosing scope tracks the best arch through any node. Keeping the two roles separate is the whole difficulty of the problem.

### Complexity of the flagship problems

| Problem | Time | Space | Shape |
|---------|------|-------|-------|
| Maximum Depth | O(n) | O(h) | bottom-up |
| Same Tree | O(min(m, n)) | O(h) | lockstep |
| Invert Binary Tree | O(n) | O(h) | bottom-up |
| Path Sum | O(n) | O(h) | top-down |

`h` is the tree height: O(log n) for a balanced tree, O(n) for a fully skewed tree. The recursion stack is the space cost.

## Watch out

- If you read `root.val` before you check `root is None`, the function raises `AttributeError`. Start every tree function with the `None` case.
- A `None` child is not a leaf. A leaf is a node with no children.
- `has_path_sum(None, 0)` returns `False`. An empty tree has no root-to-leaf paths.
- A node with one child is not a leaf. The path continues through the existing child.
- Values can be negative. Do not stop when the running sum passes the target, because a later −5 can bring it back.
- Max Path Sum must start its best value at `float("-inf")`, not 0. An all-negative tree still picks a node.
- Same Tree compares shape and values. `[1, 2]` and `[1, None, 2]` have equal values but different shapes.
- `root.left = root.right` followed by `root.right = root.left` loses a subtree. Swap with tuple assignment.
- Depth here counts nodes, not edges. A single-node tree has depth 1.
- Recursion depth equals tree height. Python stops at about 1000 frames by default (`sys.getrecursionlimit()`). A chain of a few thousand nodes raises `RecursionError`.
- Know that an iterative rewrite with an explicit stack exists, even when you do not write it.

## Problem walkthroughs

### Maximum Depth of Binary Tree ★

**Problem.** Return the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.

**Example.**

```text
[3,9,20,None,None,15,7] → 3
[1,None,2]              → 2
```

**Steps.**
1. Base case: `root is None` returns 0.
2. Recurse on both children and return `1 + max(left_depth, right_depth)`.
3. That is the whole function. The longest path through the root goes through the deeper child, plus the root itself.

**Complexity.** O(n) time / O(h) recursion stack.

### Same Tree ★

**Problem.** Given two trees `p` and `q`, return `True` if they have the same shape and equal values at every position.

**Example.**

```text
[1,2,3] vs [1,2,3]    → True
# Same values, mirrored shape
[1,2]   vs [1,None,2] → False
```

**Steps.**
1. Both `None`: return `True`. Two empty trees match.
2. Exactly one `None`: return `False`. The shapes differ.
3. Values differ: return `False`.
4. Otherwise recurse in lockstep on the left pair and the right pair. The `and` stops at the first mismatch, so unequal trees exit early.

**Complexity.** O(min(m, n)) time / O(h) space.

### Invert Binary Tree ★

**Problem.** Mirror the tree in place: swap the left and right subtrees of every node. Return the root.

**Example.**

```text
[4,2,7,1,3,6,9] → [4,7,2,9,6,3,1]
[2,1,3]         → [2,3,1]
```

**Steps.**
1. Base case: `root is None` returns `None`.
2. Swap the children with tuple assignment: `root.left, root.right = root.right, root.left`.
3. Recurse into both swapped children. The order of swap and recursion does not matter, if each node swaps exactly once.
4. Return `root` so that calls compose. `root.left = invert_tree(root.left)` is also a valid style.

**Complexity.** O(n) time / O(h) space, one swap per node.

### Symmetric Tree

**Problem.** Return `True` if the tree is a mirror of itself around its center.

**Example.**

```text
[1,2,2,3,4,4,3]       → True
[1,2,2,None,3,None,3] → False
```

**Steps.**
1. Define a helper `is_mirror(a, b)` on a pair of nodes. Both `None`: `True`. One `None`: `False`. Values differ: `False`.
2. Recurse with the legs crossed: `is_mirror(a.left, b.right) and is_mirror(a.right, b.left)`. Outer children pair with outer, inner with inner.
3. The answer is `is_mirror(root.left, root.right)`. An empty tree is symmetric.
4. This is Same Tree with one comparison reflected. The point is to recognize that reuse.

**Complexity.** O(n) time / O(h) space.

### Construct Binary Tree from Preorder and Inorder Traversal

**Problem.** Rebuild a tree from its `preorder` and `inorder` traversals. All values are distinct.

**Example.**

```text
preorder = [3,9,20,15,7]
inorder  = [9,3,15,20,7]
→ [3,9,20,None,None,15,7]
```

**Steps.**
1. `preorder[0]` is always the root. Find it in `inorder`. The values left of it form the inorder of the left subtree; the values right of it form the right subtree.
2. The length of the left inorder tells you how many `preorder` entries after the root belong to the left subtree. That splits `preorder` too.
3. Recurse on the two (preorder slice, inorder slice) pairs to build the children.
4. For O(n), build a map from value to inorder index first. Then recurse on index bounds with a moving preorder cursor. Slicing lists makes the time O(n²) and creates garbage.

**Complexity.** O(n) time / O(n) space for the map, plus O(h) recursion.

### Construct Binary Tree from Inorder and Postorder Traversal

**Problem.** Do the same reconstruction from `inorder` and `postorder`. All values are distinct.

**Example.**

```text
inorder   = [9,3,15,20,7]
postorder = [9,15,7,20,3]
→ [3,9,20,None,None,15,7]
```

**Steps.**
1. The root is now the last element of `postorder`, because postorder visits the root last.
2. Split `inorder` around the root as before.
3. Read `postorder` from the end with a cursor, and build the right subtree first. Backward, postorder gives the root, then the right subtree, then the left subtree.
4. Use the same value-to-index map and the same index-bounds recursion. Only the cursor direction and the build order change.

**Complexity.** O(n) time / O(n) space for the map, plus O(h) recursion.

### Populating Next Right Pointers in Each Node II

**Problem.** Each node has a `next` pointer. Set each `next` to the nearest node to its right on the same level, or `None` if none exists. The tree is arbitrary, not perfect. Use O(1) extra space beyond the pointers.

**Example.**

```text
[1,2,3,4,5,None,7] → next chains:
1→None
2→3→None
4→5→7→None
```

**Steps.**
1. Process one level at a time. Use the `next` pointers you built for the level above in place of a BFS queue.
2. For the level you build, keep a dummy head and a `tail`. Walk `cur` across the current level through `cur.next`.
3. For each `cur`, append each child that exists: `tail.next = cur.left; tail = tail.next`, and the same for `cur.right`.
4. When `cur` runs out, move down: `cur = dummy.next`. Then reset the dummy's `next` and `tail`.
5. The dummy head answers "which node starts the next level?" It is the sentinel trick from linked lists, because each level is a linked list.

**Complexity.** O(n) time / O(1) extra space.

### Flatten Binary Tree to Linked List

**Problem.** Flatten the tree in place into a "linked list" in preorder, through the `right` pointers. Every `left` becomes `None`.

**Example.**

```text
# All links go through right pointers
[1,2,5,3,4,None,6] → 1→2→3→4→5→6
```

**Steps.**
1. Walk `curr` down the tree. If `curr.left` is `None`, move to `curr.right`.
2. Otherwise find the rightmost node of the left subtree. Preorder visits it last before the right subtree of `curr`.
3. Rewire: set that rightmost node's `right` to `curr.right`, then `curr.right = curr.left`, then `curr.left = None`.
4. Move on to `curr.right` and repeat. This is the Morris traversal trick: the predecessor search replaces the stack, so space is O(1).
5. The walk visits each node at most twice: once as `curr`, once during a predecessor search. The time stays linear.

**Complexity.** O(n) time / O(1) space. The recursive version uses O(h) space.

### Path Sum ★

**Problem.** Given `root` and `target_sum`, return `True` if the values on some root-to-leaf path sum exactly to `target_sum`. An empty tree has no paths.

**Example.**

```text
[5,4,8,11,None,13,4,7,2,None,None,None,1]
target_sum = 22 → True (5+4+11+2)
[1,2,3], target_sum = 5 → False
```

**Steps.**
1. `root is None` returns `False`. This also means an empty tree has no paths, even for `target_sum == 0`.
2. Leaf check: no left child and no right child. Return `target_sum == root.val`.
3. Otherwise recurse on both children with `target_sum - root.val`, and return the OR of the results.
4. The leaf check comes before the recursion, and it must be a real leaf check. A test at `None` accepts paths that stop at the missing side of a one-child node.

**Complexity.** O(n) time / O(h) space.

### Sum Root to Leaf Numbers

**Problem.** Each root-to-leaf path spells a number, digits top to bottom. Return the sum of all these numbers. Node values are digits 0–9.

**Example.**

```text
[1,2,3]     → 25   (12 + 13)
[4,9,0,5,1] → 1026 (495 + 491 + 40)
```

**Steps.**
1. Pass the running number down: `dfs(node, acc)`, where the new accumulator is `acc * 10 + node.val`.
2. At a leaf, return the accumulated number.
3. At an internal node, return `dfs(left) + dfs(right)`. Recurse only into children that exist, or return 0 for `None` and let the leaf check fire first for real leaves.
4. The `× 10` shift makes this top-down: a node cannot know its number without the digits above it.

**Complexity.** O(n) time / O(h) space.

### Binary Tree Maximum Path Sum

**Problem.** A path is a sequence of nodes joined by parent-child edges. It can start and end anywhere, but it cannot branch or revisit a node. Return the maximum sum of a path. Values can be negative, and the path has at least one node.

**Example.**

```text
[1,2,3]                   → 6  (2+1+3)
[-10,9,20,None,None,15,7] → 42 (15+20+7)
```

**Steps.**
1. Write `gain(node)`: the best sum of a downward path that starts at `node`. A parent can extend only that shape upward.
2. Compute `left_gain = max(gain(node.left), 0)` and the same for the right. The clamp at 0 means "take nothing from a negative subtree".
3. The best path that arches through `node` is `node.val + left_gain + right_gain`. Fold it into a `nonlocal` `best` variable in the enclosing scope. Start `best` at `float("-inf")`, because an all-negative tree must still pick a node.
4. Return `node.val + max(left_gain, right_gain)`. A downward path continues through only one child.
5. The split between the returned value (an extendable path) and the recorded value (a complete arch) is the whole problem.

**Complexity.** O(n) time / O(h) space.

### Binary Search Tree Iterator

**Problem.** Build an iterator over the inorder (ascending) traversal of a BST. `next()` returns the next value. `has_next()` says whether a value remains. Both must take O(1) average time with O(h) memory. You cannot flatten the whole tree first.

**Example.**

```text
BST [7,3,15,None,None,9,20]:
next()    → 3
next()    → 7
has_next() → True
next()    → 9
```

**Steps.**
1. Keep an explicit stack. It holds the nodes whose left subtree is done but which you have not visited yet.
2. `_push_left(node)`: from `node`, walk left and push every node. Start the iterator with `_push_left(root)`.
3. `next()`: pop a node; it is the smallest unvisited value. Before you return its value, call `_push_left(node.right)` to queue its successor chain.
4. `has_next()`: return whether the stack is non-empty.
5. Each node goes on the stack once and comes off once, so `next()` takes amortized O(1) time. The stack never exceeds the tree height. This converts recursion into an explicit stack that you can pause.

**Complexity.** Amortized O(1) per `next` / O(h) space.

### Count Complete Tree Nodes

**Problem.** Count the nodes of a complete binary tree in better than O(n). In a complete tree, every level is full except the last. The last level fills left to right.

**Example.**

```text
[1,2,3,4,5,6] → 6
[]            → 0
```

**Steps.**
1. Measure the height of the left spine (keep going `left`) and of the right spine (keep going `right`).
2. If the heights are equal, the tree is perfect. Return `(1 << h) - 1` with no traversal.
3. If not, recurse: `1 + count(root.left) + count(root.right)`.
4. At each level, completeness guarantees that at least one child is a perfect tree. So only one branch recurses: O(log n) levels × O(log n) spine measurement = O(log² n).

**Complexity.** O(log² n) time / O(log n) space.

### Lowest Common Ancestor of a Binary Tree

**Problem.** Given the root and two nodes `p` and `q` that both exist in the tree, return their lowest common ancestor. That is the deepest node that has both among its descendants. A node counts as its own descendant.

**Example.**

```text
[3,5,1,6,2,0,8,None,None,7,4]:
LCA(5, 1) → 3
LCA(5, 4) → 5
```

**Steps.**
1. Base case: if `root` is `None`, `p` or `q`, return `root`. You found nothing, or you found one of the targets.
2. Recurse into both children and keep the results `left` and `right`.
3. If both results are non-`None`, `p` and `q` are in different subtrees, so `root` is the LCA.
4. Otherwise return the non-`None` side. Either the deeper call found the LCA, or one target is an ancestor of the other and the base case returned it.
5. Compare node identity with `is`, not `==`. The search stops at `p` or `q` without exploring below. Both targets exist, so that is safe.

**Complexity.** O(n) time / O(h) space.

## Interview follow-ups

- After **Maximum Depth**: "Iteratively?" Use BFS that counts levels, or DFS with an explicit `(node, depth)` stack. "Minimum depth?" Watch the trap: the depth of a one-child node goes through the existing child, not the missing one.
- After **Invert Binary Tree**: "Without recursion?" Use a queue or stack of pending nodes, and swap the children of each node as you visit it.
- After **Path Sum**: "Return all the paths." Carry the path list and copy it on a hit. "Count paths that start anywhere." Use a prefix-sum map down the path.
- After **Lowest Common Ancestor**: "Nodes have parent pointers?" Walk both ancestor chains upward, as in the intersection of two linked lists. "It is a BST?" Descend from the root by order; the first node between `p` and `q` in value is the LCA.
- After **BST Iterator**: "Add `prev()`." Use a second stack for the right spine, or thread predecessor pointers.

## The task

Write four classic tree-recursion functions. A tree node is a `TreeNode(val, left, right)`. A missing child is `None`, and an empty tree is `None`.

```python
# The tree [3, 9, 20, None, None, 15, 7]
TreeNode(3,
    TreeNode(9),
    TreeNode(20,
        TreeNode(15), TreeNode(7)))
```

In the examples, `tree([...])` builds a tree from a level-order list. `None` marks an absent child. The list omits the children of absent nodes. The test suite builds and compares trees in this way.

1. `max_depth(root)` returns the number of nodes on the longest root-to-leaf path. Use O(n) time.
2. `is_same_tree(p, q)` returns `True` if `p` and `q` have the same shape and equal values at every position. Otherwise it returns `False`. Use O(min(m, n)) time.
3. `invert_tree(root)` mirrors the tree in place and returns the same root. It swaps the left and right subtrees of every node. Use O(n) time.
4. `has_path_sum(root, target_sum)` returns `True` if the values on some root-to-leaf path sum exactly to `target_sum`. Use O(n) time.

Edge cases:

- `max_depth`: the empty tree has depth 0. A single node has depth 1. A skewed chain has a depth equal to its node count.
- `is_same_tree`: either argument can be `None`. Two empty trees are the same. One empty tree and one non-empty tree differ.
- `is_same_tree`: two trees with the same values in a mirrored shape differ. One different leaf value makes the trees differ.
- `invert_tree`: change the given nodes. Do not build a copy.
- `invert_tree`: `None` returns `None`. A single node stays the same. A lone child moves to the other side.
- `has_path_sum`: a leaf is a node with no children. A path must end at a leaf.
- `has_path_sum`: an empty tree has no paths, so `None` returns `False`, even when `target_sum` is 0.
- `has_path_sum`: values and `target_sum` can be negative.

```python
max_depth(tree([3,9,20,None,None,15,7]))
# 3
max_depth(tree([1, None, 2, None, 3]))
# 3
max_depth(tree([1]))       # 1
max_depth(None)            # 0

is_same_tree(tree([1, 2, 3]),
    tree([1, 2, 3]))           # True
# Mirrored shape
is_same_tree(tree([1, 2]),
    tree([1, None, 2]))        # False
# Values swapped
is_same_tree(tree([1, 2, 1]),
    tree([1, 1, 2]))           # False
is_same_tree(None, None)       # True
is_same_tree(tree([1]), None)  # False

invert_tree(tree([4, 2, 7, 1, 3, 6, 9]))
# tree([4, 7, 2, 9, 6, 3, 1])
invert_tree(tree([2, 1, 3]))
# tree([2, 3, 1])
invert_tree(tree([1, 2]))
# tree([1, None, 2])
invert_tree(None)               # None

big = tree([
    5, 4, 8, 11, None, 13, 4,
    7, 2, None, None, None, 1,
])
has_path_sum(big, 22)           # True
# Paths sum to 3 and 4
has_path_sum(tree([1, 2, 3]), 5)  # False
# 1 is not a leaf
has_path_sum(tree([1, 2]), 1)   # False
has_path_sum(tree([1, 2]), 3)   # True
has_path_sum(None, 0)           # False
has_path_sum(tree([-2, None, -3]), -5)
# True
```
