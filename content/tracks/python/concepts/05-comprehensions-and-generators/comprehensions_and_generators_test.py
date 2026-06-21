import sys
import types
from stub import squares_of_evens, running_total, flatten

passed = 0
failed = 0


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


def assert_close_list(actual, expected, tol=1e-9):
    assert len(actual) == len(expected), f"length mismatch: {actual!r} vs {expected!r}"
    for a, e in zip(actual, expected):
        assert abs(a - e) < tol, f"expected ~{e}, got {a}"


def test(name: str, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


def check_running_total_is_generator():
    gen = running_total([1, 2, 3])
    assert isinstance(gen, types.GeneratorType), "running_total must be a generator function"


# squares_of_evens
test("squares_of_evens: n=10", lambda: assert_eq(squares_of_evens(10), [0, 4, 16, 36, 64]))
test("squares_of_evens: n=1",  lambda: assert_eq(squares_of_evens(1), [0]))
test("squares_of_evens: n=0",  lambda: assert_eq(squares_of_evens(0), []))
test("squares_of_evens: n=2",  lambda: assert_eq(squares_of_evens(2), [0]))
test("squares_of_evens: n=5",  lambda: assert_eq(squares_of_evens(5), [0, 4, 16]))

# running_total
test("running_total: basic",    lambda: assert_close_list(list(running_total([1, 2, 3, 4])), [1.0, 3.0, 6.0, 10.0]))
test("running_total: empty",    lambda: assert_eq(list(running_total([])), []))
test("running_total: single",   lambda: assert_close_list(list(running_total([5.0])), [5.0]))
test("running_total: negatives", lambda: assert_close_list(list(running_total([10.0, -3.0, -2.0])), [10.0, 7.0, 5.0]))
test("running_total: is a generator", check_running_total_is_generator)

# flatten
test("flatten: basic",          lambda: assert_eq(flatten([[1, 2], [3, 4], [5]]), [1, 2, 3, 4, 5]))
test("flatten: empty outer",    lambda: assert_eq(flatten([]), []))
test("flatten: empty inner",    lambda: assert_eq(flatten([[], [], []]), []))
test("flatten: single sublists", lambda: assert_eq(flatten([[1], [2], [3]]), [1, 2, 3]))
test("flatten: mixed lengths",  lambda: assert_eq(flatten([[1, 2, 3], [], [4]]), [1, 2, 3, 4]))
test("flatten: returns list",   lambda: assert_eq(type(flatten([[1, 2]])), list))

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
