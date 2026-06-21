import sys
from stub import type_label, clamp, first_number

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


# type_label
test("type_label: int",      lambda: assert_eq(type_label(42), "int"))
test("type_label: str",      lambda: assert_eq(type_label("hi"), "str"))
test("type_label: float",    lambda: assert_eq(type_label(3.14), "float"))
test("type_label: bool",     lambda: assert_eq(type_label(True), "bool"))
test("type_label: NoneType", lambda: assert_eq(type_label(None), "NoneType"))
test("type_label: list",     lambda: assert_eq(type_label([]), "list"))

# clamp
test("clamp: below min",    lambda: assert_eq(clamp(-5, 0, 10), 0))
test("clamp: above max",    lambda: assert_eq(clamp(15, 0, 10), 10))
test("clamp: within range", lambda: assert_eq(clamp(5, 0, 10), 5))
test("clamp: at min",       lambda: assert_eq(clamp(0, 0, 10), 0))
test("clamp: at max",       lambda: assert_eq(clamp(10, 0, 10), 10))
test("clamp: floats",       lambda: assert_eq(clamp(1.5, 1.0, 2.0), 1.5))

# first_number
test("first_number: found",          lambda: assert_eq(first_number("foo 42 bar"), 42))
test("first_number: negative",       lambda: assert_eq(first_number("temp -7 celsius"), -7))
test("first_number: none",           lambda: assert_eq(first_number("no digits here"), None))
test("first_number: leading number", lambda: assert_eq(first_number("99 bottles"), 99))
test("first_number: empty string",   lambda: assert_eq(first_number(""), None))

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
