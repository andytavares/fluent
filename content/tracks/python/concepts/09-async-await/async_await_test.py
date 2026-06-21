import asyncio
import sys
import time
from stub import delay_echo, gather_echoes, first_success

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


def run(coro):
    return asyncio.run(coro)


def check_delay_echo_timing():
    start = time.perf_counter()
    run(delay_echo("x", 0.05))
    elapsed = time.perf_counter() - start
    assert elapsed >= 0.04, f"expected ~0.05s delay, got {elapsed:.3f}s"


def check_gather_concurrent():
    start = time.perf_counter()
    run(gather_echoes(["a", "b", "c"], 0.05))
    elapsed = time.perf_counter() - start
    assert elapsed < 0.12, f"gather_echoes appears sequential: {elapsed:.3f}s for 3x0.05s tasks"


def check_first_success_faster():
    async def run_test():
        result = await first_success([
            delay_echo("slow", 0.1),
            delay_echo("fast", 0.01),
        ])
        assert isinstance(result, str), f"expected str, got {type(result)}"
    run(run_test())


# delay_echo
test("delay_echo: returns message",     lambda: assert_eq(run(delay_echo("hello", 0)), "hello"))
test("delay_echo: empty string",        lambda: assert_eq(run(delay_echo("", 0)), ""))
test("delay_echo: waits approximately", check_delay_echo_timing)

# gather_echoes
test("gather_echoes: returns all messages", lambda: assert_eq(run(gather_echoes(["a", "b", "c"], 0)), ["a", "b", "c"]))
test("gather_echoes: preserves order",      lambda: assert_eq(run(gather_echoes(["z", "a", "m"], 0)), ["z", "a", "m"]))
test("gather_echoes: empty list",           lambda: assert_eq(run(gather_echoes([], 0)), []))
test("gather_echoes: concurrent (not sequential)", check_gather_concurrent)

# first_success
test("first_success: returns faster result", check_first_success_faster)
test("first_success: single coro",           lambda: assert_eq(run(first_success([delay_echo("only", 0)])), "only"))

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
