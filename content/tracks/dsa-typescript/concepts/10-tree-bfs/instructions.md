# Tree BFS

## What you'll learn

How breadth-first search processes a tree level-by-level using a queue, and how snapshotting `queue.length` at the start of each level lets you separate levels in O(1) per snapshot. You'll implement three problems: level order traversal, right side view, and zigzag level order.

## Key concepts

### Level-by-level BFS

The key pattern: capture `queue.length` before the inner loop so you process exactly the nodes at the current level before moving to the next.

```typescript
function levelOrder(root: TreeNode | null): number[][] {
  if (root === null) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length; // snapshot — nodes at this level
    const level: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
```

### Right side view

Same BFS; record only the last node in each level (the rightmost visible one).

```typescript
function rightSideView(root: TreeNode | null): number[] {
  if (root === null) return [];
  const result: number[] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      if (i === levelSize - 1) result.push(node.val); // last in level = rightmost
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return result;
}
```

### Zigzag level order

Alternate direction each level. Use a flag to decide whether to push values left-to-right or right-to-left. Building into a pre-sized array and filling from the correct end is cleaner than reversing.

```typescript
function zigzagLevelOrder(root: TreeNode | null): number[][] {
  if (root === null) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  let leftToRight = true;

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = new Array<number>(levelSize); // pre-sized for index-based fill

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      // Fill from the appropriate direction
      const idx = leftToRight ? i : levelSize - 1 - i;
      level[idx] = node.val;
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
    leftToRight = !leftToRight;
  }
  return result;
}
```

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `levelOrder` | O(n) | O(w) | w = max width ≈ n/2 for full tree |
| `rightSideView` | O(n) | O(w) | Same BFS, just selects last per level |
| `zigzagLevelOrder` | O(n) | O(w) | Pre-sized array avoids O(n) reverse |

## Common variations

- **Minimum depth** — BFS finds the first leaf in fewest steps; DFS must visit all nodes
- **Average of levels** — accumulate sum and count per level
- **Find leftmost value in last row** — last level's first element
- **Walls and gates** — multi-source BFS (see queues-and-deques concept)

## vs DFS for level-related problems

| Problem | BFS | DFS |
|---------|-----|-----|
| Level order | Natural; queue tracks levels | Needs a `depth` parameter |
| Right side view | Last node per BFS level | `depth → value` map; DFS right-first overwrites |
| Minimum depth | Stops at first leaf — O(depth) | Must scan all leaves — O(n) |
| Max depth | O(n) | O(n) and simpler code |

## Watch out

- **`queue.length` inside the loop**: if you use `queue.length` directly as the loop bound instead of snapshotting it, children added during the loop extend the "current level" — you'll process multiple levels as one.
- **`queue.shift()` is O(n)**: shifting is fine for interview purposes. For production, use a head-pointer approach or a real deque.
- **Zigzag index calculation**: `leftToRight ? i : levelSize - 1 - i` mirrors the index. If `leftToRight = false` and the level has 3 nodes, index 0 writes to slot 2, index 1 to slot 1, index 2 to slot 0.
- **Null children**: always guard `if (node.left)` before pushing to avoid enqueuing `null` — that would break the `node.val` access next iteration.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you print the tree in vertical order?" (Group nodes by column index; use a map from column → values. DFS or BFS both work.)
> - "Can you do right side view without a queue (DFS)?" (Yes — DFS right-first; maintain a `depth → value` map; each depth records the first value encountered at that depth when going right-first.)
> - "What is the maximum possible queue size for a complete binary tree?" (At the deepest full level, n/2 nodes are all in the queue simultaneously. So O(n) space worst case.)

## The task

Implement the `TreeNode` class and three functions:

```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number, left?: TreeNode | null, right?: TreeNode | null)
}

// Return a list of levels, each containing node values left-to-right.
// [3,9,20,null,null,15,7] → [[3],[9,20],[15,7]]
function levelOrder(root: TreeNode | null): number[][]

// Return the rightmost visible node value at each level.
// [1,2,3,null,5,null,4] → [1,3,4]
function rightSideView(root: TreeNode | null): number[]

// Return level-order values alternating left-to-right and right-to-left.
// [3,9,20,null,null,15,7] → [[3],[20,9],[15,7]]
function zigzagLevelOrder(root: TreeNode | null): number[][]
```
