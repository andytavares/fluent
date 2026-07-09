# Tree BFS

## What you'll learn

Tree DFS gave you recursion down paths; this concept gives you the other traversal: breadth-first, level by level, with a queue. The one idea that matters is the **level-size snapshot** — freeze the queue length before draining a level so you know exactly where one depth ends and the next begins. With that loop in hand, level order traversal, right side view, per-level averages, and zigzag ordering are each a one-line variation on the same template.

## Key concepts

### The queue and the level-size snapshot

BFS visits nodes in order of distance from the root: the root, then both its children, then all four grandchildren, and so on. A plain queue gives you that order for free — but it does *not* tell you where level boundaries fall. The fix: at the top of each outer iteration, snapshot how many nodes are currently queued. That count is exactly one complete level, because every node queued so far is from the current depth and everything you push while draining it is from the next.

```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function levelOrder(root: TreeNode | null): number[][] {
  if (root === null) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  let head = 0;                     // index-based queue — shift() is O(n)
  while (head < queue.length) {
    const levelEnd = queue.length;  // snapshot: [head, levelEnd) is one level
    const level: number[] = [];
    while (head < levelEnd) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
```

Invariant: children pushed during the inner loop land at indexes `>= levelEnd`, so they are never consumed as part of the current level. That's the whole trick.

### Every level problem is this template plus one line

| Problem | Change to the template |
|---------|------------------------|
| Level order traversal | none — collect each level array |
| Right side view | keep only the value drained last in each level |
| Average of levels | sum the level, divide by the snapshot size |
| Zigzag level order | reverse the level array on odd depths |

Recognize this in interviews: if the problem statement says "per level", "by depth", "visible from the side", or "top to bottom", reach for the snapshot loop before anything else.

### The queue in TypeScript

TypeScript (via JavaScript arrays) has no built-in deque. `Array.prototype.shift()` re-indexes the whole array — O(n) per call, O(n²) for the traversal. Two clean alternatives:

```ts
// 1. Head index (used above): push to the tail, read with queue[head++].
//    The array only grows, but total work is O(n).

// 2. Level-swap: hold the current level in one array, collect children
//    into the next, then swap.
let current: TreeNode[] = [root];
while (current.length > 0) {
  const next: TreeNode[] = [];
  for (const node of current) {
    if (node.left) next.push(node.left);
    if (node.right) next.push(node.right);
  }
  current = next;
}
```

The level-swap form makes the snapshot implicit — the whole array *is* one level — and is often the cleanest way to write these.

### Complexity of the flagship problems

| Problem | Time | Space |
|---------|------|-------|
| Level Order Traversal | O(n) | O(w) queue, w = max level width |
| Right Side View | O(n) | O(w) |
| Zigzag Level Order | O(n) | O(w) |

The queue peaks at the widest level — up to ⌈n/2⌉ nodes for a complete tree, so O(n) worst case.

## Watch out

- **Snapshot before draining.** `for (let i = 0; i < queue.length; i++)` re-reads a length that grows as you push children — levels bleed into each other. Capture `const levelEnd = queue.length` first.
- **`shift()` is quadratic.** Fine at interview scale, but say out loud that it's O(n) per call and show the head-index or level-swap fix.
- **Guard the empty tree.** Return `[]` before touching the queue; a `null` in the queue crashes on `.left`.
- **Right side view is not the right spine.** In the tree `1 → (2, 3)` with `2.left = 4` and nothing below `3`, the view is `[1, 3, 4]` — once the right side runs out of depth, a left-subtree node becomes visible. Walking `node.right` pointers gives the wrong answer; the last node per BFS level is always right.
- **Zigzag reverses the collected level, not the queue.** Keep enqueueing left-then-right at every depth; flip only the output array. Reordering the queue corrupts every level below.
- **Push only non-null children.** Enqueueing `null` and filtering at dequeue works but doubles queue traffic and invites crashes.

## Problem walkthroughs

### Binary Tree Level Order Traversal ★

**Problem.** Given the root of a binary tree, return an array of arrays: the node values at each depth, top to bottom, left to right within a level.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [[3], [9, 20], [15, 7]]
    empty tree                       →  []

**Steps.**
1. Return `[]` for a null root. Otherwise queue the root.
2. While the queue is non-empty: snapshot `levelEnd = queue.length`, drain exactly that many nodes into a `level` array, pushing each node's non-null children as you go.
3. Push `level` onto the result after the inner loop.
4. The snapshot is the correctness argument: everything queued at the top of an iteration is one full level, and children land beyond `levelEnd`.

**Complexity.** O(n) time / O(w) space — each node is queued and drained exactly once.

### Binary Tree Right Side View ★

**Problem.** Standing to the right of a binary tree, return the values you can see, top to bottom — the rightmost node at each depth.

**Example.**

    tree 1 → (2, 3), 2.right = 5, 3.right = 4  →  [1, 3, 4]
    tree 1 → (2, 3), 2.left = 4 (3 is a leaf)  →  [1, 3, 4]

**Steps.**
1. Run the level loop; you don't need the `level` array — just the values.
2. Inside the inner loop, when draining the node at position `i === levelEnd - 1` (the last of the level), push its value to the result.
3. Children are enqueued left-to-right, so within a level the queue preserves left-to-right order — the last drained node is the rightmost one at that depth, whichever subtree it lives in.
4. Note the second example: the deepest visible node (`4`) hangs off the *left* child. That's why this is a BFS problem, not a walk down `right` pointers.

**Complexity.** O(n) time / O(w) space.

### Average of Levels in Binary Tree

**Problem.** Return an array where element `i` is the average of the node values at depth `i`.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [3, 14.5, 11]

**Steps.**
1. Same level loop; instead of collecting values, keep a running `sum` across the inner loop.
2. After draining the level, push `sum / levelEnd` — the snapshot doubles as the divisor, which is exactly why you took it.
3. Watch overflow in fixed-width languages (sum in a 64-bit accumulator); in TypeScript, plain numbers are exact until sums exceed 2⁵³.

**Complexity.** O(n) time / O(w) space.

### Binary Tree Zigzag Level Order Traversal ★

**Problem.** Return the level order traversal, but alternate direction per level: level 0 left-to-right, level 1 right-to-left, level 2 left-to-right, and so on.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [[3], [20, 9], [15, 7]]

**Steps.**
1. Run the plain level loop, always enqueueing children left-then-right — traversal order never changes.
2. Track the depth (or a `leftToRight` boolean you flip each level).
3. On right-to-left levels, reverse the collected `level` array before pushing it — or, to skip the reverse, write each value into a pre-sized array at index `levelEnd - 1 - i`.
4. The insight: zigzag is a *presentation* change, not a *traversal* change. Solutions that mess with queue order break because children of a reversed level would be discovered in the wrong order for the level after it.

**Complexity.** O(n) time / O(w) space — the reverse costs O(levelSize), already paid for by draining it.

## Interview follow-ups

- After **Right Side View**: "Left side view?" (keep `i === 0` instead of the last). "Do it with DFS?" (visit right child first, record a value whenever `depth === result.length` — the first arrival at each depth is the rightmost node.)
- After **Level Order**: "Bottom-up level order?" (collect normally, reverse the result — don't traverse upside down.)
- After **Zigzag**: "Avoid the reverse?" (write into a pre-sized array back-to-front.)
- General: "Why BFS over DFS here?" — DFS with a depth parameter can group by level too (append to `result[depth]`), but BFS finds level boundaries without bookkeeping and its memory is bounded by tree *width* instead of *height*, which matters for deep, narrow trees.

## The task

Three level-by-level traversals over binary trees. Trees are plain objects — every node is `{ val, left, right }` where `left`/`right` are child nodes or `null`; an empty tree is `null` itself.

```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// The tree used in the samples below:
//        3
//       / \
//      9  20
//         / \
//        15  7
const t: TreeNode = {
  val: 3,
  left: { val: 9, left: null, right: null },
  right: {
    val: 20,
    left: { val: 15, left: null, right: null },
    right: { val: 7, left: null, right: null },
  },
};
```

### `levelOrder(root: TreeNode | null): number[][]`

Return an array of arrays: the node values at each depth, top to bottom, left to right within each level. An empty tree returns `[]`.

```ts
levelOrder(t);                                    // [[3], [9, 20], [15, 7]]
levelOrder({ val: 1, left: null, right: null });  // [[1]]
levelOrder(null);                                 // []
```

Edge cases: empty tree, single node, skewed trees (every level has one node), negative values.

### `rightSideView(root: TreeNode | null): number[]`

Return the values visible from the right side of the tree, top to bottom — the rightmost node at each depth. A node in a *left* subtree is visible when nothing at its depth exists further right. An empty tree returns `[]`.

```ts
rightSideView(t);     // [3, 20, 7]
rightSideView(null);  // []

// 1 → (2, 3), where 2.left = 4 and 3 is a leaf: depth 2 only contains 4
const u: TreeNode = {
  val: 1,
  left: { val: 2, left: { val: 4, left: null, right: null }, right: null },
  right: { val: 3, left: null, right: null },
};
rightSideView(u);     // [1, 3, 4]
```

Edge cases: empty tree, single node, right-only and left-only chains, deeper nodes hanging off left subtrees (the `[1, 3, 4]` case above — do not just follow `right` pointers).

### `zigzagLevelOrder(root: TreeNode | null): number[][]`

Return the level order traversal with alternating direction: level 0 left-to-right, level 1 right-to-left, and so on. An empty tree returns `[]`.

```ts
zigzagLevelOrder(t);     // [[3], [20, 9], [15, 7]]
zigzagLevelOrder(null);  // []
```

Edge cases: empty tree, single node, levels with one node (reversing changes nothing), trees deep enough to flip direction several times.
