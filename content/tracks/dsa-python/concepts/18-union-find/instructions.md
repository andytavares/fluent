# Union-Find (Disjoint Set Union)

## What you'll learn

How Union-Find tracks dynamic connectivity in near-O(1) per operation, why path compression and union by rank are both required for optimal complexity, and how the data structure solves "earliest moment all nodes connect" — a common FAANG twist.

## Key concepts

Union-Find maintains a forest of trees where every node's root identifies its component. Two optimizations make it fast:

- **Path compression** — on `find`, flatten the tree by pointing every node directly to its root.
- **Union by rank** — always attach the shorter tree under the taller one, keeping trees flat.

Together they give amortized O(α(n)) per operation, where α is the inverse Ackermann function — effectively O(1).

```python
class UnionFind:
    def __init__(self, n: int) -> None:
        self.parent = list(range(n))   # each node is its own root
        self.rank = [0] * n            # tree heights (upper bound)
        self.components = n

    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False               # already in same component
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx           # attach smaller tree under larger
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1        # only increases when ranks were equal
        self.components -= 1
        return True                   # merged two previously disjoint sets

    def connected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)
```

### Connected components

Count components by starting at `n` and decrementing on each successful `union`:

```python
def num_connected_components(n: int, edges: list[list[int]]) -> int:
    uf = UnionFind(n)
    for u, v in edges:
        uf.union(u, v)
    return uf.components
```

### Earliest connection time

Given edges arriving at known timestamps `[time, u, v]`, find the earliest time when all `n` nodes are in one component. Sort by time, union greedily, stop when `components == 1`:

```python
def earliest_connection_time(connections: list[list[int]], n: int) -> int:
    connections.sort()               # sort by time ascending
    uf = UnionFind(n)
    for time, u, v in connections:
        uf.union(u, v)
        if uf.components == 1:
            return time
    return -1                        # never fully connected
```

The sort is the key step — `connections` may arrive out of time order.

## Time and space complexity

| Operation | Time | Space |
|-----------|------|-------|
| `find` | O(α(n)) amortized | O(1) |
| `union` | O(α(n)) amortized | O(1) |
| `num_connected_components` (E edges) | O(E · α(n)) | O(n) |
| `earliest_connection_time` (E edges) | O(E log E + E · α(n)) | O(n) |

## Common variations

- **Number of Provinces** — given an adjacency matrix, count connected components with Union-Find or DFS.
- **Redundant Connection** — given a graph that started as a tree and had one edge added, find the redundant edge: the first `union` call that returns `False` (nodes already connected).
- **Accounts Merge** — union email addresses that share accounts; final component roots identify merged accounts.
- **Minimum Spanning Tree (Kruskal's)** — sort edges by weight, greedily union; stop when all nodes connected.

## vs other languages

| Language | Typical UF implementation |
|----------|--------------------------|
| Python | List-based `parent` and `rank`; recursive `find` with path compression |
| Java | Same list approach; `find` often iterative to avoid stack overflow on large n |
| C++ | `vector<int>`; same recursive or iterative `find` |
| Go | Slice-based; no recursion limit issues |

Python's default recursion limit is 1000. For very large inputs (`n > 500`), prefer iterative path compression to avoid `RecursionError`:

```python
def find(self, x: int) -> int:
    while self.parent[x] != x:
        self.parent[x] = self.parent[self.parent[x]]  # path halving (iterative)
        x = self.parent[x]
    return x
```

Path halving (two-step hop) achieves the same O(α(n)) bound without recursion.

## Watch out

- **Path compression alone is O(log n)** — you need both path compression and union by rank (or union by size) to get O(α(n)).
- **Union by rank vs size** — rank is an upper bound on height (not exact after compression). Union by size (`self.size`) is simpler to reason about; either gives the same asymptotic bound.
- **`union` return value matters** — returning `bool` (whether a merge happened) is critical for Redundant Connection and Earliest Connection Time. Forgetting this return value is a common bug.
- **`components` counter** — decrement only on successful merge (when `rx != ry`). Decrementing on redundant edges is a classic off-by-one.
- **Off-by-one in node numbering** — problems may use 1-indexed nodes. Construct `UnionFind(n + 1)` or remap to 0-indexed before using.

## FAANG follow-up questions

> "What is the difference between path compression and path halving?" — Path compression sets every node on the find path directly to the root (two passes). Path halving skips every other node in one pass. Both achieve O(α(n)) amortized.

> "Why do you need union by rank *and* path compression? Can't you get O(α(n)) with just one?" — Path compression alone achieves O(log* n) amortized. Union by rank alone achieves O(log n) worst case. Only together do you get O(α(n)) amortized.

> "How would you support `undo` in Union-Find?" — Path compression and union by rank make undo difficult. Use union by rank only (no path compression) and maintain a stack of (rx, ry, old_rank) tuples. This gives O(log n) with rollback capability — used in offline LCA algorithms.

## The task

```python
class UnionFind:
    def __init__(self, n: int) -> None: ...
    def find(self, x: int) -> int:
        """Return root of x's component (with path compression)."""
    def union(self, x: int, y: int) -> bool:
        """Union components of x and y. Return True if they were disjoint."""
    def connected(self, x: int, y: int) -> bool:
        """Return True if x and y are in the same component."""

def num_connected_components(n: int, edges: list[list[int]]) -> int:
    """Given n nodes (0..n-1) and undirected edges, return the number
    of connected components."""

def earliest_connection_time(connections: list[list[int]], n: int) -> int:
    """connections[i] = [time, u, v]. Return the earliest time at which
    all n nodes (0..n-1) are connected. Return -1 if impossible."""
```

**Examples:**
- `num_connected_components(5, [[0,1],[1,2],[3,4]])` → `2`
- `num_connected_components(5, [])` → `5`
- `earliest_connection_time([[1,0,1],[2,1,2],[3,2,3],[4,3,4]], 5)` → `4`
- `earliest_connection_time([[1,0,1],[2,0,2]], 4)` → `-1` (node 3 never connected)
