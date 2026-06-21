import sys
# Remove any pre-cached test modules so our is_cached tests are clean
for _mod in ["json", "csv", "textwrap"]:
    sys.modules.pop(_mod, None)

from stub import list_public_names, is_cached, safe_import

passed = 0
failed = 0


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


def assert_in(item, container):
    assert item in container, f"{item!r} not found in {container!r}"


def test(name: str, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


def check_is_cached_after_import():
    import json  # noqa: F401
    assert_eq(is_cached("json"), True)


def check_safe_import_known():
    import types
    mod = safe_import("csv")
    assert isinstance(mod, types.ModuleType), f"expected module, got {type(mod)}"


def check_safe_import_type():
    mod = safe_import("textwrap")
    assert mod is not None
    assert hasattr(mod, "dedent"), "textwrap should have dedent"


def check_list_sorted():
    names = list_public_names("os.path")
    assert names == sorted(names), "names must be sorted"


def check_list_no_underscore():
    names = list_public_names("os.path")
    for n in names:
        assert not n.startswith("_"), f"private name {n!r} should not be included"


def check_list_json_all():
    import json
    names = list_public_names("json")
    if hasattr(json, "__all__"):
        assert_eq(names, sorted(json.__all__))
    else:
        assert len(names) > 0


# is_cached
test("is_cached: not yet imported",    lambda: assert_eq(is_cached("json"), False))
test("is_cached: after import",        check_is_cached_after_import)
test("is_cached: stdlib always cached", lambda: assert_eq(is_cached("sys"), True))

# safe_import
test("safe_import: known module",   check_safe_import_known)
test("safe_import: unknown module", lambda: assert_eq(safe_import("no_such_module_fluent_xyz"), None))
test("safe_import: returns module", check_safe_import_type)

# list_public_names
test("list_public_names: returns list",     lambda: assert_eq(type(list_public_names("os.path")), list))
test("list_public_names: sorted",           check_list_sorted)
test("list_public_names: no _ prefix",      check_list_no_underscore)
test("list_public_names: json has __all__", check_list_json_all)

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
