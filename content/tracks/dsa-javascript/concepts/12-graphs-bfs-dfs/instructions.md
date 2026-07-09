# Graphs

## What you'll learn

The tree traversals you already have, generalized to structures with cycles: flood fill over grids (graphs you never build), traversal with a visited map (graphs given as adjacency data), and topological sorting of dependency graphs (Kahn's algorithm). These three shapes — grid, adjacency, dependency — cover almost every graph problem in the interview canon.

## Key concepts

### Trees are graphs without the bookkeeping

Everything from tree DFS/BFS carries over, plus exactly one new obligation: **track visited nodes**. A tree can't revisit a node; a graph with a cycle will loop forever without a visited set. Every graph algorithm below is a tree traversal plus a visited mechanism — the only design choices are how the graph is represented and how "visited" is recorded.

### Grids are implicit graphs — flood fill

A 2-D grid is a graph where each cell has up to four neighbors (up, down, left, right — not diagonals, unless stated). Nobody builds an adjacency list; you compute neighbors on the fly and bounds-check:

```js
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function floodFill(grid, r, c) {          // iterative DFS with an explicit stack
  const rows = grid.length, cols = grid[0].length;
  const stack = [[r, c]];
  grid[r][c] = "0";                       // mark visited by mutating the grid
  while (stack.length > 0) {
    const [cr, cc] = stack.pop();
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr, nc = cc + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
        grid[nr][nc] = "0";               // mark when PUSHING, not when popping
        stack.push([nr, nc]);
      }
    }
  }
}
```

Marking cells by mutating the grid doubles as the visited set — O(1) extra space beyond the stack. If the input must survive, use a `visited` Set of `r * cols + c` keys instead. The explicit stack avoids blowing the call stack on large grids (a 1000×1000 all-land grid means a million recursive frames).

### Adjacency data — traversal with a visited map

When the graph arrives as explicit adjacency data (`{ node: [neighbors] }` or edge pairs), BFS/DFS is the tree template plus a `Set`/`Map` of visited nodes. The load-bearing rule: **mark a node visited when you enqueue/push it, not when you dequeue it** — otherwise a node reachable two ways enters the queue twice.

Deep-copying a graph is this same traversal with the visited map storing *the copy* of each node: "have I already created this node's clone?" replaces "have I seen this node?".

### Dependency graphs — Kahn's topological sort

Prerequisite pairs define a directed graph. "Can all courses be finished" = "is the graph acyclic", and the constructive way to prove it is to peel nodes with no remaining prerequisites:

```js
function topologicalOrder(n, edges) {     // edges: [to, from] prerequisite pairs
  const adj = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [to, from] of edges) {
    adj[from].push(to);                   // from must come before to
    indegree[to]++;
  }
  const queue = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);
  const order = [];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    order.push(node);
    for (const next of adj[node]) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return order;                           // length < n  ⟺  a cycle exists
}
```

The invariant: a node enters the queue exactly when its last prerequisite is processed. Nodes on a cycle never reach indegree 0, so `order.length < n` detects the cycle *and* tells you which nodes are stuck. (The DFS alternative — three-color marking — finds cycles too, but Kahn's gives you the ordering for free.)

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Number of Islands | O(rows · cols) | O(rows · cols) worst-case stack | flood fill |
| Clone Graph | O(V + E) | O(V) | traversal + visited map |
| Course Schedule | O(V + E) | O(V + E) | Kahn's topological sort |

## Watch out

- **Infinite loops are the graph bug.** Any traversal without a visited mechanism cycles forever. In grids, mutate or track; in adjacency graphs, `Set`/`Map`.
- **Mark visited on push, not on pop.** Marking at dequeue lets a cell/node get queued once per incoming edge — exponential queue growth on dense graphs, and flood fill counts cells twice.
- **Grid cells are the *string* `"1"`, not the number `1`.** `grid[r][c] === 1` silently never matches and your island count is 0.
- **Bounds-check before you index.** `grid[-1]` is `undefined` (no crash), but `grid[-1][0]` throws. Check `nr`/`nc` against both dimensions before touching `grid[nr][nc]`.
- **Get the prerequisite edge direction right.** `[a, b]` means "b before a", so the edge runs `b → a` and `a`'s indegree rises. Reversed edges still detect cycles (a cycle is a cycle backwards) — the bug only surfaces in Course Schedule II when the *order* comes out inverted.
- **Recursion depth.** A snake-shaped island covering a 1000×1000 grid produces a million-deep recursion — JavaScript engines give up around ten thousand frames. Use an explicit stack (or BFS queue) for grids of unknown size.
- **Count nodes processed in Kahn's**, not queue pushes at the start. The cycle test is "did every node get peeled", i.e. `processed === numCourses`.

## Problem walkthroughs

### Number of Islands ★

**Problem.** Given a grid of `"1"` (land) and `"0"` (water) cells, count the islands — maximal groups of land cells connected horizontally or vertically (not diagonally).

**Example.**

    [["1","1","0"],
     ["0","1","0"],      →  2   (the L-shaped island, and the lone corner cell)
     ["0","0","1"]]

**Steps.**
1. Scan every cell. When you hit a `"1"`, increment the island count — this cell belongs to an island no earlier scan has touched.
2. Flood fill from that cell (stack or queue, four directions), sinking every reached `"1"` to `"0"` so the island can never be counted again.
3. Continue the scan. Every land cell is visited at most twice (once by the scan, once by a fill), so the total is linear.
4. Invariant: at any point in the scan, every `"1"` at or before the scan position has been sunk — so a fresh `"1"` always means a fresh island.

**Complexity.** O(rows · cols) time / O(rows · cols) worst-case stack (all-land grid).

### Surrounded Regions

**Problem.** Given a grid of `"X"` and `"O"`, flip to `"X"` every region of `"O"`s that is completely surrounded — i.e. no cell of the region touches the border. Mutate in place.

**Example.**

    [["X","X","X"],           [["X","X","X"],
     ["X","O","X"],      →     ["X","X","X"],     (the inner O is captured;
     ["O","X","X"]]            ["O","X","X"]]      the border O survives)

**Steps.**
1. Invert the question: a region is captured *unless* it touches the border. Finding "not surrounded" is easier than finding "surrounded".
2. Flood fill from every border `"O"`, marking reached cells with a sentinel (`"S"`).
3. Sweep the whole grid: `"O"` → `"X"` (never reached from the border ⇒ captured), `"S"` → `"O"` (restore survivors).
4. The sentinel trick avoids a separate visited set and makes the final sweep a single pass.

**Complexity.** O(rows · cols) time / O(rows · cols) worst-case fill stack.

### Clone Graph ★

**Problem.** Given a connected undirected graph, return a deep copy: a structurally identical graph sharing **no** references with the original — mutating the clone must never affect the source.

**Example.**

    { "1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"] }
    → an equal object, every array a fresh array

**Steps.**
1. The general pattern (graphs given as node objects with `neighbors` pointers): traverse with a `Map` from original node → its clone. On first visit, create the clone *and record it before* recursing into neighbors — cycles then find the half-built clone instead of recursing forever.
2. With the adjacency-object representation used here, "one clone per node, one fresh container per adjacency" becomes: create a new outer object, and for each key copy the neighbor array with a fresh array (`[...neighbors]`).
3. Copy every level. `Object.assign({}, graph)` or the spread on the outer object is a *shallow* copy — the neighbor arrays would still be shared, and pushing into the clone would corrupt the original.
4. Verify your mental model: after cloning, `clone !== graph` and `clone[k] !== graph[k]` for every node `k`, yet `deepEqual(clone, graph)` holds.

**Complexity.** O(V + E) time / O(V + E) space — every node and every adjacency entry is copied once.

### Evaluate Division

**Problem.** Given equations `a / b = k` (as pairs `[a, b]` with values `k`), answer queries `[x, y]` with the value of `x / y`, or `-1` if it cannot be determined. Variables not appearing in any equation are unknown.

**Example.**

    equations a/b = 2, b/c = 3
    queries: a/c → 6, b/a → 0.5, a/e → -1, x/x → -1 (x unknown)

**Steps.**
1. Build a weighted graph: edge `a → b` with weight 2 and the reverse edge `b → a` with weight 1/2 for every equation.
2. A query `x / y` is a path from `x` to `y`; the answer is the **product of edge weights** along it. Consistent inputs make any path give the same product.
3. Per query: return -1 if either endpoint is absent; otherwise BFS/DFS from `x` carrying the running product, with a visited set; return the product on reaching `y`, -1 if unreachable.
4. This is plain traversal — the only twist is carrying an accumulator on the path, the same shape as carrying a distance in BFS.

**Complexity.** O(Q · (V + E)) time for Q queries / O(V + E) space. (Union-Find with weighted ratios answers repeated queries faster.)

### Course Schedule ★

**Problem.** There are `numCourses` courses labeled `0 … numCourses − 1` and prerequisite pairs `[a, b]` meaning "you must take `b` before `a`". Return `true` if every course can be taken — i.e. the prerequisite graph has no cycle.

**Example.**

    numCourses = 2, [[1, 0]]          →  true   (take 0, then 1)
    numCourses = 2, [[1, 0], [0, 1]]  →  false  (each requires the other)

**Steps.**
1. Build the adjacency list `b → a` per pair and count each node's indegree (number of unmet prerequisites).
2. Queue every course with indegree 0 — these can be taken right now.
3. Repeatedly take a course from the queue, count it as processed, and decrement the indegree of every course that depends on it; enqueue any that drop to 0.
4. Return `processed === numCourses`. Courses on a cycle wait on each other forever and never reach indegree 0 — they are exactly the ones never processed.

**Complexity.** O(V + E) time / O(V + E) space — each course and edge is handled once.

### Course Schedule II

**Problem.** Same setup, but return an actual order in which to take all courses (any valid one), or `[]` if impossible.

**Example.**

    numCourses = 4, [[1, 0], [2, 0], [3, 1], [3, 2]]  →  [0, 1, 2, 3]  (or [0, 2, 1, 3])

**Steps.**
1. Run exactly the Course Schedule algorithm, but collect each processed course into an `order` array instead of only counting.
2. The processing order is a topological order by construction: a course is only processed after all its prerequisites were.
3. Return `order` if its length is `numCourses`, else `[]`. Same code, one extra array — worth saying in an interview that II subsumes I.

**Complexity.** O(V + E) time / O(V + E) space.

## Interview follow-ups

- After **Number of Islands**: "Can't mutate the grid?" (visited set keyed by `r * cols + c`.) "Count *distinct island shapes*?" (record the fill's move sequence as a canonical signature, count unique signatures.) "Islands appear one cell at a time, count after each?" (Union-Find — incremental connectivity is its home turf.)
- After **Course Schedule**: "Which courses are impossible to take?" (the ones never peeled — indegree still positive at the end.) "Multiple valid orders — return the lexicographically smallest?" (swap Kahn's queue for a min-heap.)
- After **Clone Graph**: "Clone a linked list with random pointers?" (same visited-map pattern — the map from original to copy is the whole trick, whatever the pointer structure.)
- General: "BFS or DFS for connected components?" — either; same complexity. BFS bounds memory by frontier width and gives distances; DFS is shorter to write recursively but risks stack depth on huge components.

## The task

Three graph algorithms, one per representation. All must run in time linear in the size of their input.

### `numIslands(grid)`

`grid` is a non-empty rectangular 2-D array whose cells are the string `"1"` (land) or `"0"` (water). Return the number of islands — maximal groups of land cells connected **horizontally or vertically** (diagonal contact does not connect). You may mutate `grid` (each test builds a fresh one).

```js
numIslands([
  ["1", "1", "1", "1", "0"],
  ["1", "1", "0", "1", "0"],
  ["1", "1", "0", "0", "0"],
  ["0", "0", "0", "0", "0"],
]); // 1

numIslands([
  ["1", "1", "0", "0", "0"],
  ["1", "1", "0", "0", "0"],
  ["0", "0", "1", "0", "0"],
  ["0", "0", "0", "1", "1"],
]); // 3

numIslands([["0"]]); // 0
```

Edge cases: all water (0), all land (1), a single cell either way, diagonal-only contact counting as separate islands, snake-shaped islands winding through the grid.

### `cloneGraph(graph)`

`graph` is an undirected graph as an adjacency object: each key is a node label, each value an array of neighbor labels, e.g. `{ "1": ["2", "4"], "2": ["1", "3"], … }`. Return a **deep copy**: an object `deepEqual` to the input that shares no references with it — not the outer object and not any neighbor array. Mutating the returned clone (adding nodes, pushing neighbors) must leave the original untouched. An empty graph `{}` returns a new empty object.

```js
const graph = { "1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"] };
const clone = cloneGraph(graph);
// clone deep-equals graph, and:
clone !== graph;                  // true — new outer object
clone["1"] !== graph["1"];        // true — every neighbor array is fresh
clone["1"].push("9");             // original graph is unaffected

cloneGraph({});                   // {} (a new object)
cloneGraph({ "7": [] });          // { "7": [] } with a fresh empty array
```

Edge cases: empty graph, single node with no neighbors, cycles (the sample is one 4-cycle — labels are strings, arrays must preserve order).

### `canFinish(numCourses, prerequisites)`

Courses are labeled `0 … numCourses - 1`. Each prerequisite pair `[a, b]` means course `b` must be taken before course `a`. Return `true` if all courses can be taken in some order, `false` if the prerequisites contain a cycle. Pairs may repeat; a course may appear in many pairs.

```js
canFinish(2, [[1, 0]]);             // true   (0 then 1)
canFinish(2, [[1, 0], [0, 1]]);     // false  (mutual dependency)
canFinish(3, []);                   // true   (no constraints)
canFinish(1, [[0, 0]]);             // false  (a course requiring itself)
```

Edge cases: no prerequisites at all, a self-loop `[x, x]`, a cycle among a subset while other courses are free, duplicate pairs, long dependency chains.
