# Union-Find (Disjoint Set Union)

## What you'll learn

How to answer connectivity queries in near-O(1) amortized time using path compression and union by rank. Union-Find is the go-to structure when edges are added incrementally — it beats DFS/BFS for online connectivity problems.

## Key concepts

### The UnionFind data structure

```java
static class UnionFind {
    private final int[] parent;
    private final int[] rank;

    public UnionFind(int n) {
        parent = new int[n];
        rank   = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i; // every node is its own root
    }

    public int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }

    public void union(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA == rootB) return; // already in the same component
        if (rank[rootA] < rank[rootB]) { int tmp = rootA; rootA = rootB; rootB = tmp; }
        parent[rootB] = rootA;      // attach smaller tree under larger
        if (rank[rootA] == rank[rootB]) rank[rootA]++;
    }

    public boolean connected(int a, int b) {
        return find(a) == find(b);
    }
}
```

**Path compression**: `parent[x] = find(parent[x])` — one line that finds the root AND flattens the path for future calls.

**Union by rank**: always attach the shorter tree under the taller one. Without this, degenerate inputs create O(n)-height trees.

### Counting connected components

```java
public static int numConnectedComponents(int n, int[][] edges) {
    var uf = new UnionFind(n);
    int components = n; // start: n isolated nodes = n components
    for (int[] edge : edges) {
        if (!uf.connected(edge[0], edge[1])) {
            uf.union(edge[0], edge[1]);
            components--;
        }
    }
    return components;
}
```

### Earliest connection time (offline Kruskal-style)

Given edges with timestamps, find the earliest time when all nodes are connected. Sort by timestamp; union-find until one component remains.

```java
public static int earliestConnectionTime(int n, int[][] connections) {
    // connections[i] = [time, node1, node2]
    Arrays.sort(connections, (a, b) -> a[0] - b[0]); // sort by time
    var uf = new UnionFind(n);
    int components = n;
    for (int[] conn : connections) {
        if (!uf.connected(conn[1], conn[2])) {
            uf.union(conn[1], conn[2]);
            components--;
            if (components == 1) return conn[0]; // all nodes connected
        }
    }
    return -1; // impossible
}
```

This is Kruskal's algorithm for Minimum Spanning Tree, adapted for time instead of weight.

## Time and space complexity

| Operation | Without optimizations | With path compression + union by rank |
|-----------|----------------------|--------------------------------------|
| `find` | O(n) worst | O(α(n)) ≈ O(1) amortized |
| `union` | O(n) worst | O(α(n)) ≈ O(1) amortized |
| `numConnectedComponents` | O(n + E·n) | O(n + E·α(n)) ≈ O(n + E) |
| `earliestConnectionTime` | O(E log E + E·α(n)) | O(E log E) — sort dominates |

α = inverse Ackermann function; for any practical n, α(n) ≤ 4.

## Common variations this pattern solves

1. **Cycle detection in undirected graph** — if `union` finds both nodes in the same component, the edge creates a cycle
2. **Minimum Spanning Tree (Kruskal's)** — sort edges by weight; union if not already connected
3. **Making a Large Island** — flip a 0 to 1 and find the largest resulting island; union-find all existing islands
4. **Redundant Connection** — the first edge that connects two already-connected nodes is the answer

## vs DFS/BFS

| | DFS/BFS | Union-Find |
|-|---------|-----------|
| Static connectivity | O(V + E) once | O(α(n)) per query after O(n) build |
| Dynamic edge additions | Re-run each time: O(V + E) | O(α(n)) per edge |
| Cycle detection (undirected) | O(V + E) | O(α(n)) per edge |

Use DFS/BFS when you need shortest path or traversal order. Use Union-Find when you only need connectivity.

## Watch out

- **Path compression stack depth**: the recursive `find` can overflow for chains of length n without intermediate compression. For very large n, use iterative path compression.
- **Union by rank vs union by size**: both are valid. By rank, `rank` only tracks upper bound on height. By size, store actual component sizes — more useful if you need to know component sizes.
- **`earliestConnectionTime` with 0-indexed vs 1-indexed nodes**: the problem statement determines indexing. Initialize `UnionFind(n)` for 0-indexed (nodes 0 to n-1) or `UnionFind(n+1)` for 1-indexed (nodes 1 to n).
- **Merging without tracking count**: computing the number of components by iterating `parent` and counting roots is O(n). Tracking `components` as a counter during `union` calls is O(1) per update.

## FAANG follow-up questions

> "What's the inverse Ackermann function α(n) in practice?" — For all n ≤ 10^600, α(n) ≤ 5. It's treated as constant in all practical analyses.
>
> "Can Union-Find handle edge deletions?" — No. It's an offline algorithm for edge additions only. Dynamic connectivity with deletions requires link-cut trees (O(log n) per operation).
>
> "How does Union-Find detect cycles in undirected graphs?" — If `find(a) == find(b)` before `union(a, b)`, nodes `a` and `b` are already connected, so the edge `(a, b)` creates a cycle.
>
> "What if I need to know the actual members of each component?" — Union-Find doesn't support this natively. Maintain a `HashMap<Integer, List<Integer>>` keyed by root, or run a DFS/BFS on the original graph.

## The task

Implement `UnionFind` as a static inner class and two static methods in `Solution`:

```java
static class UnionFind {
    public UnionFind(int n)
    public int find(int x)                  // root of x's component
    public void union(int a, int b)         // merge a's and b's components
    public boolean connected(int a, int b)  // true if same component
}

// Returns the number of connected components in an undirected graph
// with n nodes (0-indexed) and the given edges.
// numConnectedComponents(5, [[0,1],[1,2],[3,4]]) -> 2
public static int numConnectedComponents(int n, int[][] edges)

// Returns the earliest time at which all nodes become connected.
// connections[i] = [time, node1, node2] (0-indexed nodes).
// Returns -1 if it's impossible for all nodes to connect.
// n=4, connections=[[20,0,1],[10,0,2],[30,1,3],[25,2,3]] -> 30
public static int earliestConnectionTime(int n, int[][] connections)
```
