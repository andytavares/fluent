import sys
from stub import retry, memoize

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


# --- retry ---

def test_retry_succeeds_first_try():
    calls = []
    @retry(times=3)
    def ok():
        calls.append(1)
        return "done"
    result = ok()
    assert_eq(result, "done")
    assert_eq(len(calls), 1)


def test_retry_succeeds_on_second_try():
    calls = []
    @retry(times=3)
    def flaky():
        calls.append(1)
        if len(calls) < 2:
            raise ValueError("not yet")
        return "ok"
    result = flaky()
    assert_eq(result, "ok")
    assert_eq(len(calls), 2)


def test_retry_exhausts_and_raises():
    calls = []
    @retry(times=3)
    def always_fails():
        calls.append(1)
        raise RuntimeError("boom")
    assert_raises(RuntimeError, always_fails)
    assert_eq(len(calls), 3)


def test_retry_only_catches_specified_exceptions():
    @retry(times=3, exceptions=(ValueError,))
    def wrong_exc():
        raise TypeError("wrong type")
    assert_raises(TypeError, wrong_exc)


def test_retry_preserves_name():
    @retry(times=2)
    def my_func():
        return 1
    assert_eq(my_func.__name__, "my_func")


test("retry: succeeds first try",         test_retry_succeeds_first_try)
test("retry: succeeds on second try",     test_retry_succeeds_on_second_try)
test("retry: exhausts and raises",        test_retry_exhausts_and_raises)
test("retry: only catches specified exc", test_retry_only_catches_specified_exceptions)
test("retry: preserves __name__",         test_retry_preserves_name)


# --- memoize ---

def test_memoize_caches_result():
    calls = []
    @memoize
    def compute(n):
        calls.append(n)
        return n * 2
    assert_eq(compute(5), 10)
    assert_eq(compute(5), 10)
    assert_eq(len(calls), 1)   # only called once


def test_memoize_different_args():
    calls = []
    @memoize
    def compute(n):
        calls.append(n)
        return n * 2
    compute(3)
    compute(4)
    assert_eq(len(calls), 2)


def test_memoize_cache_attribute():
    @memoize
    def square(n):
        return n ** 2
    square(3)
    square(4)
    assert hasattr(square, "cache"), "wrapper must have a .cache attribute"
    assert_eq(square.cache[(3,)], 9)
    assert_eq(square.cache[(4,)], 16)


def test_memoize_preserves_name():
    @memoize
    def my_func(x):
        return x
    assert_eq(my_func.__name__, "my_func")


test("memoize: caches result",       test_memoize_caches_result)
test("memoize: different args",      test_memoize_different_args)
test("memoize: .cache attribute",    test_memoize_cache_attribute)
test("memoize: preserves __name__",  test_memoize_preserves_name)

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
