class UnionFind:
    """Union-Find with path compression and union by rank."""

    def __init__(self, n: int) -> None:
        self.parent: list[int] = list(range(n))
        self.rank: list[int] = [0] * n
        self.components: int = n

    def find(self, x: int) -> int:
        """Return root of x's component with path compression."""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        """Union components of x and y. Return True if they were disjoint."""
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        self.components -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        """Return True if x and y are in the same component."""
        return self.find(x) == self.find(y)


def num_connected_components(n: int, edges: list[list[int]]) -> int:
    """Given n nodes (0..n-1) and undirected edges, return the number
    of connected components."""
    uf = UnionFind(n)
    for u, v in edges:
        uf.union(u, v)
    return uf.components


def earliest_connection_time(connections: list[list[int]], n: int) -> int:
    """connections[i] = [time, u, v]. Return the earliest time at which
    all n nodes (0..n-1) are connected. Return -1 if impossible."""
    connections.sort()
    uf = UnionFind(n)
    for time, u, v in connections:
        uf.union(u, v)
        if uf.components == 1:
            return time
    return -1
