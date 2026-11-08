## What you build

You write four tree functions: `maxDepth`, `isSameTree`, `invertTree` and `hasPathSum`. Each one uses structural recursion, the skill that every tree problem reduces to. This lesson builds on **Linked List Patterns**.

## Key concepts

### A tree node is a value and two child pointers

A missing child is `null`. An empty tree is `null` itself.

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
  left: {
    val: 9, left: null, right: null,
  },
  right: {
    val: 20,
    left: {
      val: 15, left: null, right: null,
    },
    right: {
      val: 7, left: null, right: null,
    },
  },
};
```

The tests describe a tree as a level-order array. `null` marks an absent child, and the array omits the children of absent nodes. The tree above is `[3, 9, 20, null, null, 15, 7]`.

### Bottom-up recursion combines the answers of the children

The function computes an answer for the subtree at `root` from the answers for `root.left` and `root.right`. The null case anchors the recursion.

```ts
function maxDepth(
  root: TreeNode | null,
): number {
  if (root === null) return 0;
  return 1 + Math.max(
    maxDepth(root.left),
    maxDepth(root.right),
  );
}
```

Depth, node counts, subtree sums and "is this subtree balanced" all use this skeleton with a different combine step. The call stack does the traversal bookkeeping for you.

### Top-down recursion passes state along the path

When the answer depends on the path from the root, pass an accumulator down. Do not combine results up.

```ts
function hasPathSum(
  root: TreeNode | null,
  targetSum: number,
): boolean {
  if (root === null) return false;
  const rest = targetSum - root.val;
  // A leaf: no children
  if (!root.left && !root.right) {
    return rest === 0;
  }
  return hasPathSum(root.left, rest)
    || hasPathSum(root.right, rest);
}
```

Each call asks the same question: "does a root-to-leaf path in this subtree sum to this target?" Sum Root to Leaf Numbers passes `acc * 10 + val` down in the same way.

### Lockstep recursion walks two trees at once

To compare two trees, recurse on a pair of nodes. Handle the null combinations first.

```ts
function isSameTree(
  p: TreeNode | null,
  q: TreeNode | null,
): boolean {
  // Both absent
  if (!p && !q) return true;
  // One absent
  if (!p || !q) return false;
  return p.val === q.val
    && isSameTree(p.left, q.left)
    && isSameTree(p.right, q.right);
}
```

Symmetric Tree is the same function with the legs crossed. It compares `a.left` with `b.right` and `a.right` with `b.left`.

### Some recursions return one value and track another

Some problems need a value that the recursion cannot return directly. In Binary Tree Maximum Path Sum, each call returns the best downward path from its node, because a parent can extend only that. A variable in the enclosing scope tracks the best arch through any node. Keeping the two roles separate is the whole difficulty of the problem.

### Complexity of the flagship problems

| Problem | Time | Space | Shape |
|---------|------|-------|-------|
| Maximum Depth | O(n) | O(h) | bottom-up |
| Same Tree | O(min(m, n)) | O(h) | lockstep |
| Invert Binary Tree | O(n) | O(h) | bottom-up |
| Path Sum | O(n) | O(h) | top-down |

`h` is the tree height: O(log n) for a balanced tree, O(n) for a fully skewed tree. The recursion stack is the space cost.

## Watch out

- If you read `root.val` before you check `root === null`, the function crashes. Start every tree function with the null case.
- A `null` child is not a leaf. A leaf is a node with no children.
- `hasPathSum(null, 0)` returns `false`. An empty tree has no root-to-leaf paths.
- A node with one child is not a leaf. The path continues through the existing child.
- Values can be negative. Do not stop when the running sum passes the target, because a later −5 can bring it back.
- Max Path Sum must start its best value at `-Infinity`, not 0. An all-negative tree still picks a node.
- Same Tree compares shape and values. `[1, 2]` and `[1, null, 2]` have equal values but different shapes.
- `root.left = root.right; root.right = root.left` loses a subtree. Swap with a temporary variable or destructuring.
- Depth here counts nodes, not edges. A single-node tree has depth 1.
- Recursion depth equals tree height. A chain of a few thousand nodes works under `tsx`; a chain of a million overflows the stack.
- Know that an iterative rewrite with an explicit stack exists, even when you do not write it.

## Problem walkthroughs

### Maximum Depth of Binary Tree ★

**Problem.** Return the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.

**Example.**

```text
[3,9,20,null,null,15,7] → 3
[1,null,2]              → 2
```

**Steps.**
1. Base case: `root === null` returns 0.
2. Recurse on both children and return `1 + max(leftDepth, rightDepth)`.
3. That is the whole function. The longest path through the root goes through the deeper child, plus the root itself.

**Complexity.** O(n) time / O(h) recursion stack.

### Same Tree ★

**Problem.** Given two trees `p` and `q`, return `true` if they have the same shape and equal values at every position.

**Example.**

```text
[1,2,3] vs [1,2,3]    → true
// Same values, mirrored shape
[1,2]   vs [1,null,2] → false
```

**Steps.**
1. Both null: return `true`. Two empty trees match.
2. Exactly one null: return `false`. The shapes differ.
3. Values differ: return `false`.
4. Otherwise recurse in lockstep on the left pair and the right pair. The `&&` stops at the first mismatch, so unequal trees exit early.

**Complexity.** O(min(m, n)) time / O(h) space.

### Invert Binary Tree ★

**Problem.** Mirror the tree in place: swap the left and right subtrees of every node. Return the root.

**Example.**

```text
[4,2,7,1,3,6,9] → [4,7,2,9,6,3,1]
[2,1,3]         → [2,3,1]
```

**Steps.**
1. Base case: `root === null` returns `null`.
2. Swap the children: `[root.left, root.right] = [root.right, root.left]`, or use a temporary variable.
3. Recurse into both swapped children. The order of swap and recursion does not matter, if each node swaps exactly once.
4. Return `root` so that calls compose. `root.left = invertTree(root.left)` is also a valid style.

**Complexity.** O(n) time / O(h) space, one swap per node.

### Symmetric Tree

**Problem.** Return `true` if the tree is a mirror of itself around its center.

**Example.**

```text
[1,2,2,3,4,4,3]       → true
[1,2,2,null,3,null,3] → false
```

**Steps.**
1. Define a helper `isMirror(a, b)` on a pair of nodes. Both null: `true`. One null: `false`. Values differ: `false`.
2. Recurse with the legs crossed: `isMirror(a.left, b.right) && isMirror(a.right, b.left)`. Outer children pair with outer, inner with inner.
3. The answer is `isMirror(root.left, root.right)`. An empty tree is symmetric.
4. This is Same Tree with one comparison reflected. The point is to recognize that reuse.

**Complexity.** O(n) time / O(h) space.

### Construct Binary Tree from Preorder and Inorder Traversal

**Problem.** Rebuild a tree from its `preorder` and `inorder` traversals. All values are distinct.

**Example.**

```text
preorder = [3,9,20,15,7]
inorder  = [9,3,15,20,7]
→ [3,9,20,null,null,15,7]
```

**Steps.**
1. `preorder[0]` is always the root. Find it in `inorder`. The values left of it form the inorder of the left subtree; the values right of it form the right subtree.
2. The length of the left inorder tells you how many `preorder` entries after the root belong to the left subtree. That splits `preorder` too.
3. Recurse on the two (preorder slice, inorder slice) pairs to build the children.
4. For O(n), build a map from value to inorder index first. Then recurse on index bounds with a moving preorder cursor. Slicing arrays makes the time O(n²) and creates garbage.

**Complexity.** O(n) time / O(n) space for the map, plus O(h) recursion.

### Construct Binary Tree from Inorder and Postorder Traversal

**Problem.** Do the same reconstruction from `inorder` and `postorder`. All values are distinct.

**Example.**

```text
inorder   = [9,3,15,20,7]
postorder = [9,15,7,20,3]
→ [3,9,20,null,null,15,7]
```

**Steps.**
1. The root is now the last element of `postorder`, because postorder visits the root last.
2. Split `inorder` around the root as before.
3. Read `postorder` from the end with a cursor, and build the right subtree first. Backward, postorder gives the root, then the right subtree, then the left subtree.
4. Use the same value-to-index map and the same index-bounds recursion. Only the cursor direction and the build order change.

**Complexity.** O(n) time / O(n) space for the map, plus O(h) recursion.

### Populating Next Right Pointers in Each Node II

**Problem.** Each node has a `next` pointer. Set each `next` to the nearest node to its right on the same level, or `null` if none exists. The tree is arbitrary, not perfect. Use O(1) extra space beyond the pointers.

**Example.**

```text
[1,2,3,4,5,null,7] → next chains:
1→null
2→3→null
4→5→7→null
```

**Steps.**
1. Process one level at a time. Use the `next` pointers you built for the level above in place of a BFS queue.
2. For the level you build, keep a dummy head and a `tail`. Walk `cur` across the current level through `cur.next`.
3. For each `cur`, append each child that exists: `tail.next = cur.left; tail = tail.next`, and the same for `cur.right`.
4. When `cur` runs out, move down: `cur = dummy.next`. Then reset the dummy's `next` and `tail`.
5. The dummy head answers "which node starts the next level?" It is the sentinel trick from linked lists, because each level is a linked list.

**Complexity.** O(n) time / O(1) extra space.

### Flatten Binary Tree to Linked List

**Problem.** Flatten the tree in place into a "linked list" in preorder, through the `right` pointers. Every `left` becomes `null`.

**Example.**

```text
// All links go through right pointers
[1,2,5,3,4,null,6] → 1→2→3→4→5→6
```

**Steps.**
1. Walk `curr` down the tree. If `curr.left` is null, move to `curr.right`.
2. Otherwise find the rightmost node of the left subtree. Preorder visits it last before the right subtree of `curr`.
3. Rewire: set that rightmost node's `right` to `curr.right`, then `curr.right = curr.left`, then `curr.left = null`.
4. Move on to `curr.right` and repeat. This is the Morris traversal trick: the predecessor search replaces the stack, so space is O(1).
5. The walk visits each node at most twice: once as `curr`, once during a predecessor search. The time stays linear.

**Complexity.** O(n) time / O(1) space. The recursive version uses O(h) space.

### Path Sum ★

**Problem.** Given `root` and `targetSum`, return `true` if the values on some root-to-leaf path sum exactly to `targetSum`. An empty tree has no paths.

**Example.**

```text
[5,4,8,11,null,13,4,7,2,null,null,null,1]
targetSum = 22 → true (5+4+11+2)
[1,2,3], targetSum = 5 → false
```

**Steps.**
1. `root === null` returns `false`. This also means an empty tree has no paths, even for `targetSum === 0`.
2. Leaf check: no left child and no right child. Return `targetSum === root.val`.
3. Otherwise recurse on both children with `targetSum - root.val`, and return the OR of the results.
4. The leaf check comes before the recursion, and it must be a real leaf check. A test at `null` accepts paths that stop at the missing side of a one-child node.

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
3. At an internal node, return `dfs(left) + dfs(right)`. Recurse only into children that exist, or return 0 for `null` and let the leaf check fire first for real leaves.
4. The `× 10` shift makes this top-down: a node cannot know its number without the digits above it.

**Complexity.** O(n) time / O(h) space.

### Binary Tree Maximum Path Sum

**Problem.** A path is a sequence of nodes joined by parent-child edges. It can start and end anywhere, but it cannot branch or revisit a node. Return the maximum sum of a path. Values can be negative, and the path has at least one node.

**Example.**

```text
[1,2,3]                   → 6  (2+1+3)
[-10,9,20,null,null,15,7] → 42 (15+20+7)
```

**Steps.**
1. Write `gain(node)`: the best sum of a downward path that starts at `node`. A parent can extend only that shape upward.
2. Compute `leftGain = max(gain(node.left), 0)` and the same for the right. The clamp at 0 means "take nothing from a negative subtree".
3. The best path that arches through `node` is `node.val + leftGain + rightGain`. Fold it into a `best` variable in the enclosing scope. Start `best` at `-Infinity`, because an all-negative tree must still pick a node.
4. Return `node.val + max(leftGain, rightGain)`. A downward path continues through only one child.
5. The split between the returned value (an extendable path) and the recorded value (a complete arch) is the whole problem.

**Complexity.** O(n) time / O(h) space.

### Binary Search Tree Iterator

**Problem.** Build an iterator over the inorder (ascending) traversal of a BST. `next()` returns the next value. `hasNext()` says whether a value remains. Both must take O(1) average time with O(h) memory. You cannot flatten the whole tree first.

**Example.**

```text
BST [7,3,15,null,null,9,20]:
next()    → 3
next()    → 7
hasNext() → true
next()    → 9
```

**Steps.**
1. Keep an explicit stack. It holds the nodes whose left subtree is done but which you have not visited yet.
2. `pushLeft(node)`: from `node`, walk left and push every node. Start the iterator with `pushLeft(root)`.
3. `next()`: pop a node; it is the smallest unvisited value. Before you return its value, call `pushLeft(node.right)` to queue its successor chain.
4. `hasNext()`: return whether the stack is non-empty.
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
2. If the heights are equal, the tree is perfect. Return `2^h − 1` with no traversal.
3. If not, recurse: `1 + count(root.left) + count(root.right)`.
4. At each level, completeness guarantees that at least one child is a perfect tree. So only one branch recurses: O(log n) levels × O(log n) spine measurement = O(log² n).

**Complexity.** O(log² n) time / O(log n) space.

### Lowest Common Ancestor of a Binary Tree

**Problem.** Given the root and two nodes `p` and `q` that both exist in the tree, return their lowest common ancestor. That is the deepest node that has both among its descendants. A node counts as its own descendant.

**Example.**

```text
[3,5,1,6,2,0,8,null,null,7,4]:
LCA(5, 1) → 3
LCA(5, 4) → 5
```

**Steps.**
1. Base case: if `root` is `null`, `p` or `q`, return `root`. You found nothing, or you found one of the targets.
2. Recurse into both children and keep the results `left` and `right`.
3. If both results are non-null, `p` and `q` are in different subtrees, so `root` is the LCA.
4. Otherwise return the non-null side. Either the deeper call found the LCA, or one target is an ancestor of the other and the base case returned it.
5. Compare node identity. The search stops at `p` or `q` without exploring below. Both targets exist, so that is safe.

**Complexity.** O(n) time / O(h) space.

## Interview follow-ups

- After **Maximum Depth**: "Iteratively?" Use BFS that counts levels, or DFS with an explicit `(node, depth)` stack. "Minimum depth?" Watch the trap: the depth of a one-child node goes through the existing child, not the missing one.
- After **Invert Binary Tree**: "Without recursion?" Use a queue or stack of pending nodes, and swap the children of each node as you visit it.
- After **Path Sum**: "Return all the paths." Carry the path array and copy it on a hit. "Count paths that start anywhere." Use a prefix-sum map down the path.
- After **Lowest Common Ancestor**: "Nodes have parent pointers?" Walk both ancestor chains upward, as in the intersection of two linked lists. "It is a BST?" Descend from the root by order; the first node between `p` and `q` in value is the LCA.
- After **BST Iterator**: "Add `prev()`." Use a second stack for the right spine, or thread predecessor pointers.

## The task

Write four classic tree-recursion functions. A tree node is a `TreeNode` object `{ val, left, right }`. A missing child is `null`, and an empty tree is `null`.

```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// The tree [3, 9, 20, null, null, 15, 7]
const t: TreeNode = {
  val: 3,
  left: {
    val: 9, left: null, right: null,
  },
  right: {
    val: 20,
    left: {
      val: 15, left: null, right: null,
    },
    right: {
      val: 7, left: null, right: null,
    },
  },
};
```

In the examples, `tree([...])` builds a tree from a level-order array. `null` marks an absent child. The array omits the children of absent nodes. The test suite builds and compares trees in this way.

1. `maxDepth(root)` returns the number of nodes on the longest root-to-leaf path. Use O(n) time.
2. `isSameTree(p, q)` returns `true` if `p` and `q` have the same shape and equal values at every position. Otherwise it returns `false`. Use O(min(m, n)) time.
3. `invertTree(root)` mirrors the tree in place and returns the same root. It swaps the left and right subtrees of every node. Use O(n) time.
4. `hasPathSum(root, targetSum)` returns `true` if the values on some root-to-leaf path sum exactly to `targetSum`. Use O(n) time.

Edge cases:

- `maxDepth`: the empty tree has depth 0. A single node has depth 1. A skewed chain has a depth equal to its node count.
- `isSameTree`: either argument can be `null`. Two empty trees are the same. One empty tree and one non-empty tree differ.
- `isSameTree`: two trees with the same values in a mirrored shape differ. One different leaf value makes the trees differ.
- `invertTree`: change the given nodes. Do not build a copy.
- `invertTree`: `null` returns `null`. A single node stays the same. A lone child moves to the other side.
- `hasPathSum`: a leaf is a node with no children. A path must end at a leaf.
- `hasPathSum`: an empty tree has no paths, so `null` returns `false`, even when `targetSum` is 0.
- `hasPathSum`: values and `targetSum` can be negative.

```ts
maxDepth(tree([3,9,20,null,null,15,7]))
// 3
maxDepth(tree([1, null, 2, null, 3])) // 3
maxDepth(tree([1]))                   // 1
maxDepth(null)                        // 0

isSameTree(tree([1, 2, 3]),
  tree([1, 2, 3]))             // true
// Mirrored shape
isSameTree(tree([1, 2]),
  tree([1, null, 2]))          // false
// Values swapped
isSameTree(tree([1, 2, 1]),
  tree([1, 1, 2]))             // false
isSameTree(null, null)         // true
isSameTree(tree([1]), null)    // false

invertTree(tree([4, 2, 7, 1, 3, 6, 9]))
// tree([4, 7, 2, 9, 6, 3, 1])
invertTree(tree([2, 1, 3]))
// tree([2, 3, 1])
invertTree(tree([1, 2]))
// tree([1, null, 2])
invertTree(null)                // null

const big = tree([
  5, 4, 8, 11, null, 13, 4,
  7, 2, null, null, null, 1,
]);
hasPathSum(big, 22)             // true
// Paths sum to 3 and 4
hasPathSum(tree([1, 2, 3]), 5)  // false
// 1 is not a leaf
hasPathSum(tree([1, 2]), 1)     // false
hasPathSum(tree([1, 2]), 3)     // true
hasPathSum(null, 0)             // false
hasPathSum(tree([-2, null, -3]), -5)
// true
```
