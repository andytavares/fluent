import sys
from stub import sliding_window_maximum, RecentCounter, rotting_oranges

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


# sliding_window_maximum
r = sliding_window_maximum([1, 3, -1, -3, 5, 3, 6, 7], 3)
test("swmax: standard k=3", r == [3, 3, 5, 5, 6, 7], f"got {r}")
r = sliding_window_maximum([1], 1)
test("swmax: single element", r == [1], f"got {r}")
r = sliding_window_maximum([1, 2, 3, 4, 5], 2)
test("swmax: ascending k=2", r == [2, 3, 4, 5], f"got {r}")
r = sliding_window_maximum([5, 4, 3, 2, 1], 3)
test("swmax: descending k=3", r == [5, 4, 3], f"got {r}")
r = sliding_window_maximum([9, 9, 9], 2)
test("swmax: all equal", r == [9, 9], f"got {r}")
r = sliding_window_maximum([2, 1, 5, 3, 6, 4, 8, 2], 4)
test("swmax: k=4 mixed", r == [5, 6, 6, 8, 8], f"got {r}")

# RecentCounter
rc = RecentCounter()
r = rc.ping(1)
test("counter: first ping", r == 1, f"got {r}")
r = rc.ping(100)
test("counter: second ping", r == 2, f"got {r}")
r = rc.ping(3001)
test("counter: third ping", r == 3, f"got {r}")
r = rc.ping(3002)
test("counter: fourth ping (first expires)", r == 3, f"got {r}")
rc2 = RecentCounter()
rc2.ping(0)
r = rc2.ping(3001)
test("counter: ping 0 still in window at 3001", r == 2, f"got {r}")
r = rc2.ping(3002)
test("counter: ping 0 expires at 3002", r == 2, f"got {r}")

# rotting_oranges
r = rotting_oranges([[2, 1, 1], [1, 1, 0], [0, 1, 1]])
test("rot: standard grid (expect 4)", r == 4, f"got {r}")
r = rotting_oranges([[2, 1, 1], [0, 1, 1], [1, 0, 1]])
test("rot: isolated fresh orange (expect -1)", r == -1, f"got {r}")
r = rotting_oranges([[0, 2]])
test("rot: no fresh oranges (expect 0)", r == 0, f"got {r}")
r = rotting_oranges([[1, 2]])
test("rot: one step (expect 1)", r == 1, f"got {r}")
r = rotting_oranges([[2, 2], [2, 2]])
test("rot: all already rotten (expect 0)", r == 0, f"got {r}")
r = rotting_oranges([[0]])
test("rot: single empty cell (expect 0)", r == 0, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
