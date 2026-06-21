# Tree BFS

## What you'll learn

Level-by-level BFS using the `levelSize` snapshot pattern, the right-side-view extraction, and zigzag traversal — a variation that interviews use to probe whether you truly understand level boundaries.

## Key concepts

BFS uses a queue. The critical insight: snapshot the queue length at the start of each level's loop to process exactly one level at a time.

### Level order — the fundamental BFS template

```js
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const levelSize = queue.length; // snapshot: exactly how many nodes this level
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
```

### Right side view — last node at each level

Same template; push `node.val` only when `i === levelSize - 1`.

### Zigzag level order — alternate direction per level

Same template; reverse the level array on odd-numbered levels.

```js
if (levelNum % 2 === 1) level.reverse(); // right-to-left on odd levels
result.push(level);
levelNum++;
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| levelOrder | O(n) | O(w) |
| rightSideView | O(n) | O(w) |
| zigzagLevelOrder | O(n) | O(w) |

`w` = maximum level width. For a complete binary tree, `w = n/2`, so O(n) in the worst case.

## Common variations

- **Minimum depth** (LC 111) — BFS finds the first leaf faster than DFS in sparse trees
- **Average of levels** (LC 637) — sum each level, divide by levelSize
- **Connect next right pointers** (LC 116/117) — BFS assigns `node.next = nextInQueue`
- **Binary tree level order bottom-up** (LC 107) — collect level order, then reverse the result array

## vs other languages

BFS is universally queue-based. Python's `collections.deque` gives O(1) `popleft()`. JavaScript's `Array.shift()` is O(n). For large trees in production, use an index pointer to simulate dequeue: `let head = 0; const node = queue[head++]`. For interview purposes, `shift()` is fine.

## FAANG follow-up questions

After levelOrder:
- "Can you do level order traversal using DFS?" (yes — pass depth as a parameter; use depth as an index into the result array. O(n) time but O(h) space instead of O(w))
- "How do you get the level with maximum sum?" (track sum per level during BFS; compare at end)

After zigzagLevelOrder:
- "Can you avoid the `reverse()` and do it in one pass?" (use a deque; push to front or back depending on direction — avoids O(w) reverse per level)
- "What if you need a spiral order of a matrix?" (similar zigzag logic with boundary tracking)

## Watch out

- **levelSize snapshot**: you MUST capture `queue.length` before the inner loop. If you use `queue.length` directly in the loop condition, newly-enqueued children are counted at the current level.
- **zigzag direction**: level 0 (root) is left-to-right. Level 1 is right-to-left. Some interviewers define it the opposite way — clarify before coding.
- **null root**: return `[]` immediately. All three functions have this edge case.
- **Right side view with deep left subtree**: if the leftmost path goes deeper than the rightmost path, those left-side nodes are still visible from the right at their level (they're the only node at that depth).

## The task

Use the same `TreeNode` class as the DFS concept.

### `levelOrder(root)`

Return an array of arrays, each inner array containing the values at that depth level.

```js
//     3
//    / \
//   9  20
//     /  \
//    15   7
levelOrder(tree) // [[3], [9, 20], [15, 7]]
levelOrder(null) // []
```

### `rightSideView(root)`

Return the last value visible at each level from the right.

```js
//   1
//  / \
// 2   3
//  \
//   5
rightSideView(tree) // [1, 3, 5]
```

### `zigzagLevelOrder(root)`

Return level order values, alternating left-to-right and right-to-left at each level.

```js
//     3
//    / \
//   9  20
//     /  \
//    15   7
zigzagLevelOrder(tree) // [[3], [20, 9], [15, 7]]
```
