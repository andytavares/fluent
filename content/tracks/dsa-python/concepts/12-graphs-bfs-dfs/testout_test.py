import sys
from stub import num_islands, clone_graph, can_finish

passed = 0
failed = 0


def test(name, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


# -- num_islands --
test("num_islands: one large island", lambda: assert_eq(num_islands([
    ["1", "1", "1", "1", "0"],
    ["1", "1", "0", "1", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
]), 1))
test("num_islands: three separate islands", lambda: assert_eq(num_islands([
    ["1", "1", "0", "0", "0"],
    ["1", "1", "0", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "0", "1", "1"],
]), 3))
test("num_islands: single water cell", lambda: assert_eq(num_islands([["0"]]), 0))
test("num_islands: single land cell", lambda: assert_eq(num_islands([["1"]]), 1))
test("num_islands: all water", lambda: assert_eq(num_islands([
    ["0", "0", "0"],
    ["0", "0", "0"],
    ["0", "0", "0"],
]), 0))
test("num_islands: all land is one island", lambda: assert_eq(num_islands([
    ["1", "1", "1"],
    ["1", "1", "1"],
    ["1", "1", "1"],
]), 1))
test("num_islands: diagonal contact does not connect", lambda: assert_eq(num_islands([
    ["1", "0"],
    ["0", "1"],
]), 2))
test("num_islands: ring-shaped island counts once", lambda: assert_eq(num_islands([
    ["1", "1", "1"],
    ["1", "0", "1"],
    ["1", "1", "1"],
]), 1))


def _serpentine():
    n = 50
    grid = []
    for r in range(n):
        if r % 2 == 0:
            grid.append(["1"] * n)
        else:
            row = ["0"] * n
            row[n - 1 if r % 4 == 1 else 0] = "1"
            grid.append(row)
    assert_eq(num_islands(grid), 1)


test("num_islands: 50x50 serpentine is a single island", _serpentine)


def _checkerboard():
    n = 101
    grid = [["1" if (r + c) % 2 == 0 else "0" for c in range(n)] for r in range(n)]
    assert_eq(num_islands(grid), 5101)  # ceil(101*101 / 2) isolated cells


test("num_islands: 101x101 checkerboard", _checkerboard)

# -- clone_graph --
test("clone_graph: clone deep-equals a 4-cycle", lambda: assert_eq(
    clone_graph({"1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"]}),
    {"1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"]}))


def _diff_outer():
    graph = {"1": ["2"], "2": ["1"]}
    assert clone_graph(graph) is not graph


test("clone_graph: clone is a different outer dict", _diff_outer)


def _fresh_lists():
    graph = {"1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"]}
    clone = clone_graph(graph)
    for key in graph:
        assert clone[key] is not graph[key], f'clone["{key}"] shares the original list'


test("clone_graph: every neighbor list is a fresh list", _fresh_lists)


def _mutate_clone():
    graph = {"1": ["2"], "2": ["1"]}
    clone = clone_graph(graph)
    clone["1"].append("9")
    clone["3"] = ["1"]
    assert_eq(graph, {"1": ["2"], "2": ["1"]})


test("clone_graph: mutating the clone leaves the original untouched", _mutate_clone)


def _mutate_original():
    graph = {"1": ["2"], "2": ["1"]}
    clone = clone_graph(graph)
    graph["1"].append("8")
    assert_eq(clone, {"1": ["2"], "2": ["1"]})


test("clone_graph: mutating the original leaves the clone untouched", _mutate_original)


def _empty_graph():
    graph = {}
    clone = clone_graph(graph)
    assert_eq(clone, {})
    assert clone is not graph


test("clone_graph: empty graph returns a new empty dict", _empty_graph)


def _single_node():
    graph = {"7": []}
    clone = clone_graph(graph)
    assert_eq(clone, {"7": []})
    assert clone["7"] is not graph["7"]


test("clone_graph: single node with no neighbors", _single_node)


def _ring():
    n = 200
    graph = {}
    for i in range(n):
        graph[str(i)] = [str((i + n - 1) % n), str((i + 1) % n)]
    clone = clone_graph(graph)
    assert_eq(clone, graph)
    assert clone is not graph
    for key in graph:
        assert clone[key] is not graph[key], f'clone["{key}"] shares the original list'


test("clone_graph: 200-node ring — no shared references anywhere", _ring)

# -- can_finish --
test("can_finish: single prerequisite is satisfiable", lambda: assert_eq(
    can_finish(2, [(1, 0)]), True))
test("can_finish: mutual dependency is a cycle", lambda: assert_eq(
    can_finish(2, [(1, 0), (0, 1)]), False))
test("can_finish: no prerequisites at all", lambda: assert_eq(can_finish(3, []), True))
test("can_finish: self-loop is a cycle", lambda: assert_eq(can_finish(1, [(0, 0)]), False))
test("can_finish: long chain is satisfiable", lambda: assert_eq(
    can_finish(5, [(1, 0), (2, 1), (3, 2), (4, 3)]), True))
test("can_finish: cycle among a subset blocks everything", lambda: assert_eq(
    can_finish(6, [(1, 0), (2, 1), (0, 2), (4, 3)]), False))
test("can_finish: duplicate pairs are harmless", lambda: assert_eq(
    can_finish(3, [(1, 0), (1, 0), (2, 1)]), True))
test("can_finish: cycle closed by the last edge", lambda: assert_eq(
    can_finish(4, [(1, 0), (2, 1), (3, 2), (1, 3)]), False))
test("can_finish: diamond dependency is acyclic", lambda: assert_eq(
    can_finish(4, [(1, 0), (2, 0), (3, 1), (3, 2)]), True))


def _big_chain():
    n = 2000
    prereqs = [(i + 1, i) for i in range(n - 1)]
    assert_eq(can_finish(n, prereqs), True)


test("can_finish: 2000-course chain is satisfiable", _big_chain)


def _big_chain_cycle():
    n = 2000
    prereqs = [(i + 1, i) for i in range(n - 1)]
    prereqs.append((0, n - 1))  # closes the loop
    assert_eq(can_finish(n, prereqs), False)


test("can_finish: 2000-course chain plus one back edge fails", _big_chain_cycle)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
