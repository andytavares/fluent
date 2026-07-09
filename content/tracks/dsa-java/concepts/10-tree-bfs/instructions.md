# Tree BFS

## What you'll learn

Tree DFS gave you recursion down paths; this concept gives you the other traversal: breadth-first, level by level, with a queue. The one idea that matters is the **level-size snapshot** — freeze the queue size before draining a level so you know exactly where one depth ends and the next begins. With that loop in hand, level order traversal, right side view, per-level averages, and zigzag ordering are each a one-line variation on the same template.

## Key concepts

### The queue and the level-size snapshot

BFS visits nodes in order of distance from the root: the root, then both its children, then all four grandchildren, and so on. Java's `ArrayDeque` gives O(1) offer/poll, so it's the natural queue — but it does *not* tell you where level boundaries fall on its own. The fix: at the top of each outer iteration, snapshot how many nodes are currently queued via `queue.size()`. That count is exactly one complete level, because every node queued so far is from the current depth and everything you push while draining it is from the next.

```java
public static List<List<Integer>> levelOrder(TreeNode root) {
    var result = new ArrayList<List<Integer>>();
    if (root == null) return result;

    var queue = new ArrayDeque<TreeNode>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int levelSize = queue.size(); // snapshot: exactly one level
        var level = new ArrayList<Integer>();
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}
```

Invariant: children offered during the inner loop increase `queue.size()`, but the `for` loop only runs `levelSize` times — fixed before any child is added — so they are never consumed as part of the current level. That's the whole trick.

### Every level problem is this template plus one line

| Problem | Change to the template |
|---------|------------------------|
| Level order traversal | none — collect each level list |
| Right side view | keep only the value drained last in each level |
| Average of levels | sum the level, divide by the snapshot size |
| Zigzag level order | reverse the level list on odd depths |

Recognize this in interviews: if the problem statement says "per level", "by depth", "visible from the side", or "top to bottom", reach for the snapshot loop before anything else.

### The queue in Java

Unlike JavaScript (no built-in deque, `Array.prototype.shift()` is O(n)) or Python's list `.pop(0)`, Java's `java.util.ArrayDeque` is a proper double-ended queue: `offer`/`poll` are both O(1), and it also supports `addFirst`/`addLast` — exactly what zigzag's direction flip needs if you want to build a level in reverse order without a separate reverse pass:

```java
var level = new ArrayDeque<Integer>();
if (leftToRight) level.addLast(node.val);
else             level.addFirst(node.val);
// ... later: result.add(new ArrayList<>(level));
```

`ArrayDeque` also rejects `null` elements outright (`offer(null)` throws `NullPointerException`), which is why every enqueue here is guarded by `if (node.left != null)`.

### Complexity of the flagship problems

| Problem | Time | Space |
|---------|------|-------|
| Level Order Traversal | O(n) | O(w) queue, w = max level width |
| Right Side View | O(n) | O(w) |
| Zigzag Level Order | O(n) | O(w) |

The queue peaks at the widest level — up to ⌈n/2⌉ nodes for a complete tree, so O(n) worst case.

## vs other languages

JavaScript has no built-in deque, so `levelOrder` there needs a head-index array or a level-swap trick to avoid O(n) `shift()` calls; Java's `ArrayDeque` makes that non-issue disappear entirely. Python's `collections.deque` plays the same role as `ArrayDeque` here (`popleft()` is O(1)). C++ has `std::queue` (usually backed by `std::deque`) with the same O(1) guarantees.

## Watch out

- **Snapshot before draining.** `for (int i = 0; i < queue.size(); i++)` re-reads a size that grows as you offer children — levels bleed into each other. Capture `int levelSize = queue.size()` first, then loop `i < levelSize`.
- **Guard the empty tree.** Return the empty result before touching the queue; offering a `null` root crashes on `.left`.
- **Right side view is not the right spine.** In the tree `1 → (2, 3)` with `2.left = 4` and nothing below `3`, the view is `[1, 3, 4]` — once the right side runs out of depth, a left-subtree node becomes visible. Walking `node.right` pointers gives the wrong answer; the last node per BFS level is always right.
- **Zigzag reverses the collected level, not the queue.** Keep enqueueing left-then-right at every depth; flip only the output list (`Collections.reverse(level)` or build with `addFirst`). Reordering the queue corrupts every level below.
- **Offer only non-null children.** `ArrayDeque.offer(null)` throws — always check `node.left != null` / `node.right != null` first.

## Problem walkthroughs

### Binary Tree Level Order Traversal ★

**Problem.** Given the root of a binary tree, return a list of lists: the node values at each depth, top to bottom, left to right within a level.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [[3], [9, 20], [15, 7]]
    empty tree                       →  []

**Steps.**
1. Return an empty result for a null root. Otherwise offer the root.
2. While the queue is non-empty: snapshot `levelSize = queue.size()`, drain exactly that many nodes into a `level` list, offering each node's non-null children as you go.
3. Add `level` to the result after the inner loop.
4. The snapshot is the correctness argument: everything queued at the top of an iteration is one full level, and children land beyond that count.

**Complexity.** O(n) time / O(w) space — each node is queued and drained exactly once.

### Binary Tree Right Side View ★

**Problem.** Standing to the right of a binary tree, return the values you can see, top to bottom — the rightmost node at each depth.

**Example.**

    tree 1 → (2, 3), 2.right = 5, 3.right = 4  →  [1, 3, 4]
    tree 1 → (2, 3), 2.left = 4 (3 is a leaf)  →  [1, 3, 4]

**Steps.**
1. Run the level loop; you don't need the `level` list — just the values.
2. Inside the inner loop, when draining the node at position `i == levelSize - 1` (the last of the level), add its value to the result.
3. Children are enqueued left-to-right, so within a level the queue preserves left-to-right order — the last drained node is the rightmost one at that depth, whichever subtree it lives in.
4. Note the second example: the deepest visible node (`4`) hangs off the *left* child. That's why this is a BFS problem, not a walk down `right` pointers.

**Complexity.** O(n) time / O(w) space.

### Average of Levels in Binary Tree

**Problem.** Return a list where element `i` is the average of the node values at depth `i`.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [3, 14.5, 11]

**Steps.**
1. Same level loop; instead of collecting values, keep a running `double sum` across the inner loop.
2. After draining the level, add `sum / levelSize` — the snapshot doubles as the divisor, which is exactly why you took it.
3. Sum in a `long` (or `double`) accumulator if values could overflow `int` — `Integer.MAX_VALUE`-scale trees are a common follow-up.

**Complexity.** O(n) time / O(w) space.

### Binary Tree Zigzag Level Order Traversal ★

**Problem.** Return the level order traversal, but alternate direction per level: level 0 left-to-right, level 1 right-to-left, level 2 left-to-right, and so on.

**Example.**

    tree 3 → (9, 20), 20 → (15, 7)  →  [[3], [20, 9], [15, 7]]

**Steps.**
1. Run the plain level loop, always enqueueing children left-then-right — traversal order never changes.
2. Track a `leftToRight` boolean you flip each level.
3. On right-to-left levels, reverse the collected `level` list before adding it (`Collections.reverse(level)`) — or, to skip the reverse, build the level with an `ArrayDeque` and call `addFirst` instead of `addLast`.
4. The insight: zigzag is a *presentation* change, not a *traversal* change. Solutions that mess with queue order break because children of a reversed level would be discovered in the wrong order for the level after it.

**Complexity.** O(n) time / O(w) space — the reverse costs O(levelSize), already paid for by draining it.

## Interview follow-ups

- After **Right Side View**: "Left side view?" (keep `i == 0` instead of the last). "Do it with DFS?" (visit right child first, record a value whenever `depth == result.size()` — the first arrival at each depth is the rightmost node.)
- After **Level Order**: "Bottom-up level order?" (collect normally, reverse the result — don't traverse upside down.)
- After **Zigzag**: "Avoid the reverse?" (build each level with `ArrayDeque.addFirst`/`addLast` based on direction.)
- General: "Why BFS over DFS here?" — DFS with a depth parameter can group by level too (append to `result.get(depth)`), but BFS finds level boundaries without bookkeeping and its memory is bounded by tree *width* instead of *height*, which matters for deep, narrow trees.

## The task

Three level-by-level traversals over binary trees. Every tree node is:

```java
static class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val; this.left = left; this.right = right;
    }
}
```

`left`/`right` are child nodes or `null`; an empty tree is `null` itself. All three methods must run in O(n) time.

```java
// The tree used in the samples below:
//        3
//       / \
//      9  20
//         / \
//        15  7
TreeNode t = new TreeNode(3,
    new TreeNode(9),
    new TreeNode(20, new TreeNode(15), new TreeNode(7)));
```

### `levelOrder(TreeNode root)`

Return a list of lists: the node values at each depth, top to bottom, left to right within each level. An empty tree returns an empty list.

```java
levelOrder(t);                       // [[3], [9, 20], [15, 7]]
levelOrder(new TreeNode(1));         // [[1]]
levelOrder(null);                    // []
```

Edge cases: empty tree, single node, skewed trees (every level has one node), negative values.

### `rightSideView(TreeNode root)`

Return the values visible from the right side of the tree, top to bottom — the rightmost node at each depth. A node in a *left* subtree is visible when nothing at its depth exists further right. An empty tree returns an empty list.

```java
rightSideView(t);     // [3, 20, 7]
rightSideView(null);  // []

// 1 → (2, 3), where 2.left = 4 and 3 is a leaf: depth 2 only contains 4
TreeNode u = new TreeNode(1,
    new TreeNode(2, new TreeNode(4), null),
    new TreeNode(3));
rightSideView(u);     // [1, 3, 4]
```

Edge cases: empty tree, single node, right-only and left-only chains, deeper nodes hanging off left subtrees (the `[1, 3, 4]` case above — do not just follow `right` pointers).

### `zigzagLevelOrder(TreeNode root)`

Return the level order traversal with alternating direction: level 0 left-to-right, level 1 right-to-left, and so on. An empty tree returns an empty list.

```java
zigzagLevelOrder(t);     // [[3], [20, 9], [15, 7]]
zigzagLevelOrder(null);  // []
```

Edge cases: empty tree, single node, levels with one node (reversing changes nothing), trees deep enough to flip direction several times.
