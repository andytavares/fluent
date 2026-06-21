import sys
from stub import Range2D, take_while_positive

passed = 0
failed = 0


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


def test(name: str, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


def check_range2d_reusable():
    r = Range2D(2, 2)
    first = list(r)
    second = list(r)
    assert_eq(first, second)


# Range2D
test("Range2D: 2x3 row-major", lambda: assert_eq(
    list(Range2D(2, 3)),
    [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]
))
test("Range2D: 1x1",           lambda: assert_eq(list(Range2D(1, 1)), [(0, 0)]))
test("Range2D: 0 rows",        lambda: assert_eq(list(Range2D(0, 5)), []))
test("Range2D: 0 cols",        lambda: assert_eq(list(Range2D(3, 0)), []))
test("Range2D: 3x2",           lambda: assert_eq(
    list(Range2D(3, 2)),
    [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0), (2, 1)]
))
test("Range2D: iterable multiple times", check_range2d_reusable)

# take_while_positive
test("take_while_positive: stops at negative",      lambda: assert_eq(take_while_positive([3, 1, 4, -1, 5]), [3, 1, 4]))
test("take_while_positive: stops at zero",          lambda: assert_eq(take_while_positive([5, 3, 0, 2]), [5, 3]))
test("take_while_positive: all positive",           lambda: assert_eq(take_while_positive([1, 2, 3]), [1, 2, 3]))
test("take_while_positive: empty list",             lambda: assert_eq(take_while_positive([]), []))
test("take_while_positive: first is non-positive",  lambda: assert_eq(take_while_positive([-1, 2, 3]), []))
test("take_while_positive: returns list",           lambda: assert_eq(type(take_while_positive([1, 2])), list))

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
