from stub import merge_intervals, insert_interval, min_arrows

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


# ── merge_intervals ──
r = merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]])
test("merge_intervals: classic example", r == [[1, 6], [8, 10], [15, 18]], f"got {r}")

r = merge_intervals([[1, 4], [4, 5]])
test("merge_intervals: touching intervals merge", r == [[1, 5]], f"got {r}")

r = merge_intervals([[1, 10], [2, 3], [4, 5]])
test("merge_intervals: containment — later intervals inside the block", r == [[1, 10]], f"got {r}")

test("merge_intervals: empty input", merge_intervals([]) == [])

r = merge_intervals([[3, 7]])
test("merge_intervals: single interval", r == [[3, 7]], f"got {r}")

r = merge_intervals([[8, 10], [1, 3], [15, 18], [2, 6]])
test("merge_intervals: unsorted input gets sorted", r == [[1, 6], [8, 10], [15, 18]], f"got {r}")

r = merge_intervals([[1, 4], [1, 4]])
test("merge_intervals: duplicate intervals collapse", r == [[1, 4]], f"got {r}")

r = merge_intervals([[5, 5], [1, 1]])
test("merge_intervals: zero-width intervals", r == [[1, 1], [5, 5]], f"got {r}")

r = merge_intervals([[-10, -5], [-6, 0], [2, 3]])
test("merge_intervals: negative coordinates", r == [[-10, 0], [2, 3]], f"got {r}")

r = merge_intervals([[10, 12], [2, 3]])
test("merge_intervals: numeric sort (two-digit starts)", r == [[2, 3], [10, 12]], f"got {r}")

# ── insert_interval ──
r = insert_interval([[1, 3], [6, 9]], [2, 5])
test("insert_interval: classic example", r == [[1, 5], [6, 9]], f"got {r}")

r = insert_interval([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])
test("insert_interval: swallows several intervals", r == [[1, 2], [3, 10], [12, 16]], f"got {r}")

test("insert_interval: empty list", insert_interval([], [5, 7]) == [[5, 7]])

r = insert_interval([[3, 5], [8, 9]], [1, 2])
test("insert_interval: before everything, no overlap", r == [[1, 2], [3, 5], [8, 9]], f"got {r}")

r = insert_interval([[1, 2], [4, 5]], [7, 9])
test("insert_interval: after everything, no overlap", r == [[1, 2], [4, 5], [7, 9]], f"got {r}")

test("insert_interval: fully contained in an existing interval", insert_interval([[1, 5]], [2, 3]) == [[1, 5]])

r = insert_interval([[2, 3], [5, 6], [8, 9]], [1, 10])
test("insert_interval: swallows the whole list", r == [[1, 10]], f"got {r}")

test("insert_interval: touching at the right endpoint merges", insert_interval([[1, 5]], [5, 7]) == [[1, 7]])
test("insert_interval: touching at the left endpoint merges", insert_interval([[5, 8]], [2, 5]) == [[2, 8]])

# ── min_arrows ──
test("min_arrows: classic example", min_arrows([[10, 16], [2, 8], [1, 6], [7, 12]]) == 2)
test("min_arrows: disjoint balloons need one arrow each", min_arrows([[1, 2], [3, 4], [5, 6]]) == 3)
test("min_arrows: chain of touching balloons", min_arrows([[1, 2], [2, 3], [3, 4], [4, 5]]) == 2)
test("min_arrows: empty list", min_arrows([]) == 0)
test("min_arrows: single balloon", min_arrows([[3, 9]]) == 1)
test("min_arrows: all balloons share a common point", min_arrows([[1, 10], [5, 12], [9, 20], [10, 11]]) == 1)
test("min_arrows: nested balloons", min_arrows([[1, 100], [40, 60], [50, 55]]) == 1)
test("min_arrows: negative coordinates", min_arrows([[-10, -4], [-6, 0], [2, 3]]) == 2)
test("min_arrows: numeric sort on ends (two-digit ends)", min_arrows([[3, 10], [1, 2]]) == 2)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
