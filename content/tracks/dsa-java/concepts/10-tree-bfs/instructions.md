## What you build

You write three breadth-first traversals of a binary tree: level order, right side view and zigzag level order. Each one visits the tree level by level with a queue. This lesson builds on **Binary Tree**.

## Key concepts

### BFS visits nodes in order of distance from the root

Breadth-first search (BFS) visits the root, then its children, then its grandchildren. A queue gives this order. Depth-first search follows one path down; BFS covers one whole level before the next.

### A level-size snapshot marks where each level ends

A queue alone does not show where one level ends. At the top of each outer loop, store the queue size. That count is exactly one level. Every node in the queue is at the current depth. Each child you push belongs to the next depth.

```java
static List<List<Integer>> levelOrder(
        TreeNode root) {
    List<List<Integer>> result =
        new ArrayList<>();
    if (root == null) return result;
    Deque<TreeNode> queue =
        new ArrayDeque<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        // levelSize nodes: one level
        int levelSize = queue.size();
        List<Integer> level =
            new ArrayList<>();
        for (int i = 0; i < levelSize;
                i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null)
                queue.offer(node.left);
            if (node.right != null)
                queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}
```

The invariant: the loop bound `levelSize` is fixed before the inner loop pushes any child. The inner loop never reads those children as part of the current level.

### Each level problem is the template plus one change

| Problem | Change to the template |
|---------|------------------------|
| Level order traversal | none: collect each level list |
| Right side view | keep only the last value of each level |
| Average of levels | sum the level, divide by the snapshot size |
| Zigzag level order | reverse the level list on odd depths |

In an interview, look for "per level", "by depth", "visible from the side" or "top to bottom". These words point to the snapshot loop.

### A queue needs O(1) removal from the front

`ArrayList.remove(0)` moves every remaining element, so it costs O(n) per call and O(n²) for the traversal. Two alternatives keep the traversal O(n).

```java
// 1. ArrayDeque (used above): offer() to
//    the tail, poll() from the head. Both
//    are O(1).

// 2. Level swap: hold the current level in
//    one list, collect the children into
//    the next one, then swap.
List<TreeNode> current = List.of(root);
while (!current.isEmpty()) {
    List<TreeNode> next =
        new ArrayList<>();
    for (TreeNode node : current) {
        if (node.left != null)
            next.add(node.left);
        if (node.right != null)
            next.add(node.right);
    }
    current = next;
}
```

The level-swap form makes the snapshot implicit, because the whole list is one level. Many solutions to these problems use it.

### Complexity of the main problems

| Problem | Time | Space |
|---------|------|-------|
| Level Order Traversal | O(n) | O(w) |
| Right Side View | O(n) | O(w) |
| Zigzag Level Order | O(n) | O(w) |

`w` is the largest level width. The queue peaks at the widest level. A complete tree has up to ⌈n/2⌉ nodes in its last level, so the worst case is O(n).

## Watch out

- `i < queue.size()` re-reads a size that grows as you push. Levels then mix. Store `levelSize` first.
- `ArrayList.remove(0)` costs O(n) per call. Use `ArrayDeque`, or show the level-swap fix.
- A `null` root in the queue crashes on `.left`. Return an empty list for an empty tree before you use the queue.
- The right side view is not the right spine. Following `right` pointers misses left-subtree nodes that are visible below a short right side.
- In the tree `1 → (2, 3)` with `2.left = 4`, the view is `[1, 3, 4]`. The last node of each BFS level is always correct.
- Zigzag reverses the collected level, not the queue. Reordering the queue corrupts every level below it.
- Push only non-null children. `ArrayDeque.offer(null)` throws a `NullPointerException`.

## Problem walkthroughs

### Binary Tree Level Order Traversal ★

**Problem.** Given the root of a binary tree, return a list of lists. Each inner list holds the values at one depth, top to bottom, left to right.

**Example.**

```text
3 → (9, 20), 20 → (15, 7)
  → [[3], [9, 20], [15, 7]]
empty tree → []
```

**Steps.**
1. Return an empty list for a null root. Otherwise, put the root in the queue.
2. While the queue is not empty, store `levelSize = queue.size()`. Remove exactly that many nodes into a `level` list. Push each node's non-null children as you go.
3. After the inner loop, add `level` to the result.
4. The snapshot is the proof of correctness. The queue at the top of an iteration is one full level, and children land after it.

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
1. Run the level loop. You do not need the `level` list, only the values.
2. In the inner loop, add the value of the node at position `i == levelSize - 1`, the last of the level.
3. Children enter the queue left to right, so the queue keeps left-to-right order within a level. The last node removed is the rightmost at that depth, in either subtree.
4. In the second example, the deepest visible node (`4`) hangs off the left child. That is why this is a BFS problem, not a walk down `right` pointers.

**Complexity.** O(n) time, O(w) space.

### Average of Levels in Binary Tree

**Problem.** Return a list where element `i` is the average of the node values at depth `i`.

**Example.**

```text
3 → (9, 20), 20 → (15, 7)
  → [3.0, 14.5, 11.0]
```

**Steps.**
1. Use the same level loop. In place of the value list, keep a running `sum` in the inner loop.
2. After the level, add `(double) sum / levelSize`. The snapshot is also the divisor.
3. Sum into a `long` to avoid `int` overflow.

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
3. On right-to-left levels, call `Collections.reverse(level)` before you add it. To skip the reverse, build each level in an `ArrayDeque<Integer>` with `addFirst`.
4. Zigzag is a change to the output, not to the traversal. If you change the queue order, the next level comes out in the wrong order.

**Complexity.** O(n) time, O(w) space. The reverse costs O(level size), which the level already costs.

## Interview follow-ups

- After **Right Side View**: "Left side view?" Keep the node at `i == 0` in place of the last one.
- After **Right Side View**: "Do it with DFS?" Visit the right child first. Record a value when `depth == result.size()`, because the first visit to each depth is the rightmost node.
- After **Level Order**: "Bottom-up level order?" Collect the levels normally, then reverse the result.
- After **Zigzag**: "Avoid the reverse?" Build each level with `addFirst` on a deque.
- General: "Why BFS over DFS here?" DFS with a depth parameter can also group by level, with `result.get(depth)`. BFS finds level boundaries without this bookkeeping.
- BFS memory depends on the tree width, and DFS memory on the tree height. For deep, narrow trees, this difference matters.

## The task

Write three level-by-level traversals of a binary tree.

1. Each node is a `TreeNode` with `int val`, `TreeNode left` and `TreeNode right`.
2. `left` and `right` are child nodes or `null`. An empty tree is `null`.
3. `List<List<Integer>> levelOrder(TreeNode root)` returns a list of lists: the values at each depth.
4. Depths go top to bottom. Values in a depth go left to right.
5. `List<Integer> rightSideView(TreeNode root)` returns the rightmost value at each depth, top to bottom.
6. `List<List<Integer>> zigzagLevelOrder(TreeNode root)` returns the level order with alternating direction.
7. Level 0 goes left to right, level 1 right to left, and so on.
8. Each function runs in O(n) time.

Each function returns an empty list for an empty tree. A left-subtree node is visible from the right when no node at its depth is further right. A level with one node is the same in both directions.

In the examples, `tree(...)` builds a tree from level-order values. `null` marks an absent child. The values omit the children of absent nodes.

```java
levelOrder(
    tree(3, 9, 20, null, null, 15, 7));
// [[3], [9, 20], [15, 7]]
levelOrder(tree(1));
// [[1]]
levelOrder(tree(1, null, 2, null, 3));
// [[1], [2], [3]]
levelOrder(null);
// []

rightSideView(
    tree(1, 2, 3, null, 5, null, 4));
// [1, 3, 4]
// 2.left = 4, and 3 is a leaf:
rightSideView(tree(1, 2, 3, 4));
// [1, 3, 4]
rightSideView(tree(1, 2, null, 3));
// [1, 2, 3]
rightSideView(null);
// []

zigzagLevelOrder(
    tree(3, 9, 20, null, null, 15, 7));
// [[3], [20, 9], [15, 7]]
zigzagLevelOrder(
    tree(1, 2, 3, 4, 5, 6, 7));
// [[1], [3, 2], [4, 5, 6, 7]]
zigzagLevelOrder(null);
// []
```
