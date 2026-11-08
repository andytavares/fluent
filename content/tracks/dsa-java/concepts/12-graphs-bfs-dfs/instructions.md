## What you build

You write three graph functions, one for each graph representation: `numIslands` for a grid, `cloneGraph` for adjacency data and `canFinish` for a dependency graph. Grid, adjacency and dependency shapes cover almost every graph problem in interviews. This lesson builds on **Tree BFS**.

## Key concepts

### A graph traversal is a tree traversal plus a visited set

Tree DFS and BFS carry over to graphs with one new duty: track visited nodes. A tree cannot revisit a node, but a graph with a cycle loops forever without a visited set. The only design choices are how you represent the graph and how you record "visited".

### A grid is an implicit graph

Each cell of a 2-D grid has up to four neighbors: up, down, left and right. Diagonals do not count unless the problem says so. You do not build an adjacency list; you compute neighbors on the fly and check bounds.

```java
static final int[][] DIRS = {
    {1, 0}, {-1, 0}, {0, 1}, {0, -1},
};

// Iterative DFS with an explicit stack
static void floodFill(char[][] grid,
                      int r, int c) {
    int rows = grid.length;
    int cols = grid[0].length;
    Deque<int[]> stack =
        new ArrayDeque<>();
    stack.push(new int[]{r, c});
    // Mark visited by changing the grid
    grid[r][c] = '0';
    while (!stack.isEmpty()) {
        int[] cell = stack.pop();
        for (int[] d : DIRS) {
            int nr = cell[0] + d[0];
            int nc = cell[1] + d[1];
            boolean inside = nr >= 0
                && nr < rows && nc >= 0
                && nc < cols;
            if (!inside) continue;
            if (grid[nr][nc] != '1') {
                continue;
            }
            // Mark on push, not on pop
            grid[nr][nc] = '0';
            stack.push(new int[]{nr, nc});
        }
    }
}
```

The changed grid is the visited set, so the extra space is only the stack. If the input must survive, use a visited set of `r * cols + c` keys. The explicit stack protects the call stack: a 1000×1000 all-land grid means a million recursive frames.

### Adjacency data needs a visited set or map

The graph can arrive as explicit adjacency data: a `Map<String, List<String>>` from node to neighbors, or edge pairs. Then BFS or DFS is the tree template plus a set or map of visited nodes. Mark a node visited when you push it, not when you pop it. Otherwise a node that two paths reach enters the queue twice.

A deep copy of a graph is the same traversal, with a visited map that stores the copy of each node. "Did I already create the clone of this node?" replaces "Did I see this node?".

### Kahn's algorithm sorts a dependency graph

Prerequisite pairs define a directed graph. "Can you finish all courses?" means "Is the graph acyclic?". To prove it, remove nodes that have no remaining prerequisites, one at a time.

```java
// edges: {to, from} prerequisite pairs
static List<Integer> topologicalOrder(
        int n, int[][] edges) {
    List<List<Integer>> adj =
        new ArrayList<>();
    for (int i = 0; i < n; i++) {
        adj.add(new ArrayList<>());
    }
    int[] indegree = new int[n];
    for (int[] e : edges) {
        // e[1] must come before e[0]
        adj.get(e[1]).add(e[0]);
        indegree[e[0]]++;
    }
    Deque<Integer> queue =
        new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        if (indegree[i] == 0) {
            queue.offer(i);
        }
    }
    List<Integer> order =
        new ArrayList<>();
    while (!queue.isEmpty()) {
        int node = queue.poll();
        order.add(node);
        for (int next : adj.get(node)) {
            indegree[next]--;
            if (indegree[next] == 0) {
                queue.offer(next);
            }
        }
    }
    // size < n means a cycle exists
    return order;
}
```

The invariant: a node enters the queue when you process its last prerequisite. Nodes on a cycle never reach indegree 0. So `order.size() < n` detects the cycle and shows which nodes are stuck. DFS with three-color marking also finds cycles, but Kahn's algorithm gives the order for free.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Number of Islands | O(rows · cols) | O(rows · cols) worst-case stack | flood fill |
| Clone Graph | O(V + E) | O(V) | traversal + visited map |
| Course Schedule | O(V + E) | O(V + E) | Kahn's topological sort |

## Watch out

- A traversal with no visited mechanism loops forever on a cycle. In grids, change the cell or track it. In adjacency graphs, use a `HashSet` or `HashMap`.
- If you mark visited on pop, a node enters the queue once per incoming edge. The queue grows fast, and flood fill counts cells twice.
- Grid cells are the `char` `'1'`, not the `int` `1`. `grid[r][c] == 1` never matches, and the island count is 0.
- Check bounds before you index. `grid[-1][0]` throws `ArrayIndexOutOfBoundsException`.
- Check `nr` and `nc` against both dimensions before you read `grid[nr][nc]`.
- `[a, b]` means "b before a". The edge runs `b → a`, and the indegree of `a` rises.
- Reversed edges still detect cycles, because a cycle is a cycle backwards. In Course Schedule II, the order comes out inverted.
- A snake-shaped island over a 1000×1000 grid needs a million-deep recursion. The default JVM thread stack throws `StackOverflowError` long before that.
- For grids of unknown size, use an explicit stack or a BFS queue.
- In Kahn's algorithm, count the nodes you process, not the first queue pushes. The cycle test is `processed == numCourses`.

## Problem walkthroughs

### Number of Islands ★

**Problem.** A grid has `'1'` (land) and `'0'` (water) cells. Count the islands. An island is a maximal group of land cells joined horizontally or vertically, not diagonally.

**Example.**

```text
[['1','1','0'],
 ['0','1','0'],
 ['0','0','1']] → 2
// The L-shaped island and the corner cell
```

**Steps.**
1. Scan every cell. At a `'1'`, add one to the island count. No earlier scan touched this island.
2. Flood fill from that cell with a stack or queue in four directions. Sink every `'1'` you reach to `'0'`, so you never count the island again.
3. Continue the scan. The scan and the fills visit each land cell at most twice, so the total is linear.
4. Invariant: every `'1'` at or before the scan position is already sunk. So a new `'1'` always means a new island.

**Complexity.** O(rows · cols) time / O(rows · cols) worst-case stack (all-land grid).

### Surrounded Regions

**Problem.** A grid has `'X'` and `'O'` cells. Flip to `'X'` every region of `'O'` cells that `'X'` cells completely surround: no cell of the region touches the border. Change the grid in place.

**Example.**

```text
[['X','X','X'],     [['X','X','X'],
 ['X','O','X'],  →   ['X','X','X'],
 ['O','X','X']]      ['O','X','X']]
// The inner O flips; the border O stays
```

**Steps.**
1. Invert the question: a region flips unless it touches the border. "Not surrounded" is easier to find than "surrounded".
2. Flood fill from every border `'O'`. Mark each cell you reach with a sentinel, `'S'`.
3. Sweep the whole grid. Change `'O'` to `'X'`, because the border never reached it. Change `'S'` back to `'O'`.
4. The sentinel replaces a separate visited set, and the final sweep is a single pass.

**Complexity.** O(rows · cols) time / O(rows · cols) worst-case fill stack.

### Clone Graph ★

**Problem.** Given a connected undirected graph, return a deep copy. The copy has the same structure and shares no references with the original. A change to the clone must never affect the source.

**Example.**

```text
{ "1": ["2", "4"], "2": ["1", "3"],
  "3": ["2", "4"], "4": ["1", "3"] }
→ an equal map; every list is new
```

**Steps.**
1. The general pattern applies to node objects with `neighbors` pointers. Traverse with a map from each original node to its clone.
2. On the first visit, create the clone and record it before you recurse into the neighbors. A cycle then finds the half-built clone and does not recurse forever.
3. With the adjacency map used here, the rule is "one new container per adjacency". Create a new outer `HashMap`, and copy each neighbor list into a new `ArrayList` (`new ArrayList<>(neighbors)`).
4. Copy every level. `new HashMap<>(graph)` is a shallow copy. The clone then shares the neighbor lists, and an `add` on the clone corrupts the original.
5. Check your model: after the clone, `clone != graph` and `clone.get(k) != graph.get(k)` for every node `k`. Still, `clone.equals(graph)` holds.

**Complexity.** O(V + E) time / O(V + E) space. You copy every node and every adjacency entry once.

### Evaluate Division

**Problem.** Equations `a / b = k` come as pairs `[a, b]` with values `k`. Answer each query `[x, y]` with the value of `x / y`, or `-1` if the equations do not determine it. A variable that appears in no equation is unknown.

**Example.**

```text
equations: a/b = 2, b/c = 3
a/c → 6
b/a → 0.5
a/e → -1
// x is unknown
x/x → -1
```

**Steps.**
1. Build a weighted graph. For each equation, add the edge `a → b` with weight 2 and the reverse edge `b → a` with weight 1/2.
2. A query `x / y` is a path from `x` to `y`. The answer is the product of the edge weights along it. With consistent inputs, every path gives the same product.
3. For each query, return -1 if either endpoint is absent. Otherwise run BFS or DFS from `x` with the running product and a visited set.
4. Return the product when you reach `y`, or -1 if `y` is unreachable.
5. This is plain traversal. The only twist is an accumulator on the path, the same shape as a distance in BFS.

**Complexity.** O(Q · (V + E)) time for Q queries / O(V + E) space. Union-Find with weighted ratios answers repeated queries faster.

### Course Schedule ★

**Problem.** There are `numCourses` courses labeled `0 … numCourses − 1`. A prerequisite pair `[a, b]` means "take `b` before `a`". Return `true` if you can take every course, that is, if the prerequisite graph has no cycle.

**Example.**

```text
// Take 0, then 1
numCourses = 2, [[1, 0]]         → true
// Each requires the other
numCourses = 2, [[1, 0], [0, 1]] → false
```

**Steps.**
1. Build the adjacency list `b → a` for each pair. Count the indegree of each node: its number of unmet prerequisites.
2. Queue every course with indegree 0. You can take these now.
3. Take a course from the queue and count it as processed. Lower the indegree of every course that depends on it, and queue each one that drops to 0.
4. Return `processed == numCourses`. Courses on a cycle wait on each other forever and never reach indegree 0. They are exactly the courses you never process.

**Complexity.** O(V + E) time / O(V + E) space. You handle each course and edge once.

### Course Schedule II

**Problem.** Use the same setup, but return a valid order in which to take all courses, or an empty array if none exists.

**Example.**

```text
numCourses = 4
[[1, 0], [2, 0], [3, 1], [3, 2]]
→ [0, 1, 2, 3] (or [0, 2, 1, 3])
```

**Steps.**
1. Run the Course Schedule algorithm, but collect each processed course into an `order` list.
2. The processing order is a topological order by construction. You process a course only after all its prerequisites.
3. Return `order` if its size is `numCourses`, else an empty array. It is the same code with one extra list. Say in an interview that II includes I.

**Complexity.** O(V + E) time / O(V + E) space.

## Interview follow-ups

- After **Number of Islands**: "You cannot change the grid?" Use a visited set keyed by `r * cols + c`. "Count distinct island shapes?" Record the move sequence of each fill as a signature, and count unique signatures.
- After **Number of Islands**: "Islands appear one cell at a time; count after each?" Use Union-Find, which handles incremental connectivity best.
- After **Course Schedule**: "Which courses are impossible?" The ones you never remove; their indegree stays positive. "Return the lexicographically smallest valid order?" Replace the queue in Kahn's algorithm with a `PriorityQueue`.
- After **Clone Graph**: "Clone a linked list with random pointers?" Use the same visited-map pattern. The map from original to copy is the whole trick, whatever the pointer structure.
- General: "BFS or DFS for connected components?" Either one, with the same complexity. BFS limits memory to the frontier width and gives distances. Recursive DFS is shorter, but deep components can overflow the stack.

## The task

Write three graph algorithms, one for each graph representation. Each one must run in time linear in the size of its input.

1. `int numIslands(char[][] grid)` returns the number of islands in `grid`. `grid` is a non-empty rectangular 2-D array. Each cell is the `char` `'1'` (land) or `'0'` (water).
2. An island is a maximal group of land cells joined horizontally or vertically. Diagonal contact does not join cells.
3. `numIslands` can change `grid`. Each test builds a new grid.
4. `Map<String, List<String>> cloneGraph(Map<String, List<String>> graph)` returns a deep copy of an undirected graph. Each key is a node label, and each value is a list of neighbor labels.
5. The copy is `equals` to the input and shares no references with it: not the outer map and not any neighbor list.
6. A change to the clone, such as a new node or an added neighbor, leaves the original unchanged. The copied lists must accept `add`.
7. `boolean canFinish(int numCourses, int[][] prerequisites)` returns `true` if you can take all courses in some order. It returns `false` if the prerequisites contain a cycle.
8. The course labels are `0 … numCourses - 1`. Each pair `{a, b}` means you take course `b` before course `a`.

Edge cases:

- `numIslands`: all water returns 0. All land returns 1. A single cell returns 0 or 1.
- `numIslands`: cells that touch only diagonally are separate islands. A snake-shaped island or a ring-shaped island counts once.
- `cloneGraph`: the labels are strings. Each copied list keeps the order of the original.
- `cloneGraph`: an empty map returns a new empty map. A node with no neighbors gets a new empty list.
- `cloneGraph`: the graph can have cycles.
- `canFinish`: with no prerequisites, the answer is `true`. A self-loop `{x, x}` is a cycle.
- `canFinish`: a cycle among some courses returns `false`, even when other courses are free.
- `canFinish`: pairs can repeat, and a course can appear in many pairs.

```java
numIslands(new char[][]{
    {'1', '1', '1', '1', '0'},
    {'1', '1', '0', '1', '0'},
    {'1', '1', '0', '0', '0'},
    {'0', '0', '0', '0', '0'},
}); // 1

numIslands(new char[][]{
    {'1', '1', '0', '0', '0'},
    {'1', '1', '0', '0', '0'},
    {'0', '0', '1', '0', '0'},
    {'0', '0', '0', '1', '1'},
}); // 3

// Diagonal contact does not join
numIslands(new char[][]{
    {'1', '0'},
    {'0', '1'},
}); // 2

numIslands(new char[][]{{'0'}}); // 0
numIslands(new char[][]{{'1'}}); // 1

Map<String, List<String>> graph =
    Map.of(
        "1", List.of("2", "4"),
        "2", List.of("1", "3"),
        "3", List.of("2", "4"),
        "4", List.of("1", "3"));
var clone = cloneGraph(graph);
clone.equals(graph);       // true
clone != graph;            // true
// true
clone.get("1") != graph.get("1");

Map<String, List<String>> pair =
    Map.of("1", List.of("2"),
           "2", List.of("1"));
var copy = cloneGraph(pair);
copy.get("1").add("9");
// pair is still {1=[2], 2=[1]}

// {} (a new map)
cloneGraph(new HashMap<>());
// {7=[]}, with a new empty list
cloneGraph(Map.of("7", List.of()));

// 0 then 1
canFinish(2, new int[][]{{1, 0}});
// true
// Mutual dependency
canFinish(2,
    new int[][]{{1, 0}, {0, 1}});
// false
// No constraints
canFinish(3, new int[][]{});  // true
// A course that requires itself
canFinish(1, new int[][]{{0, 0}});
// false
```
