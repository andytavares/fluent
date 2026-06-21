import sys
from stub import num_islands, can_finish, word_ladder_length

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


def grid(rows: list[list[str]]) -> list[list[str]]:
    return [row[:] for row in rows]


# num_islands
r = num_islands(grid([["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]))
test("islands: one large island", r == 1, f"got {r}")
r = num_islands(grid([["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]))
test("islands: three islands", r == 3, f"got {r}")
r = num_islands(grid([["0","0","0"],["0","0","0"]]))
test("islands: all water", r == 0, f"got {r}")
r = num_islands(grid([["1","0","1"],["0","1","0"],["1","0","1"]]))
test("islands: checkerboard 5 islands", r == 5, f"got {r}")
r = num_islands(grid([["1"]]))
test("islands: single cell", r == 1, f"got {r}")
r = num_islands(grid([["1","1"],["1","1"]]))
test("islands: all land 2x2", r == 1, f"got {r}")
r = num_islands(grid([["1","0"],["0","1"]]))
test("islands: diagonal not connected", r == 2, f"got {r}")

# can_finish
test("schedule: simple chain", can_finish(2, [[1, 0]]) is True)
test("schedule: two-node cycle", can_finish(2, [[1, 0], [0, 1]]) is False)
test("schedule: single course", can_finish(1, []) is True)
test("schedule: long chain", can_finish(5, [[1, 0], [2, 1], [3, 2], [4, 3]]) is True)
test("schedule: three-node cycle", can_finish(3, [[1, 0], [2, 1], [0, 2]]) is False)
test("schedule: diamond DAG", can_finish(4, [[1, 0], [2, 0], [3, 1], [3, 2]]) is True)
test("schedule: no prerequisites", can_finish(3, []) is True)

# word_ladder_length
r = word_ladder_length("hit", "cog", ["hot","dot","dog","lot","log","cog"])
test("ladder: standard (expect 5)", r == 5, f"got {r}")
r = word_ladder_length("hit", "cog", ["hot","dot","dog","lot","log"])
test("ladder: end_word not in list (expect 0)", r == 0, f"got {r}")
r = word_ladder_length("hot", "dog", ["hot","dog"])
test("ladder: direct one step (expect 2)", r == 2, f"got {r}")
r = word_ladder_length("a", "c", ["a","b","c"])
test("ladder: single char words (expect 2)", r == 2, f"got {r}")
r = word_ladder_length("abc", "xyz", ["ayz","axz","xyz"])
test("ladder: multi-step 3-char (expect 4)", r == 4, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
