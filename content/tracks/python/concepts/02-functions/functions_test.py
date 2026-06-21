import sys
from stub import total, make_multiplier, pipeline

passed = 0
failed = 0


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


def assert_close(actual, expected, tol=1e-9):
    assert abs(actual - expected) < tol, f"expected ~{expected}, got {actual}"


def test(name: str, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


# total
test("total: multiple args",  lambda: assert_close(total(1, 2, 3), 6.0))
test("total: single arg",     lambda: assert_close(total(5), 5.0))
test("total: no args",        lambda: assert_close(total(), 0.0))
test("total: floats",         lambda: assert_close(total(1.5, 2.5), 4.0))
test("total: negative",       lambda: assert_close(total(-1, -2, 3), 0.0))

# make_multiplier
test("make_multiplier: double",  lambda: assert_close(make_multiplier(2)(5), 10.0))
test("make_multiplier: triple",  lambda: assert_close(make_multiplier(3)(4), 12.0))
test("make_multiplier: zero",    lambda: assert_close(make_multiplier(0)(99), 0.0))
test("make_multiplier: float",   lambda: assert_close(make_multiplier(0.5)(10), 5.0))
test("make_multiplier: returns callable", lambda: assert_eq(callable(make_multiplier(2)), True))

# pipeline
double = make_multiplier(2)
triple = make_multiplier(3)
test("pipeline: no fns",           lambda: assert_close(pipeline(7), 7.0))
test("pipeline: single fn",        lambda: assert_close(pipeline(3, double), 6.0))
test("pipeline: two fns",          lambda: assert_close(pipeline(3, double, triple), 18.0))
test("pipeline: order matters",    lambda: assert_close(pipeline(2, make_multiplier(3), make_multiplier(4)), 24.0))
test("pipeline: add then multiply", lambda: assert_close(
    pipeline(5, lambda x: x + 1, make_multiplier(2)), 12.0
))

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
