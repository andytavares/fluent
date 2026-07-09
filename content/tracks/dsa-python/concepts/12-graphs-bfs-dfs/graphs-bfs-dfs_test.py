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
test("num_islands: snake-shaped island winds through the grid", lambda: assert_eq(num_islands([
    ["1", "1", "1", "1", "1"],
    ["0", "0", "0", "0", "1"],
    ["1", "1", "1", "1", "1"],
    ["1", "0", "0", "0", "0"],
    ["1", "1", "1", "1", "1"],
]), 1))

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

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
