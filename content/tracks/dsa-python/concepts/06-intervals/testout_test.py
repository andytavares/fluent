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

intervals = [[i, i + 1] for i in range(9999, -1, -1)]  # reverse order
test("merge_intervals: 10k touching intervals collapse to one block", merge_intervals(intervals) == [[0, 10000]])

intervals = [[i * 3, i * 3 + 1] for i in range(9999, -1, -1)]
result = merge_intervals(intervals)
test(
    "merge_intervals: 10k disjoint intervals stay disjoint",
    len(result) == 10000 and result[0] == [0, 1] and result[9999] == [29997, 29998],
)

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

r = insert_interval([[1, 2], [5, 6]], [3, 4])
test("insert_interval: fills the exact gap between neighbors", r == [[1, 2], [3, 4], [5, 6]], f"got {r}")

intervals = [[i * 10, i * 10 + 5] for i in range(10000)]
result = insert_interval(intervals, [50003, 50017])
test(
    "insert_interval: 10k intervals, merge deep inside",
    len(result) == 9999 and result[5000] == [50000, 50017] and result[5001] == [50020, 50025],
)

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
test("min_arrows: large coordinates near 2^31", min_arrows([[-2147483648, 2147483647], [0, 1]]) == 1)

# 5000 balloons around x=100 and 5000 around x=90000 -> 2 arrows
points = [[100 - i, 100 + i] for i in range(5000)] + [[90000 - i, 90000 + i] for i in range(5000)]
test("min_arrows: 10k pairwise-overlapping chains", min_arrows(points) == 2)

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
