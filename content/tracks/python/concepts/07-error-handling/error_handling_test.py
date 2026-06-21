import sys
from stub import ParseError, safe_divide, Accumulator

passed = 0
failed = 0


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


def assert_raises(exc_type, fn):
    try:
        fn()
        raise AssertionError(f"expected {exc_type.__name__} but no exception was raised")
    except exc_type:
        pass


def test(name: str, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


def check_parse_error_message():
    e = ParseError("bad_input")
    assert_eq(str(e), "cannot parse: 'bad_input'")


def check_parse_error_raw():
    e = ParseError("xyz")
    assert_eq(e.raw, "xyz")


def check_divide_by_zero_message():
    try:
        safe_divide(1, 0)
    except ValueError as e:
        assert_eq(str(e), "division by zero")


def check_acc_suppresses():
    with Accumulator(ValueError):
        raise ValueError("oops")


def check_acc_records():
    with Accumulator(ValueError) as acc:
        raise ValueError("oops")
    assert_eq(acc.errors, [ValueError])


def check_acc_propagates():
    try:
        with Accumulator(ValueError):
            raise TypeError("wrong")
        raise AssertionError("expected TypeError to propagate")
    except TypeError:
        pass


def check_acc_no_exception():
    with Accumulator(ValueError) as acc:
        x = 1 + 1  # noqa: F841
    assert_eq(acc.errors, [])


def check_acc_multiple():
    with Accumulator(ValueError, TypeError) as acc:
        raise TypeError("type")
    assert_eq(acc.errors, [TypeError])


# ParseError
test("ParseError: is ValueError subclass", lambda: assert_eq(issubclass(ParseError, ValueError), True))
test("ParseError: message format",         check_parse_error_message)
test("ParseError: raw attribute",          check_parse_error_raw)

# safe_divide
test("safe_divide: normal",               lambda: assert_eq(safe_divide(10, 2), 5.0))
test("safe_divide: float result",         lambda: assert_eq(safe_divide(1, 4), 0.25))
test("safe_divide: by zero raises ValueError", lambda: assert_raises(ValueError, lambda: safe_divide(5, 0)))
test("safe_divide: zero numerator",       lambda: assert_eq(safe_divide(0, 5), 0.0))
test("safe_divide: by zero message",      check_divide_by_zero_message)

# Accumulator
test("Accumulator: suppresses specified type", check_acc_suppresses)
test("Accumulator: records error type",        check_acc_records)
test("Accumulator: propagates other types",    check_acc_propagates)
test("Accumulator: no exception",              check_acc_no_exception)
test("Accumulator: multiple types",            check_acc_multiple)

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
