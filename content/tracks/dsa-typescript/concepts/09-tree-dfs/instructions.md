# Binary Tree

## What you'll learn

Structural recursion on binary trees — the skill this whole group reduces to. You'll learn the two shapes tree recursion takes (bottom-up: combine the children's answers; top-down: thread an accumulator along the path), lockstep recursion over two trees at once, and the "return one thing, track another" pattern behind Binary Tree Maximum Path Sum. The fourteen problems here range from four-line classics (Maximum Depth, Invert) to genuine hard-mode material (Max Path Sum, BST Iterator, Count Complete Tree Nodes in O(log² n)).

## Key concepts

### The node representation

Every tree node here is a typed object with a value and two child pointers; missing children are `null`, and an empty tree is `null` itself:

```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

//     3
//    / \
//   9  20
//      / \
//     15  7
const root: TreeNode = {
  val: 3,
  left: { val: 9, left: null, right: null },
  right: {
    val: 20,
    left: { val: 15, left: null, right: null },
    right: { val: 7, left: null, right: null },
  },
};
```

Tests describe trees as **level-order arrays** with `null` marking absent children (children of absent nodes are omitted): the tree above is `[3, 9, 20, null, null, 15, 7]`.

### Bottom-up recursion — an answer per subtree

The most common shape: the function computes something about the whole subtree rooted at `root` by combining the answers for `root.left` and `root.right`. The null case anchors everything:

```ts
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

Depth, node counts, subtree sums, "is this subtree balanced/a BST" — all the same skeleton with a different combine step. The call stack does the traversal bookkeeping for you.

### Top-down recursion — state threaded along the path

When the answer depends on the *path from the root* rather than the subtree below, pass an accumulator down instead of combining results up:

```ts
function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (root === null) return false;
  if (root.left === null && root.right === null) return targetSum === root.val; // leaf
  return hasPathSum(root.left, targetSum - root.val)
      || hasPathSum(root.right, targetSum - root.val);
}
```

Subtracting on the way down means each call asks the same-shaped question: "does a root-to-leaf path in *this* subtree sum to *this* target?" Sum Root to Leaf Numbers threads `acc * 10 + val` the same way.

### Lockstep recursion — two trees at once

Comparing trees means recursing on a *pair* of nodes and enumerating the null combinations first:

```ts
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (p === null && q === null) return true;   // both absent
  if (p === null || q === null) return false;  // one absent
  return p.val === q.val
      && isSameTree(p.left, q.left)
      && isSameTree(p.right, q.right);
}
```

Symmetric Tree is the same function with the legs crossed: compare `a.left` with `b.right` and `a.right` with `b.left`.

### Return one thing, track another

Some problems need a value the recursion can't return directly. Binary Tree Maximum Path Sum returns "best *downward* path starting here" from each call — that's what a parent can extend — while updating a best-seen-anywhere variable in the enclosing scope for the arch through each node. Keeping the two roles separate is the entire difficulty of the problem.

### Complexity of the flagship problems

| Problem | Time | Space | Shape |
|---------|------|-------|-------|
| Maximum Depth | O(n) | O(h) | bottom-up |
| Same Tree | O(min(m, n)) | O(h) | lockstep |
| Invert Binary Tree | O(n) | O(h) | bottom-up |
| Path Sum | O(n) | O(h) | top-down |

`h` is the tree height: O(log n) balanced, O(n) fully skewed — the recursion stack is your space cost.

## Watch out

- **Null check first.** Touch `root.val` before checking `root === null` and the whole suite crashes. Every tree function starts with the null case.
- **A leaf is a node with no children.** Reaching `null` is *not* reaching a leaf: `hasPathSum(null, 0)` must be `false` (an empty tree has no root-to-leaf paths), and a node with one child is not a leaf — the path must continue through the existing child.
- **Values can be negative.** No pruning like "stop when the running sum exceeds the target" — a later −5 can rescue the path. Max Path Sum must initialize its best to `-Infinity`, not 0.
- **Same Tree compares structure *and* values.** `[1, 2]` vs `[1, null, 2]` have equal traversal *values* but different shapes — the one-null case must return `false`.
- **Swap with a temp (or destructuring) when inverting.** `root.left = root.right; root.right = root.left` loses a subtree.
- **Depth counts nodes here, not edges.** A single-node tree has depth 1. Off-by-one between the two conventions is a classic interview stumble.
- **Recursion depth equals tree height.** A few thousand nodes in a chain is fine under `tsx`; a million is not — know the iterative rewrite (explicit stack) exists even if you don't write it.

## Problem walkthroughs

### Maximum Depth of Binary Tree ★

**Problem.** Return the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.

**Example.**

    [3,9,20,null,null,15,7] → 3
    [1,null,2]              → 2

**Steps.**
1. Base case: `root === null` → 0.
2. Recurse on both children and return `1 + Math.max(leftDepth, rightDepth)`.
3. That's the whole function — the longest path through the root goes through whichever child is deeper, plus the root itself.

**Complexity.** O(n) time / O(h) recursion stack.

### Same Tree ★

**Problem.** Given two trees `p` and `q`, return `true` if they are structurally identical with equal values at every position.

**Example.**

    [1,2,3] vs [1,2,3]     → true
    [1,2]   vs [1,null,2]  → false   (same values, mirrored shape)

**Steps.**
1. Both null → `true` (two empty trees match).
2. Exactly one null → `false` (shape mismatch).
3. Values differ → `false`.
4. Otherwise recurse in lockstep: `isSameTree(p.left, q.left) && isSameTree(p.right, q.right)`. The `&&` short-circuits on the first mismatch, so unequal trees exit early.

**Complexity.** O(min(m, n)) time / O(h) space.

### Invert Binary Tree ★

**Problem.** Mirror the tree in place: every node's left and right subtrees swap. Return the root.

**Example.**

    [4,2,7,1,3,6,9] → [4,7,2,9,6,3,1]
    [2,1,3]         → [2,3,1]

**Steps.**
1. Base case: `root === null` → return `null`.
2. Swap the children: `[root.left, root.right] = [root.right, root.left]` (or use a temp).
3. Recurse into both (now-swapped) children — the order of swap vs recurse doesn't matter, as long as each node swaps exactly once.
4. Return `root` so calls compose: `root.left = invertTree(root.left)` also works as a style.

**Complexity.** O(n) time / O(h) space — one swap per node.

### Symmetric Tree

**Problem.** Return `true` if the tree is a mirror of itself around its center.

**Example.**

    [1,2,2,3,4,4,3]      → true
    [1,2,2,null,3,null,3] → false

**Steps.**
1. Define a helper `isMirror(a, b)` on a *pair* of nodes: both null → `true`; one null → `false`; values differ → `false`.
2. Recurse with the legs crossed: `isMirror(a.left, b.right) && isMirror(a.right, b.left)` — outer children pair with outer, inner with inner.
3. The answer is `isMirror(root.left, root.right)` (empty tree → `true`).
4. This is Same Tree with one comparison reflected — recognizing that reuse is the point.

**Complexity.** O(n) time / O(h) space.

### Construct Binary Tree from Preorder and Inorder Traversal

**Problem.** Rebuild a tree from its `preorder` and `inorder` traversals. All values are distinct.

**Example.**

    preorder = [3,9,20,15,7], inorder = [9,3,15,20,7] → [3,9,20,null,null,15,7]

**Steps.**
1. `preorder[0]` is always the root. Find it in `inorder`: everything left of it is the left subtree's inorder, everything right is the right subtree's.
2. The left-inorder's *length* tells you how many entries of `preorder` (after the root) belong to the left subtree — that splits `preorder` too.
3. Recurse on the two (preorder-slice, inorder-slice) pairs to build the children.
4. For O(n): precompute a value → inorder-index `Map`, and recurse on index bounds plus a moving preorder cursor instead of slicing arrays — slicing makes it O(n²) in time and garbage.

**Complexity.** O(n) time / O(n) space for the map + O(h) recursion.

### Construct Binary Tree from Inorder and Postorder Traversal

**Problem.** Same reconstruction, but from `inorder` and `postorder`. All values distinct.

**Example.**

    inorder = [9,3,15,20,7], postorder = [9,15,7,20,3] → [3,9,20,null,null,15,7]

**Steps.**
1. The root is now the **last** element of `postorder` (postorder visits root last).
2. Split `inorder` around the root exactly as before.
3. Consume `postorder` from the end with a cursor, and build the **right subtree first** — walking backward through postorder yields root, then the right subtree's nodes, then the left's.
4. Same value → index map, same index-bounds recursion; only the cursor direction and build order change.

**Complexity.** O(n) time / O(n) space for the map + O(h) recursion.

### Populating Next Right Pointers in Each Node II

**Problem.** Each node gains a `next` pointer. Set every node's `next` to the nearest node to its right **on the same level**, or `null` if none exists. The tree is arbitrary (not perfect). O(1) extra space beyond the pointers themselves.

**Example.**

    [1,2,3,4,5,null,7] → next chains: 1→null; 2→3→null; 4→5→7→null

**Steps.**
1. Process one level at a time using the `next` pointers you built for the level above — that's what replaces the BFS queue.
2. For the level being built, keep a dummy head and a `tail`; walk `cur` across the current level via `cur.next`.
3. For each `cur`, append its existing children: `if (cur.left) { tail.next = cur.left; tail = tail.next; }`, same for `cur.right`.
4. When `cur` runs out, drop to the next level: `cur = dummy.next`, reset the dummy's `next` and `tail`.
5. The dummy head absorbs "which node starts the next level?" — the same sentinel trick as in linked lists, which is no accident: each level *is* a linked list.

**Complexity.** O(n) time / O(1) extra space.

### Flatten Binary Tree to Linked List

**Problem.** Flatten the tree in place into a "linked list" using the `right` pointers, in **preorder** order; every `left` becomes `null`.

**Example.**

    [1,2,5,3,4,null,6] → 1→2→3→4→5→6  (all via right pointers)

**Steps.**
1. Walk `curr` down the tree. If `curr.left` is null, just move to `curr.right`.
2. Otherwise find the **rightmost node of the left subtree** — the last node preorder visits before returning to `curr`'s right subtree.
3. Rewire: that rightmost node's `right = curr.right`; then `curr.right = curr.left`; then `curr.left = null`.
4. Move on to `curr.right` and repeat. This is the Morris-traversal trick: O(1) space because the predecessor hunt replaces the stack.
5. Each node is visited at most twice (once by `curr`, once during a predecessor hunt), so it's still linear.

**Complexity.** O(n) time / O(1) space (the recursive version is O(h)).

### Path Sum ★

**Problem.** Given `root` and `targetSum`, return `true` if some **root-to-leaf** path's values sum exactly to `targetSum`. An empty tree has no paths.

**Example.**

    [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22 → true   (5+4+11+2)
    [1,2,3], targetSum = 5                                    → false

**Steps.**
1. `root === null` → `false`. This also encodes "empty tree has no paths" — even for `targetSum === 0`.
2. Leaf check: no left *and* no right → return `targetSum === root.val`.
3. Otherwise recurse on both children with `targetSum - root.val`; return the `||`.
4. The leaf check must come before recursing, and must be a real leaf check — testing at `null` instead would accept paths that stop at a one-child node's missing side.

**Complexity.** O(n) time / O(h) space.

### Sum Root to Leaf Numbers

**Problem.** Each root-to-leaf path spells a number (digits top to bottom). Return the sum of all these numbers. Node values are digits 0–9.

**Example.**

    [1,2,3]     → 25    (12 + 13)
    [4,9,0,5,1] → 1026  (495 + 491 + 40)

**Steps.**
1. Thread the running number down: `dfs(node, acc)` where the new accumulator is `acc * 10 + node.val`.
2. At a leaf, return the accumulated number.
3. At an internal node, return `dfs(left) + dfs(right)`, treating a `null` child as contributing 0 — but only recurse into children that exist, or handle `node === null → 0` and rely on the leaf check firing first for real leaves.
4. The `× 10` shift is why this is top-down: a node cannot know its number without the digits above it.

**Complexity.** O(n) time / O(h) space.

### Binary Tree Maximum Path Sum

**Problem.** A path is any sequence of nodes connected by parent-child edges — it may start and end anywhere, but cannot branch or revisit. Return the maximum possible sum of a path's values. Values may be negative; the path has at least one node.

**Example.**

    [1,2,3]                     → 6    (2 + 1 + 3)
    [-10,9,20,null,null,15,7]   → 42   (15 + 20 + 7)

**Steps.**
1. Write `gain(node)`: the best sum of a **downward** path starting at `node` — that's the only shape a parent can extend upward.
2. Compute `leftGain = Math.max(gain(node.left), 0)` and the same for the right — clamping at 0 is "taking nothing from a negative subtree."
3. The best path **arching through** `node` is `node.val + leftGain + rightGain`; fold it into a `best` variable in the enclosing scope (initialize to `-Infinity` — all-negative trees must still pick a node).
4. Return `node.val + Math.max(leftGain, rightGain)` — a downward path can continue through only one child.
5. The split between what's *returned* (extendable path) and what's *recorded* (complete arch) is the entire problem.

**Complexity.** O(n) time / O(h) space.

### Binary Search Tree Iterator

**Problem.** Build an iterator over a BST's inorder (ascending) traversal: `next()` returns the next value, `hasNext()` says whether one remains. Both must average O(1) time with O(h) memory — you may not flatten the whole tree upfront.

**Example.**

    BST [7,3,15,null,null,9,20]: next()→3, next()→7, hasNext()→true, next()→9 …

**Steps.**
1. Keep an explicit stack holding the path of "nodes whose left subtree is done but who haven't been visited."
2. `pushLeft(node)`: from `node`, walk left pushing every node. Initialize the iterator with `pushLeft(root)`.
3. `next()`: pop a node — it's the smallest unvisited. Before returning its value, `pushLeft(node.right)` to queue up its successor chain.
4. `hasNext()`: stack non-empty.
5. Each node is pushed and popped exactly once across the whole iteration, so `next()` is amortized O(1); the stack never exceeds the tree height. This is recursion converted to a *pausable* explicit stack.

**Complexity.** Amortized O(1) per `next` / O(h) space.

### Count Complete Tree Nodes

**Problem.** Count the nodes of a **complete** binary tree (every level full except possibly the last, which fills left to right) in better than O(n).

**Example.**

    [1,2,3,4,5,6] → 6
    []            → 0

**Steps.**
1. Measure the tree's left spine (keep going `left`) and right spine (keep going `right`) heights.
2. If they're equal, the tree is *perfect*: return `2^h − 1` directly — no traversal.
3. If not, recurse: `1 + count(root.left) + count(root.right)`.
4. Why it's fast: at every level of recursion, at least one of the two children is a perfect tree (completeness guarantees it), so only one branch actually recurses. O(log n) levels × O(log n) spine measurement = O(log² n).

**Complexity.** O(log² n) time / O(log n) space.

### Lowest Common Ancestor of a Binary Tree

**Problem.** Given the root and two nodes `p` and `q` that both exist in the tree, return their lowest common ancestor — the deepest node that has both among its descendants (a node counts as its own descendant).

**Example.**

    [3,5,1,6,2,0,8,null,null,7,4]: LCA(5, 1) → 3;  LCA(5, 4) → 5

**Steps.**
1. Base case: if `root` is `null`, or `root === p`, or `root === q`, return `root` — you've found nothing, or found one of the targets.
2. Recurse into both children; collect `left` and `right`.
3. If both came back non-null, `p` and `q` live in different subtrees — `root` is the LCA.
4. Otherwise return whichever side is non-null (both targets are down there, and the deeper call already identified their LCA — or one target is an ancestor of the other, covered by the base case returning early).
5. Compare node *identity*, and note the search legitimately stops at `p` or `q` without exploring below — since both are guaranteed present, that's safe.

**Complexity.** O(n) time / O(h) space.

## Interview follow-ups

- After **Maximum Depth**: "Iteratively?" — BFS counting levels, or DFS with an explicit `(node, depth)` stack. "Minimum depth?" — beware the trap: a one-child node's depth goes through the existing child, not the missing one.
- After **Invert Binary Tree**: "Without recursion?" — a queue or stack of pending nodes; swap children as each node is visited.
- After **Path Sum**: "Return all the paths" (carry the path array, copy on hit) or "count paths that don't need to start at the root" (prefix-sum map down the path).
- After **Lowest Common Ancestor**: "Nodes have parent pointers?" — walk both ancestors upward like finding the intersection of two linked lists. "It's a BST?" — descend from the root using ordering; first node between `p` and `q` in value is the LCA.
- After **BST Iterator**: "Add `prev()`" — a second stack for the right spine, or thread predecessor pointers.

## The task

Four tree-recursion classics. Every tree node is `{ val, left, right }`; missing children are `null`, and an empty tree is `null` itself:

```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// The tree [3, 9, 20, null, null, 15, 7]:
const t: TreeNode = {
  val: 3,
  left: { val: 9, left: null, right: null },
  right: { val: 20,
           left: { val: 15, left: null, right: null },
           right: { val: 7, left: null, right: null } },
};
```

In the samples, `tree([...])` builds a tree from a **level-order array** where `null` marks an absent child and children of absent nodes are omitted — the test suite constructs and compares trees exactly this way.

### `maxDepth(root: TreeNode | null): number`

Return the number of nodes on the longest root-to-leaf path. The empty tree has depth 0; a single node has depth 1. O(n) time.

```ts
maxDepth(tree([3, 9, 20, null, null, 15, 7])); // 3
maxDepth(tree([1, null, 2]));                  // 2
maxDepth(null);                                // 0
```

Edge cases: empty tree, single node, a skewed chain (depth = node count).

### `isSameTree(p: TreeNode | null, q: TreeNode | null): boolean`

Return `true` if trees `p` and `q` are structurally identical with equal values at every position; `false` otherwise. Either argument may be `null`. O(min(m, n)) time.

```ts
isSameTree(tree([1, 2, 3]), tree([1, 2, 3])); // true
isSameTree(tree([1, 2]), tree([1, null, 2])); // false  (mirrored shape)
isSameTree(tree([1, 2, 1]), tree([1, 1, 2])); // false  (values swapped)
isSameTree(null, null);                       // true
```

Edge cases: both empty (`true`), exactly one empty (`false`), same shape with one differing leaf value, mirrored shapes with identical value multisets.

### `invertTree(root: TreeNode | null): TreeNode | null`

Mirror the tree **in place** — swap every node's left and right subtrees — and return the root of the same tree you were given (mutate the given nodes; don't build a copy). O(n) time.

```ts
invertTree(tree([4, 2, 7, 1, 3, 6, 9])); // tree([4, 7, 2, 9, 6, 3, 1])
invertTree(tree([2, 1, 3]));             // tree([2, 3, 1])
invertTree(null);                        // null
```

Edge cases: empty tree (`null` in, `null` out), single node (unchanged), one-sided nodes (the lone child switches sides).

### `hasPathSum(root: TreeNode | null, targetSum: number): boolean`

Return `true` if some **root-to-leaf** path's values sum exactly to `targetSum`. A leaf is a node with no children; an empty tree has no paths at all, so the answer for `null` is always `false` — even when `targetSum` is 0. Values (and `targetSum`) may be negative. O(n) time.

```ts
hasPathSum(tree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]), 22); // true
hasPathSum(tree([1, 2, 3]), 5); // false  (paths sum to 3 and 4)
hasPathSum(tree([1, 2]), 1);    // false  (1 is not a leaf — the path continues)
hasPathSum(null, 0);            // false
```

Edge cases: empty tree, single node equal / not equal to `targetSum`, one-child nodes (the path must reach the real leaf), negative values that make a path sum come back down to the target.
