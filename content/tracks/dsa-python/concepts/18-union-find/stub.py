class UnionFind:
    """Union-Find with path compression and union by rank."""

    def __init__(self, n: int) -> None:
        # TODO: initialize parent list (each node is its own root),
        #       rank list (all zeros), and components counter set to n
        self.parent: list[int] = []
        self.rank: list[int] = []
        self.components: int = n

    def find(self, x: int) -> int:
        """Return root of x's component with path compression."""
        # TODO: if parent[x] != x, recursively find root and compress path
        return x

    def union(self, x: int, y: int) -> bool:
        """Union components of x and y. Return True if they were disjoint."""
        # TODO: find roots; if same root return False;
        #       attach smaller rank under larger; update rank and components; return True
        return False

    def connected(self, x: int, y: int) -> bool:
        """Return True if x and y are in the same component."""
        # TODO: return find(x) == find(y)
        return False


def num_connected_components(n: int, edges: list[list[int]]) -> int:
    """Given n nodes (0..n-1) and undirected edges, return the number
    of connected components."""
    # TODO: build UnionFind(n), union all edges, return uf.components
    return n


def earliest_connection_time(connections: list[list[int]], n: int) -> int:
    """connections[i] = [time, u, v]. Return the earliest time at which
    all n nodes (0..n-1) are connected. Return -1 if impossible."""
    # TODO: sort connections by time; union edges one by one;
    #       return time when uf.components == 1; return -1 if never
    return -1


if __name__ == "__main__":
    uf = UnionFind(5)
    uf.union(0, 1)
    uf.union(1, 2)
    print(uf.connected(0, 2))  # True
    print(uf.connected(0, 3))  # False
    print(uf.components)       # 3

    print(num_connected_components(5, [[0, 1], [1, 2], [3, 4]]))  # 2
    print(num_connected_components(5, []))                          # 5

    conns = [[1, 0, 1], [2, 1, 2], [3, 2, 3], [4, 3, 4]]
    print(earliest_connection_time(conns, 5))               # 4
    print(earliest_connection_time([[1, 0, 1], [2, 0, 2]], 4))  # -1
