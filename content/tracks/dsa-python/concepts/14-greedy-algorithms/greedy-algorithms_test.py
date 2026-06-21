import sys
from stub import can_jump, merge_intervals, task_scheduler

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


# can_jump
test("jump: reachable [2,3,1,1,4]", can_jump([2, 3, 1, 1, 4]) is True)
test("jump: stuck at 0 [3,2,1,0,4]", can_jump([3, 2, 1, 0, 4]) is False)
test("jump: single element [0]", can_jump([0]) is True)
test("jump: two elements reachable [1,0]", can_jump([1, 0]) is True)
test("jump: stuck at first [0,1]", can_jump([0, 1]) is False)
test("jump: jump over zeros [2,0,0]", can_jump([2, 0, 0]) is True)
test("jump: all ones", can_jump([1, 1, 1, 1, 1]) is True)

# merge_intervals
r = merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]])
test("merge: standard", r == [[1, 6], [8, 10], [15, 18]], f"got {r}")
r = merge_intervals([[1, 4], [4, 5]])
test("merge: touching intervals", r == [[1, 5]], f"got {r}")
r = merge_intervals([[1, 4], [2, 3]])
test("merge: contained interval", r == [[1, 4]], f"got {r}")
r = merge_intervals([])
test("merge: empty", r == [], f"got {r}")
r = merge_intervals([[1, 4]])
test("merge: single interval", r == [[1, 4]], f"got {r}")
r = merge_intervals([[1, 2], [3, 4], [5, 6]])
test("merge: no overlaps", r == [[1, 2], [3, 4], [5, 6]], f"got {r}")
r = merge_intervals([[2, 3], [1, 4]])
test("merge: unsorted input", r == [[1, 4]], f"got {r}")
r = merge_intervals([[1, 10], [2, 3], [4, 5]])
test("merge: one contains all", r == [[1, 10]], f"got {r}")

# task_scheduler
r = task_scheduler(["A","A","A","B","B","B"], 2)
test("scheduler: n=2 (expect 8)", r == 8, f"got {r}")
r = task_scheduler(["A","A","A","B","B","B"], 0)
test("scheduler: n=0 (expect 6)", r == 6, f"got {r}")
r = task_scheduler(["A","A","A","A","A","A","B","C","D","E","F","G"], 2)
test("scheduler: many tasks n=2 (expect 16)", r == 16, f"got {r}")
r = task_scheduler(["A"], 1)
test("scheduler: single task n=1 (expect 1)", r == 1, f"got {r}")
r = task_scheduler(["A","A","A","B","B","B","C","C","C"], 2)
test("scheduler: three equal freq n=2 (expect 9)", r == 9, f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
