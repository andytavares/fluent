# Graphs: BFS and DFS

## What you'll learn

Three canonical graph patterns: grid DFS for connected components, directed-graph cycle detection via 3-state DFS coloring, and BFS for shortest path in an implicit word-transformation graph.

## Key concepts

Graphs generalize trees by adding cycles and disconnected components. Two extra responsibilities vs trees:
1. A `visited` set (or in-place mutation) to prevent infinite loops
2. A check for multiple connected components (iterate over all nodes as potential DFS/BFS roots)

### Grid DFS — number of islands

Mark cells as visited by mutating to `'0'` (or maintain a `Set`). Flood-fill each unvisited land cell.

```js
function dfs(grid, r, c) {
  if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
  if (grid[r][c] !== '1') return; // water or already visited
  grid[r][c] = '0'; // mark visited
  dfs(grid, r+1, c); dfs(grid, r-1, c);
  dfs(grid, r, c+1); dfs(grid, r, c-1);
}
```

### Directed graph cycle detection — 3-state DFS

Three states: `0` = unvisited, `1` = in current DFS path (gray), `2` = fully processed (black). A back edge (reaching a gray node) means a cycle.

```js
// state: 0=unvisited, 1=in-progress, 2=done
function dfs(node) {
  if (state[node] === 1) return false; // back edge = cycle
  if (state[node] === 2) return true;  // safe
  state[node] = 1;
  for (const neighbor of adj[node]) if (!dfs(neighbor)) return false;
  state[node] = 2;
  return true;
}
```

### BFS on implicit graph — word ladder

Each word is a node; edges exist between words that differ by exactly one letter. BFS finds the shortest transformation path.

```js
function wordLadderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;
  const queue = [[beginWord, 1]]; // [word, steps]
  const visited = new Set([beginWord]);
  while (queue.length) {
    const [word, steps] = queue.shift();
    for (let i = 0; i < word.length; i++) {
      for (let c = 97; c <= 122; c++) { // 'a' to 'z'
        const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
        if (next === endWord) return steps + 1;
        if (wordSet.has(next) && !visited.has(next)) {
          visited.add(next); queue.push([next, steps + 1]);
        }
      }
    }
  }
  return 0;
}
```

## Time and space complexity

| Problem | Time | Space |
|---------|------|-------|
| numIslands | O(m * n) | O(m * n) call stack |
| canFinish | O(V + E) | O(V + E) |
| wordLadderLength | O(n * L * 26) | O(n * L) |

`n` = number of words in wordList, `L` = word length.

## Common variations

- **Number of connected components** (LC 323) — same DFS/Union-Find pattern on an edge list
- **Pacific Atlantic Water Flow** (LC 417) — two multi-source BFS from each ocean
- **Clone graph** (LC 133) — DFS with a visited map from original to clone node
- **Topological sort** (LC 210) — extend canFinish to collect the ordering

## vs other languages

JavaScript has no built-in graph type. Build adjacency lists as `Map<node, node[]>` or plain arrays. Python's `defaultdict(list)` is convenient. The algorithm logic is identical across languages.

## FAANG follow-up questions

After numIslands:
- "How do you avoid mutating the input?" (use a `Set` of visited coordinates instead)
- "How does this change if connections are 8-directional (diagonal)?" (add 4 diagonal directions to your DFS calls)

After canFinish:
- "Can you do it iteratively without recursion?" (Kahn's algorithm: BFS on nodes with in-degree 0; if all nodes are processed, no cycle)
- "How do you extend this to return the topological order?" (collect nodes in the order they're finished in DFS post-order)

After wordLadderLength:
- "Why is BFS better than DFS here?" (BFS guarantees shortest path in an unweighted graph; DFS would require trying all paths)
- "What if you need the actual path?" (store the predecessor word in a map; backtrack from endWord to beginWord)
- "Can you speed this up with bidirectional BFS?" (yes — BFS from both ends; O(26 * L * sqrt(n)) in practice)

## Watch out

- **numIslands early return**: check bounds and cell value before recursing, not inside the recursive call.
- **canFinish self-loop**: a prerequisite like `[0, 0]` is a cycle; the 3-state check catches it (state[0] === 1 when you visit 0 again).
- **wordLadderLength**: `String.fromCharCode(c)` where `c` loops from 97 to 122 generates `'a'` through `'z'`. Don't generate the same word (skip if `next === word`).
- **Disconnected graph**: for `canFinish`, iterate over all nodes as DFS roots — not just nodes mentioned in prerequisites. Isolated nodes must also be checked.

## The task

### `numIslands(grid)`

Return the number of islands (`'1'` = land, `'0'` = water). An island is a group of 4-directionally connected land cells.

```js
numIslands([["1","1","0"],["1","0","0"],["0","0","1"]]) // 2
numIslands([["0","0"],["0","0"]])                        // 0
```

### `canFinish(numCourses, prerequisites)`

Return `true` if all courses can be finished (no cycle in the prerequisite directed graph). `[a, b]` means b must be taken before a.

```js
canFinish(2, [[1, 0]])          // true
canFinish(2, [[1, 0], [0, 1]]) // false
canFinish(1, [])                // true
```

### `wordLadderLength(beginWord, endWord, wordList)`

Return the length of the shortest transformation sequence from `beginWord` to `endWord`, where each step changes exactly one letter and each intermediate word must be in `wordList`. Return `0` if no such sequence exists.

```js
wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"]) // 5
wordLadderLength("hit", "cog", ["hot","dot","dog","lot","log"])       // 0
```
