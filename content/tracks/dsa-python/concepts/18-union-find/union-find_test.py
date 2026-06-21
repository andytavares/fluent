import sys
from stub import UnionFind, num_connected_components, earliest_connection_time

passed = 0
failed = 0


def test(name: str, condition: bool, detail: str = "") -> None:
    global passed, failed
    if condition:
        print(f"  PASS: {name}")
        passed += 1
    else:
        msg = f" — {detail}" if detail else ""
        print(f"  FAIL: {name}{msg}")
        failed += 1


# UnionFind — basic connectivity
uf = UnionFind(5)
test("uf: initially disconnected 0,1", uf.connected(0, 1) is False)
test("uf: initially disconnected 2,4", uf.connected(2, 4) is False)
test("uf: initial components == 5", uf.components == 5, f"got {uf.components}")

uf.union(0, 1)
test("uf: connected after union(0,1)", uf.connected(0, 1) is True)
test("uf: symmetric 1,0", uf.connected(1, 0) is True)
test("uf: 0,2 still disconnected", uf.connected(0, 2) is False)
test("uf: components == 4 after 1 union", uf.components == 4, f"got {uf.components}")

uf.union(1, 2)
test("uf: transitive 0,2 after union(1,2)", uf.connected(0, 2) is True)
test("uf: 0,3 still disconnected", uf.connected(0, 3) is False)
test("uf: components == 3 after 2 unions", uf.components == 3, f"got {uf.components}")

uf.union(3, 4)
test("uf: connected 3,4", uf.connected(3, 4) is True)
test("uf: 0,4 across two components", uf.connected(0, 4) is False)

uf.union(2, 3)
test("uf: all connected after union(2,3)", uf.connected(0, 4) is True)
test("uf: components == 1 when fully connected", uf.components == 1, f"got {uf.components}")

# union returns bool
uf2 = UnionFind(3)
r1 = uf2.union(0, 1)
test("uf: union returns True when disjoint", r1 is True)
r2 = uf2.union(0, 1)
test("uf: union returns False when already connected", r2 is False)

# find returns same root for connected nodes
test("uf: find(0)==find(1)", uf2.find(0) == uf2.find(1))
test("uf: find(2)!=find(0)", uf2.find(2) != uf2.find(0))

# redundant edge doesn't corrupt components count
uf3 = UnionFind(3)
uf3.union(0, 1)
uf3.union(1, 2)
redundant = uf3.union(0, 2)
test("uf: redundant edge union returns False", redundant is False)
test("uf: components unaffected by redundant union", uf3.components == 1, f"got {uf3.components}")

# num_connected_components
result = num_connected_components(5, [[0, 1], [1, 2], [3, 4]])
test("components: two components", result == 2, f"got {result}, want 2")

result = num_connected_components(5, [[0, 1], [1, 2], [2, 3], [3, 4]])
test("components: single chain", result == 1, f"got {result}, want 1")

result = num_connected_components(5, [])
test("components: no edges", result == 5, f"got {result}, want 5")

result = num_connected_components(1, [])
test("components: single node", result == 1, f"got {result}, want 1")

result = num_connected_components(4, [[0, 1], [2, 3]])
test("components: two pairs", result == 2, f"got {result}, want 2")

result = num_connected_components(3, [[0, 1], [1, 2], [0, 2]])
test("components: triangle (cycle)", result == 1, f"got {result}, want 1")

# earliest_connection_time
result = earliest_connection_time([[1, 0, 1], [2, 1, 2], [3, 2, 3], [4, 3, 4]], 5)
test("earliest: linear chain", result == 4, f"got {result}, want 4")

result = earliest_connection_time([[5, 0, 1], [1, 1, 2], [3, 2, 0]], 3)
test("earliest: out-of-order timestamps", result == 3, f"got {result}, want 3")

result = earliest_connection_time([[1, 0, 1]], 2)
test("earliest: two nodes one edge", result == 1, f"got {result}, want 1")

result = earliest_connection_time([[1, 0, 1], [2, 0, 2]], 4)
test("earliest: impossible (node 3 isolated)", result == -1, f"got {result}, want -1")

result = earliest_connection_time([], 3)
test("earliest: no edges returns -1", result == -1, f"got {result}, want -1")

result = earliest_connection_time([[10, 0, 1], [5, 1, 2], [1, 0, 2]], 3)
test("earliest: triangle connected at time 5", result == 5, f"got {result}, want 5")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
