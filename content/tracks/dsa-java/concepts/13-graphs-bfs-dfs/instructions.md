# Graphs: BFS and DFS

## What you'll learn

How graph traversal generalizes tree traversal when cycles exist and parents aren't unique. Three canonical patterns: DFS flood fill, DFS cycle detection for directed graphs, and BFS shortest-path for word transformation.

## Key concepts

### Pattern 1 — DFS flood fill (Number of Islands)

Sink visited land cells (`'1'` → `'0'`) in-place so they act as the visited set. Each outer-loop encounter with `'1'` starts a new island.

```java
public static int numIslands(char[][] grid) {
    int count = 0;
    for (int r = 0; r < grid.length; r++) {
        for (int c = 0; c < grid[0].length; c++) {
            if (grid[r][c] == '1') { dfs(grid, r, c); count++; }
        }
    }
    return count;
}

private static void dfs(char[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
    grid[r][c] = '0'; // mark visited
    dfs(grid, r+1, c); dfs(grid, r-1, c);
    dfs(grid, r, c+1); dfs(grid, r, c-1);
}
```

### Pattern 2 — DFS cycle detection on directed graphs (Course Schedule)

Three-color state: unvisited (0), in current path (1), completed (2). A back edge to a node still in the path (state 1) means a cycle.

```java
public static boolean canFinish(int numCourses, int[][] prerequisites) {
    var graph = new ArrayList<List<Integer>>();
    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
    for (int[] pre : prerequisites) graph.get(pre[1]).add(pre[0]);

    int[] state = new int[numCourses]; // 0=unvisited, 1=in-path, 2=done
    for (int i = 0; i < numCourses; i++) {
        if (hasCycle(graph, state, i)) return false;
    }
    return true;
}

private static boolean hasCycle(List<List<Integer>> graph, int[] state, int node) {
    if (state[node] == 1) return true;
    if (state[node] == 2) return false;
    state[node] = 1;
    for (int neighbor : graph.get(node)) {
        if (hasCycle(graph, state, neighbor)) return true;
    }
    state[node] = 2;
    return false;
}
```

### Pattern 3 — BFS for shortest transformation (Word Ladder)

BFS guarantees shortest path in an unweighted graph. Build neighbors by trying every single-character substitution. Use a `HashSet` for O(1) lookup; remove visited words to avoid re-processing.

```java
public static int wordLadderLength(String beginWord, String endWord, List<String> wordList) {
    var wordSet = new HashSet<>(wordList);
    if (!wordSet.contains(endWord)) return 0;

    var queue = new ArrayDeque<String>();
    queue.offer(beginWord);
    wordSet.remove(beginWord);
    int steps = 1;

    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            String word = queue.poll();
            if (word.equals(endWord)) return steps;
            char[] chars = word.toCharArray();
            for (int j = 0; j < chars.length; j++) {
                char original = chars[j];
                for (char c = 'a'; c <= 'z'; c++) {
                    chars[j] = c;
                    String next = new String(chars);
                    if (wordSet.contains(next)) {
                        queue.offer(next);
                        wordSet.remove(next); // prevent revisit
                    }
                }
                chars[j] = original; // restore
            }
        }
        steps++;
    }
    return 0; // no path found
}
```

## Time and space complexity

| Problem | Time | Space | Why |
|---------|------|-------|-----|
| `numIslands` | O(m·n) | O(m·n) | Every cell visited once; recursion stack ≤ m·n |
| `canFinish` | O(V + E) | O(V + E) | Every node/edge visited once; adjacency list |
| `wordLadderLength` | O(N · L · 26) | O(N · L) | N words of length L; 26 substitutions per position |

## Common variations this pattern solves

1. **Number of Connected Components** — DFS/BFS; count calls from unvisited nodes
2. **Clone Graph** — DFS with a HashMap from original node to clone
3. **Pacific Atlantic Water Flow** — reverse BFS from both oceans; find intersection
4. **Alien Dictionary** — topological sort of characters with cycle detection

## vs other languages

Python uses `collections.deque` for BFS. Java uses `ArrayDeque`. Both are O(1) for offer/poll. Python's `set` and Java's `HashSet` are equivalent for O(1) membership testing.

## Watch out

- **Mutating `grid` in numIslands**: marking cells as `'0'` works as a visited set only if modifying input is acceptable. If not, use a separate `boolean[][] visited` array.
- **Three-color vs two-color for cycle detection**: two-color (visited/not) works for undirected graphs. Directed graphs need three colors to distinguish "in current path" from "fully processed."
- **Word Ladder: remove from `wordSet` on enqueue, not on dequeue**: removing on dequeue allows the same word to be enqueued multiple times, causing exponential blowup. Remove on enqueue.
- **`new String(chars)` inside the innermost loop**: creates O(L) per iteration. For very large word lists this is the bottleneck. One optimization: bidirectional BFS.

## FAANG follow-up questions

> "Can you solve Word Ladder faster than O(N·L·26)?" — Bidirectional BFS: expand from both `beginWord` and `endWord`, meeting in the middle. Reduces the search from O(b^d) to O(b^(d/2)) where b is branching factor.
>
> "What if the graph has negative-weight edges?" — BFS gives shortest path only for unweighted graphs. Use Dijkstra (non-negative weights) or Bellman-Ford (negative weights).
>
> "How does numIslands change if diagonal connections count?" — Add four more direction vectors: `{1,1},{1,-1},{-1,1},{-1,-1}`.
>
> "Can canFinish be solved without recursion?" — Yes, use Kahn's algorithm (iterative topological sort): build in-degree array, seed queue with zero-in-degree nodes, process until queue empty; if all nodes processed, no cycle.

## The task

Implement three methods in `Solution`:

```java
// Returns the number of islands (connected groups of '1's).
// '1' = land, '0' = water; connections are horizontal/vertical only.
public static int numIslands(char[][] grid)

// Returns true if all numCourses can be finished.
// prerequisites[i] = [a, b] means b must be taken before a.
// Equivalent to: directed graph has no cycle.
public static boolean canFinish(int numCourses, int[][] prerequisites)

// Returns the length of the shortest transformation sequence from beginWord to endWord,
// where each step changes exactly one letter and the result must be in wordList.
// Returns 0 if no such sequence exists.
// beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"] -> 5
public static int wordLadderLength(String beginWord, String endWord, List<String> wordList)
```
