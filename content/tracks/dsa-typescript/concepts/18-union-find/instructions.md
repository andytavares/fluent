# Union-Find (Disjoint Sets)

## What you'll learn

How Union-Find achieves near-O(1) per operation for dynamic connectivity using two optimizations: path compression and union by rank. You'll implement the `UnionFind` class, `numConnectedComponents`, and `earliestConnectionTime`.

## Key concepts

### Union-Find structure

Each element points to a parent. The root of a tree is its own parent. Two elements are in the same set iff they share a root.

```typescript
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i); // each node is its own root
    this.rank = new Array<number>(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      // Path compression: flatten the tree; every node on the path
      // now points directly to the root
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(a: number, b: number): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return false; // already same set

    // Union by rank: attach smaller-rank tree under larger-rank root
    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA]++; // tie: increment the new root's rank
    }
    return true; // a merge happened
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }
}
```

**Path compression** (in `find`): after finding the root, every intermediate node is re-pointed to the root. Future `find` calls on those nodes take O(1).

**Union by rank**: prevents degenerate chains. Without it, a sequence of unions could create an O(n)-depth tree; with it, depth is bounded by O(log n).

### Count connected components

Start with n components. Each successful union (where the two nodes aren't already connected) reduces the count by 1.

```typescript
function numConnectedComponents(n: number, edges: [number, number][]): number {
  const uf = new UnionFind(n);
  let components = n;
  for (const [a, b] of edges) {
    if (uf.union(a, b)) components--; // union returns true if a merge happened
  }
  return components;
}
```

### Earliest connection time

Given `n` nodes and timestamped edges `[time, a, b]`, return the earliest time at which all nodes are connected (in one component).

```typescript
function earliestConnectionTime(n: number, edges: [number, number, number][]): number {
  // Sort by timestamp
  edges.sort((a, b) => a[0] - b[0]);

  const uf = new UnionFind(n);
  let components = n;

  for (const [time, a, b] of edges) {
    if (uf.union(a, b)) {
      components--;
      if (components === 1) return time; // all nodes connected
    }
  }
  return -1; // impossible
}
```

## Complexity

| Operation | Time (amortized) | Notes |
|-----------|-----------------|-------|
| `find` | O(α(n)) | α = inverse Ackermann ≤ 4 for n < 10^600 |
| `union` | O(α(n)) | With path compression + union by rank |
| `connected` | O(α(n)) | |
| `numConnectedComponents` | O(E · α(V)) | E edges, V nodes |
| `earliestConnectionTime` | O(E log E + E · α(V)) | Sort + union-find |

## Common variations

- **Cycle detection in undirected graph** — union each edge; if the two endpoints already have the same root, it's a cycle
- **Kruskal's MST** — sort edges by weight, union them greedily, skip edges that would form cycles
- **Accounts merge (LeetCode 721)** — union emails by account; collect grouped results
- **Number of islands II (dynamic)** — process land cells arriving over time; union with adjacent land cells

## vs BFS/DFS for connectivity

| Approach | Setup | Per query | Dynamic edges |
|----------|-------|-----------|---------------|
| BFS/DFS | O(V+E) | O(V+E) per query | Rebuild each time |
| Union-Find | O(E·α(V)) | O(α(V)) | Add edge in O(α(V)) |

Union-Find shines when edges are added dynamically (online) and you need connectivity queries between additions.

## Watch out

- **`find` is recursive**: deep trees (before path compression) could stack-overflow. An iterative `find` using a while loop is safer for production. After path compression, `find` is nearly flat in subsequent calls.
- **`union` returns `bool` to indicate a new merge**: if you don't track this, you'll double-count merges in `numConnectedComponents`. The exemplar has `union` return `boolean` — the stub does the same.
- **`parent[x] = this.find(parent[x])`**: the path compression is applied recursively, so all ancestors on the path get compressed. This is correct; don't manually set only the direct parent.
- **Union by rank vs union by size**: both work; rank avoids recomputing sizes. With path compression, rank is an upper bound on height, not the exact height.

## FAANG follow-up questions

> After solving all three, interviewers commonly ask:
> - "What is the inverse Ackermann function?" (It's a function that grows so slowly it's effectively constant for all practical inputs. α(10^600) = 4. You'll never see α(n) > 5 in any real program.)
> - "How would you use Union-Find to detect cycles in an undirected graph?" (Process each edge; if both endpoints already have the same root, adding this edge creates a cycle. Kruskal's MST uses this exact approach.)
> - "Can Union-Find support deletion?" (Standard Union-Find doesn't support deletion. If you need dynamic connectivity with deletions, consider link-cut trees — much more complex, O(log n) per operation.)
> - "How would you solve `earliestConnectionTime` with BFS?" (Sort edges by time, add them one by one, and check connectivity via BFS/DFS after each addition. O(E²) worst case — Union-Find is significantly faster.)

## The task

Implement the `UnionFind` class and two functions:

```typescript
// Union-Find with path compression and union by rank.
class UnionFind {
  constructor(n: number)
  find(x: number): number           // root of x's set
  union(a: number, b: number): boolean  // merge; return true if a new merge happened
  connected(a: number, b: number): boolean
}

// Return the number of connected components among n nodes (0..n-1).
// n=5, edges=[[0,1],[1,2],[3,4]] → 2
// n=5, edges=[]                  → 5
function numConnectedComponents(n: number, edges: [number, number][]): number

// Given n nodes (0..n-1) and timestamped edges [time, a, b] (a connects to b at time),
// return the earliest time when all nodes are in a single connected component.
// Return -1 if it's impossible.
// n=6, edges=[[1,0,1],[2,1,2],[3,2,3],[4,0,4],[5,2,5],[6,3,4]] → 4
function earliestConnectionTime(n: number, edges: [number, number, number][]): number
```
