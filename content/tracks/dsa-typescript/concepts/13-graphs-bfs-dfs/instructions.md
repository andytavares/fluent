# Graphs: BFS and DFS

## What you'll learn

How to traverse graphs safely by tracking visited state, how DFS with 3-color marking detects cycles, and how BFS guarantees the shortest path in unweighted graphs. You'll implement three problems: number of islands (DFS), course schedule (DFS cycle detection), and word ladder (BFS shortest path).

## Key concepts

### DFS flood-fill on a grid

Graphs don't have to be adjacency lists — a grid is a graph where each cell is a node with up to 4 neighbors. Visited tracking is done by mutating the cell (or with a Set if mutation is disallowed).

```typescript
function numIslands(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number): void {
    // Out of bounds or not land or already visited
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0"; // mark visited by mutating
    dfs(r + 1, c); dfs(r - 1, c);
    dfs(r, c + 1); dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c); // marks the whole island
      }
    }
  }
  return count;
}
```

### DFS with 3-color cycle detection

Track each node's state: `0` = unvisited, `1` = currently in the DFS path (gray), `2` = fully processed (black). A back edge (visiting a gray node) means there's a cycle.

```typescript
function canFinish(numCourses: number, prerequisites: [number, number][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) adj[pre].push(course);

  const state = new Array<0 | 1 | 2>(numCourses).fill(0);

  function dfs(node: number): boolean {
    if (state[node] === 1) return false; // back edge = cycle
    if (state[node] === 2) return true;  // already verified clean
    state[node] = 1; // mark as in-progress
    for (const neighbor of adj[node]) {
      if (!dfs(neighbor)) return false;
    }
    state[node] = 2; // fully processed
    return true;
  }

  for (let i = 0; i < numCourses; i++) {
    if (!dfs(i)) return false;
  }
  return true;
}
```

### BFS for shortest path — Word Ladder

BFS guarantees the shortest path in an unweighted graph. For word ladder, each BFS "level" represents one transformation step. The trick: precompute a "wildcard → words" map so each neighbor lookup is O(wordLen) instead of O(dict size × wordLen).

```typescript
function wordLadderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;

  // Map from wildcard pattern to words matching it
  // e.g., "h*t" → ["hot", "hat"]
  const pattern = new Map<string, string[]>();
  for (const word of wordSet) {
    for (let i = 0; i < word.length; i++) {
      const key = word.slice(0, i) + "*" + word.slice(i + 1);
      const bucket = pattern.get(key);
      if (bucket) bucket.push(word);
      else pattern.set(key, [word]);
    }
  }

  const visited = new Set([beginWord]);
  const queue: string[] = [beginWord];
  let steps = 1;

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const word = queue.shift()!;
      for (let j = 0; j < word.length; j++) {
        const key = word.slice(0, j) + "*" + word.slice(j + 1);
        for (const neighbor of pattern.get(key) ?? []) {
          if (neighbor === endWord) return steps + 1;
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
    steps++;
  }
  return 0; // endWord not reachable
}
```

## Complexity

| Function | Time | Space | Notes |
|----------|------|-------|-------|
| `numIslands` | O(m·n) | O(m·n) | Each cell visited once; recursion stack |
| `canFinish` | O(V + E) | O(V + E) | V = courses, E = prerequisites |
| `wordLadderLength` | O(N·L²) | O(N·L²) | N = words, L = word length; pattern map |

## Common variations

- **Number of connected components** — same DFS; count how many times you start a fresh DFS
- **Pacific Atlantic water flow** — reverse multi-source BFS from both oceans
- **Clone graph** — DFS/BFS with a `visited` map from old node to new clone
- **Topological sort** — DFS with postorder collection (reverse of finish order)

## vs other languages

Python's recursion limit (1000 by default) makes DFS on large grids dangerous. Node.js has a larger stack (~10k frames), but iterative DFS (using an explicit stack) is safer for production. TypeScript closures over mutable grid references work cleanly — the `dfs` inner function captures `grid`, `rows`, and `cols` by reference.

## Watch out

- **Mutation vs copy**: `numIslands` mutates the grid. If the test harness calls your function multiple times on the same grid, results will be wrong after the first call. The test file uses `copyGrid()` for this reason — your implementation should not.
- **`state[node] === 1` check comes BEFORE `=== 2`**: if you check `=== 2` first, a cycle (state 1) would fall through to the visited path and return `true` — wrong.
- **`wordLadderLength` returns 0 for no path, not -1**: the problem convention is 0 = unreachable. Don't confuse with typical shortest-path conventions that use -1 or Infinity.
- **`endWord` not in `wordList`**: early return 0. If endWord is in the list but `beginWord` transforms to it in one step, the answer is 2 (beginWord and endWord count as the sequence length).

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "How would you do topological sort?" (DFS postorder — after all neighbors are processed, push the current node. Reverse the collected order.)
> - "Can you do BFS cycle detection?" (Kahn's algorithm: compute in-degrees; repeatedly process nodes with in-degree 0; if all nodes are processed, no cycle.)
> - "How would you optimize `wordLadderLength` with bidirectional BFS?" (Start BFS from both `beginWord` and `endWord` simultaneously; stop when the two frontiers meet. Reduces the branching factor from O(b^d) to O(b^(d/2)).)
> - "What is the difference between DFS and BFS for `numIslands`?" (Both work. DFS uses the call stack (O(m·n) worst case for a large island). BFS uses a queue (O(min(m·n, perimeter)) space in practice). Either is correct.)

## The task

Implement three functions:

```typescript
// Count the number of islands. "1" = land, "0" = water.
// Islands are groups of "1"s connected horizontally or vertically.
// Mutating the grid to mark visited cells is acceptable.
// [["1","1","0"],["0","1","0"],["0","0","1"]] → 2
function numIslands(grid: string[][]): number

// Return true if all numCourses courses can be taken without circular dependency.
// prerequisites[i] = [course, prereq]: prereq must be taken before course.
// canFinish(2, [[1,0]])       → true
// canFinish(2, [[1,0],[0,1]]) → false (cycle)
function canFinish(numCourses: number, prerequisites: [number, number][]): boolean

// Return the length of the shortest transformation sequence from beginWord to
// endWord, where each step changes exactly one letter and every intermediate
// word must be in wordList. Return 0 if no sequence exists.
// beginWord="hit", endWord="cog",
//   wordList=["hot","dot","dog","lot","log","cog"] → 5
//   (hit→hot→dot→dog→cog)
function wordLadderLength(beginWord: string, endWord: string, wordList: string[]): number
```
