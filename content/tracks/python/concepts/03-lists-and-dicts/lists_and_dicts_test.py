import sys
from stub import group_by_first_char, zip_to_dict, top_n

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


# group_by_first_char
test("group_by_first_char: basic", lambda: assert_eq(
    group_by_first_char(["cat", "car", "dog"]),
    {"c": ["cat", "car"], "d": ["dog"]},
))
test("group_by_first_char: skips empty", lambda: assert_eq(
    group_by_first_char(["", "ant", ""]),
    {"a": ["ant"]},
))
test("group_by_first_char: empty list", lambda: assert_eq(
    group_by_first_char([]),
    {},
))
test("group_by_first_char: all same char", lambda: assert_eq(
    group_by_first_char(["a", "ab", "abc"]),
    {"a": ["a", "ab", "abc"]},
))

# zip_to_dict
test("zip_to_dict: equal lengths", lambda: assert_eq(
    zip_to_dict(["a", "b", "c"], [1, 2, 3]),
    {"a": 1, "b": 2, "c": 3},
))
test("zip_to_dict: keys longer", lambda: assert_eq(
    zip_to_dict(["a", "b", "c"], [1, 2]),
    {"a": 1, "b": 2},
))
test("zip_to_dict: values longer", lambda: assert_eq(
    zip_to_dict(["a"], [1, 2, 3]),
    {"a": 1},
))
test("zip_to_dict: empty", lambda: assert_eq(
    zip_to_dict([], []),
    {},
))

# top_n
test("top_n: basic", lambda: assert_eq(
    top_n({"alice": 95, "bob": 87, "carol": 92}, 2),
    ["alice", "carol"],
))
test("top_n: n equals all", lambda: assert_eq(
    top_n({"alice": 95, "bob": 87}, 2),
    ["alice", "bob"],
))
test("top_n: tie broken alphabetically", lambda: assert_eq(
    top_n({"zara": 90, "alice": 90, "bob": 80}, 2),
    ["alice", "zara"],
))
test("top_n: n=1", lambda: assert_eq(
    top_n({"alice": 95, "bob": 99}, 1),
    ["bob"],
))
test("top_n: empty dict", lambda: assert_eq(
    top_n({}, 3),
    [],
))

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
