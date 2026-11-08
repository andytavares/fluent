## What you build

You write three breadth-first traversals of a binary tree: level order, right side view and zigzag level order. Each one visits the tree level by level with a queue. This lesson builds on **Tree DFS**.

## Key concepts

The stub defines `TreeNode` as `{ val, left, right }`, with `null` for a missing child.

### BFS visits nodes in order of distance from the root

Breadth-first search (BFS) visits the root, then its children, then its grandchildren. A queue gives this order. Depth-first search follows one path down; BFS covers one whole level before the next.

### A level-size snapshot marks where each level ends

A queue alone does not show where one level ends. At the top of each outer loop, store the queue length. That count is exactly one level. Every node in the queue is at the current depth. Each child you push belongs to the next depth.

```ts
function levelOrder(
  root: TreeNode | null,
): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  // Index-based queue: shift() is O(n)
  let head = 0;
  while (head < queue.length) {
    // [head, levelEnd) is one level
    const levelEnd = queue.length;
    const level: number[] = [];
    while (head < levelEnd) {
      const node = queue[head++];
      level.push(node.val);
      const { left, right } = node;
      if (left) queue.push(left);
      if (right) queue.push(right);
    }
    result.push(level);
  }
  return result;
}
```

The invariant: children pushed in the inner loop land at indexes `>= levelEnd`. The inner loop never reads them as part of the current level.

### Each level problem is the template plus one change

| Problem | Change to the template |
|---------|------------------------|
| Level order traversal | none: collect each level array |
| Right side view | keep only the last value of each level |
| Average of levels | sum the level, divide by the snapshot size |
| Zigzag level order | reverse the level array on odd depths |

In an interview, look for "per level", "by depth", "visible from the side" or "top to bottom". These words point to the snapshot loop.

### A queue needs O(1) removal from the front

TypeScript has no built-in double-ended queue. `Array.prototype.shift()` moves every remaining element, so it costs O(n) per call and O(n²) for the traversal. Two alternatives keep the traversal O(n).

```ts
// 1. Head index (used above): push to the
//    tail, read with queue[head++]. The
//    array only grows; total work is O(n).

// 2. Level swap: hold the current level in
//    one array, collect the children into
//    the next one, then swap.
let current: TreeNode[] = [root];
while (current.length) {
  const next: TreeNode[] = [];
  for (const node of current) {
    if (node.left) next.push(node.left);
    if (node.right) next.push(node.right);
  }
  current = next;
}
```

The level-swap form makes the snapshot implicit, because the whole array is one level. Many solutions to these problems use it.

### Complexity of the main problems

| Problem | Time | Space |
|---------|------|-------|
| Level Order Traversal | O(n) | O(w) |
| Right Side View | O(n) | O(w) |
| Zigzag Level Order | O(n) | O(w) |

`w` is the largest level width. The queue peaks at the widest level. A complete tree has up to ⌈n/2⌉ nodes in its last level, so the worst case is O(n).

## Watch out

- `i < queue.length` re-reads a length that grows as you push. Levels then mix. Store `levelEnd` first.
- `shift()` costs O(n) per call. At interview scale it works, but say so and show the head-index or level-swap fix.
- A `null` root in the queue crashes on `.left`. Return `[]` for an empty tree before you use the queue.
- The right side view is not the right spine. Following `right` pointers misses left-subtree nodes that are visible below a short right side.
- In the tree `1 → (2, 3)` with `2.left = 4`, the view is `[1, 3, 4]`. The last node of each BFS level is always correct.
- Zigzag reverses the collected level, not the queue. Reordering the queue corrupts every level below it.
- Push only non-null children. Pushing `null` and filtering at removal doubles queue traffic and invites crashes.

## Problem walkthroughs

### Binary Tree Level Order Traversal ★

**Problem.** Given the root of a binary tree, return an array of arrays. Each inner array holds the values at one depth, top to bottom, left to right.

**Example.**

```text
3 → (9, 20), 20 → (15, 7)
  → [[3], [9, 20], [15, 7]]
empty tree → []
```

**Steps.**
1. Return `[]` for a null root. Otherwise, put the root in the queue.
2. While the queue is not empty, store `levelEnd = queue.length`. Remove exactly that many nodes into a `level` array. Push each node's non-null children as you go.
3. After the inner loop, push `level` onto the result.
4. The snapshot is the proof of correctness. The queue at the top of an iteration is one full level, and children land after `levelEnd`.

**Complexity.** O(n) time, O(w) space. Each node enters and leaves the queue exactly once.

### Binary Tree Right Side View ★

**Problem.** You stand to the right of a binary tree. Return the values you can see, top to bottom: the rightmost node at each depth.

**Example.**

```text
1 → (2, 3), 2.right = 5, 3.right = 4
  → [1, 3, 4]
1 → (2, 3), 2.left = 4, 3 is a leaf
  → [1, 3, 4]
```

**Steps.**
1. Run the level loop. You do not need the `level` array, only the values.
2. In the inner loop, push the value of the node at position `i === levelEnd - 1`, the last of the level.
3. Children enter the queue left to right, so the queue keeps left-to-right order within a level. The last node removed is the rightmost at that depth, in either subtree.
4. In the second example, the deepest visible node (`4`) hangs off the left child. That is why this is a BFS problem, not a walk down `right` pointers.

**Complexity.** O(n) time, O(w) space.

### Average of Levels in Binary Tree

**Problem.** Return an array where element `i` is the average of the node values at depth `i`.

**Example.**

```text
3 → (9, 20), 20 → (15, 7)
  → [3, 14.5, 11]
```

**Steps.**
1. Use the same level loop. In place of the value list, keep a running `sum` in the inner loop.
2. After the level, push `sum / levelEnd`. The snapshot is also the divisor.
3. In languages with fixed-width integers, sum into a 64-bit accumulator to avoid overflow. TypeScript `number` values hold integers exactly up to 2⁵³.

**Complexity.** O(n) time, O(w) space.

### Binary Tree Zigzag Level Order Traversal ★

**Problem.** Return the level order traversal with alternating direction. Level 0 goes left to right, level 1 right to left, level 2 left to right, and so on.

**Example.**

```text
3 → (9, 20), 20 → (15, 7)
  → [[3], [20, 9], [15, 7]]
```

**Steps.**
1. Run the plain level loop. Always push children left, then right. The traversal order never changes.
2. Track the depth, or a `leftToRight` flag that you flip at each level.
3. On right-to-left levels, reverse the `level` array before you push it. To skip the reverse, write each value into a pre-sized array at index `levelEnd - 1 - i`.
4. Zigzag is a change to the output, not to the traversal. If you change the queue order, the next level comes out in the wrong order.

**Complexity.** O(n) time, O(w) space. The reverse costs O(level size), which the level already costs.

## Interview follow-ups

- After **Right Side View**: "Left side view?" Keep the node at `i === 0` in place of the last one.
- After **Right Side View**: "Do it with DFS?" Visit the right child first. Record a value when `depth === result.length`, because the first visit to each depth is the rightmost node.
- After **Level Order**: "Bottom-up level order?" Collect the levels normally, then reverse the result.
- After **Zigzag**: "Avoid the reverse?" Write into a pre-sized array from back to front.
- General: "Why BFS over DFS here?" DFS with a depth parameter can also group by level, with `result[depth]`. BFS finds level boundaries without this bookkeeping.
- BFS memory depends on the tree width, and DFS memory on the tree height. For deep, narrow trees, this difference matters.

## The task

Write three level-by-level traversals of a binary tree.

1. Each node is a `TreeNode` object `{ val, left, right }`.
2. `left` and `right` are child nodes or `null`. An empty tree is `null`.
3. `levelOrder(root)` returns an array of arrays: the values at each depth.
4. Depths go top to bottom. Values in a depth go left to right.
5. `rightSideView(root)` returns the rightmost value at each depth, top to bottom.
6. `zigzagLevelOrder(root)` returns the level order with alternating direction.
7. Level 0 goes left to right, level 1 right to left, and so on.
8. Each function runs in O(n) time.

Each function returns `[]` for an empty tree. A left-subtree node is visible from the right when no node at its depth is further right. A level with one node is the same in both directions.

In the examples, `tree([...])` builds a tree from a level-order array. `null` marks an absent child. The array omits the children of absent nodes.

```ts
levelOrder(
  tree([3, 9, 20, null, null, 15, 7]));
// [[3], [9, 20], [15, 7]]
levelOrder(tree([1]));
// [[1]]
levelOrder(tree([1, null, 2, null, 3]));
// [[1], [2], [3]]
levelOrder(null);
// []

rightSideView(
  tree([1, 2, 3, null, 5, null, 4]));
// [1, 3, 4]
// 2.left = 4, and 3 is a leaf:
rightSideView(tree([1, 2, 3, 4]));
// [1, 3, 4]
rightSideView(tree([1, 2, null, 3]));
// [1, 2, 3]
rightSideView(null);
// []

zigzagLevelOrder(
  tree([3, 9, 20, null, null, 15, 7]));
// [[3], [20, 9], [15, 7]]
zigzagLevelOrder(
  tree([1, 2, 3, 4, 5, 6, 7]));
// [[1], [3, 2], [4, 5, 6, 7]]
zigzagLevelOrder(null);
// []
```
