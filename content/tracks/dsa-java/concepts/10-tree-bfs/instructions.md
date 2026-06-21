# Tree BFS

## What you'll learn

How to traverse a binary tree level by level using a queue, and how the "snapshot the queue size" trick gives you clean level boundaries. The third problem — zigzag level order — adds a direction-flip that shows up in FAANG interviews more often than you'd expect.

## Key concepts

### Pattern 1 — Level-order traversal

Snapshot `queue.size()` at the start of each outer iteration. That count tells you exactly how many nodes are on the current level.

```java
public static List<List<Integer>> levelOrder(TreeNode root) {
    var result = new ArrayList<List<Integer>>();
    if (root == null) return result;

    var queue = new ArrayDeque<TreeNode>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int levelSize = queue.size(); // snapshot: all nodes at this depth
        var level = new ArrayList<Integer>();
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left  != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}
```

### Pattern 2 — Right side view (last node per level)

Same BFS loop; only capture the last node in each level (`i == levelSize - 1`).

```java
public static List<Integer> rightSideView(TreeNode root) {
    var result = new ArrayList<Integer>();
    if (root == null) return result;
    var queue = new ArrayDeque<TreeNode>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            if (i == levelSize - 1) result.add(node.val);
            if (node.left  != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    return result;
}
```

### Pattern 3 — Zigzag level order (direction flip per level)

Use `ArrayDeque` as both a queue and a deque. For left-to-right levels, add to the back; for right-to-left levels, add to the front. A boolean `leftToRight` flips each level.

```java
public static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    var result = new ArrayList<List<Integer>>();
    if (root == null) return result;
    var queue = new ArrayDeque<TreeNode>();
    queue.offer(root);
    boolean leftToRight = true;

    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        var level = new ArrayDeque<Integer>(); // deque to support front/back insertion
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            if (leftToRight) level.addLast(node.val);
            else             level.addFirst(node.val); // reverse by inserting at front
            if (node.left  != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(new ArrayList<>(level));
        leftToRight = !leftToRight;
    }
    return result;
}
```

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `levelOrder` | O(n) | O(w) | Every node enqueued/dequeued once; max queue size = max level width w |
| `rightSideView` | O(n) | O(w) | Same BFS traversal |
| `zigzagLevelOrder` | O(n) | O(w) | Same; per-level deque is bounded by w |

`w` = max width of tree. Balanced: w = O(n/2) = O(n) at leaf level.

## Common variations this pattern solves

1. **Minimum Depth** — BFS returns depth when first leaf is found (BFS gives shortest path)
2. **Connect Next Right Pointers** — within each BFS level, link nodes left-to-right
3. **Average of Levels** — sum all values per level, divide by count
4. **Find Largest Value in Each Row** — track running max per BFS level

## vs DFS

BFS uses a queue (FIFO); DFS uses a stack (LIFO, implicit via call stack or explicit `ArrayDeque`). BFS is better when you need level-by-level information or the shortest path to a target. DFS is better when you need to traverse a full path (root-to-leaf) or the tree is very wide but shallow.

## Watch out

- **`ArrayDeque` rejects null**: always null-check before `queue.offer(node.left)`. A null offer throws `NullPointerException`.
- **Snapshot `queue.size()` before the inner loop**: the inner loop modifies `queue` by adding children. If you call `queue.size()` inside the loop, you'll process children on the current level rather than the next.
- **Zigzag: don't sort or reverse the list after building it** — insert in the correct order upfront using `addFirst`/`addLast`. Post-processing is O(n) extra work and error-prone.
- **`new ArrayList<>(level)` to convert deque**: `result.add(level)` where `level` is `ArrayDeque<Integer>` would fail if the return type is `List<List<Integer>>` expecting `ArrayList`. Always convert.

## FAANG follow-up questions

> "Can you do zigzag level order with just one `ArrayList` per level instead of a deque?" — Yes: append normally, then `Collections.reverse(level)` for right-to-left levels. O(n) extra work but same asymptotic complexity.
>
> "What's the difference between BFS and DFS for level-order specifically?" — BFS visits nodes in level order naturally. DFS can produce level-order output but requires tracking depth at each node and is generally more complex for this use case.
>
> "How would you find the width of the widest level?" — Count `queue.size()` at the start of each BFS iteration; track the maximum.
>
> "How would you serialize and deserialize a binary tree?" — BFS (level-order) is the standard serialization format. Deserialize by creating nodes from the array left-to-right, parent-to-child.

## The task

`TreeNode` is defined in the test file:
```java
static class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
```

Implement three methods in `Solution`:

```java
// Returns a list of lists where each inner list holds node values at that level.
// [3,9,20,null,null,15,7] -> [[3],[9,20],[15,7]]
public static List<List<Integer>> levelOrder(TreeNode root)

// Returns the value of the last node visible at each level from the right.
// [1,2,3,null,5,null,4] -> [1,3,4]
public static List<Integer> rightSideView(TreeNode root)

// Returns level-order values, alternating left-to-right and right-to-left per level.
// [3,9,20,null,null,15,7] -> [[3],[20,9],[15,7]]
public static List<List<Integer>> zigzagLevelOrder(TreeNode root)
```
