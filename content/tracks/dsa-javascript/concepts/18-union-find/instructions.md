# Union-Find (Disjoint Set Union)

## What you'll learn

How Union-Find achieves near-O(1) amortized connectivity queries using path compression and union by rank — and when to prefer it over BFS/DFS for graph connectivity problems. You'll implement the core data structure and two classic applications.

## Key concepts

A Union-Find (DSU) structure tracks which elements belong to the same set. Every element starts in its own set. Two operations:

- `find(x)` — returns the root/representative of x's set
- `union(a, b)` — merges the sets containing a and b

```js
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
}
```

### Path compression in `find`

On the way back up, point every node directly to the root.

```js
find(x) {
  if (this.parent[x] !== x) {
    this.parent[x] = this.find(this.parent[x]); // compress
  }
  return this.parent[x];
}
```

### Union by rank

Attach the shorter tree under the taller one to keep trees flat.

```js
union(a, b) {
  const ra = this.find(a), rb = this.find(b);
  if (ra === rb) return false; // already connected
  if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
  else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
  else { this.parent[rb] = ra; this.rank[ra]++; }
  return true;
}
```

### connected

```js
connected(a, b) {
  return this.find(a) === this.find(b);
}
```

### numConnectedComponents

Count groups by tracking how many successful merges reduce the component count.

```js
function numConnectedComponents(n, edges) {
  const uf = new UnionFind(n);
  let components = n;
  for (const [a, b] of edges) {
    if (uf.union(a, b)) components--;
  }
  return components;
}
```

### earliestConnectionTime

Given connections arriving one by one with timestamps, find the earliest time when all nodes are in one connected component.

```js
function earliestConnectionTime(n, connections) {
  // connections: [[time, u, v], ...]
  connections.sort((a, b) => a[0] - b[0]); // process in time order
  const uf = new UnionFind(n);
  let components = n;
  for (const [time, u, v] of connections) {
    if (uf.union(u, v)) {
      components--;
      if (components === 1) return time; // all connected
    }
  }
  return -1; // never fully connected
}
```

## Time and space complexity

| Operation | Time |
|-----------|------|
| find | O(α(n)) amortized — effectively O(1) |
| union | O(α(n)) amortized |
| connected | O(α(n)) amortized |
| numConnectedComponents | O(E · α(n)) |
| earliestConnectionTime | O(E log E + E · α(n)) |

`α` is the inverse Ackermann function. For all practical inputs, α(n) ≤ 4.

## Common variations

- **Number of Islands** (LC 200) — can also be solved with UF instead of BFS/DFS
- **Redundant Connection** (LC 684) — detect cycle: if `union` returns false, edge creates a cycle
- **Accounts Merge** (LC 721) — union emails, then group by root
- **Minimum Spanning Tree (Kruskal)** — sort edges by weight, union greedily until all connected

## vs other languages

In Python this is often written as a flat dict `parent = {i: i}`. In Java you'd use `int[]` arrays. In JavaScript, typed arrays (`Int32Array`) give better cache performance for large `n`, but plain arrays are idiomatic for interview code. There is no built-in DSU in any of these languages — you always implement it.

## FAANG follow-up questions

After UnionFind / numConnectedComponents:
- "How does path compression affect repeated `find` calls on a deep chain?" — the first call is O(log n), all subsequent calls are O(1) because the chain is flattened.
- "What's the difference between union by rank and union by size?" — size tracks actual element count (slightly more accurate), rank tracks tree height (simpler). Both achieve the same amortized complexity.
- "Can UnionFind detect a cycle in a directed graph?" — no; it only detects cycles in undirected graphs. For directed graphs use DFS with coloring.

After earliestConnectionTime:
- "What if you want the earliest time when a specific pair (u, v) connects?" — stop as soon as `uf.connected(u, v)` returns true instead of checking `components === 1`.
- "What if connections can fail after time t?" — UF doesn't support deletions; you'd need an offline algorithm processing events in reverse, or a link-cut tree.

## Watch out

- **`find` returns roots, not values**: don't compare `find(a) === b`; compare `find(a) === find(b)`.
- **Node indices**: nodes are integers 0..n-1. If given arbitrary IDs, map them first.
- **`union` return value**: return `false` when already connected — this is the cycle-detection signal.
- **earliestConnectionTime sort**: the connections array must be sorted by time before processing. Missing this gives wrong answers silently.

## The task

### `UnionFind` class

Implement with constructor `(n)` and methods:
- `find(x)` — return root of x's component, with path compression
- `union(a, b)` — merge components; return `true` if merged, `false` if already connected
- `connected(a, b)` — return `true` if a and b share a component

```js
const uf = new UnionFind(5);
uf.union(0, 1);
uf.union(1, 2);
uf.connected(0, 2)  // true
uf.connected(0, 3)  // false
```

### `numConnectedComponents(n, edges)`

Given `n` nodes (0..n-1) and an array of undirected edges, return the number of connected components.

```js
numConnectedComponents(5, [[0,1],[1,2],[3,4]])  // 2
numConnectedComponents(4, [[0,1],[2,3],[1,2]])  // 1
numConnectedComponents(3, [])                   // 3
```

### `earliestConnectionTime(n, connections)`

Given `n` nodes (0..n-1) and an array `connections` where each element is `[time, u, v]` representing an undirected edge added at `time`, return the earliest `time` at which all nodes become connected. Return `-1` if they never all connect.

```js
earliestConnectionTime(4, [[2,0,1],[3,1,2],[5,2,3]])  // 5
earliestConnectionTime(3, [[1,0,1],[2,1,2]])           // 2
earliestConnectionTime(4, [[1,0,1],[2,1,2]])           // -1 — node 3 never joins
```
