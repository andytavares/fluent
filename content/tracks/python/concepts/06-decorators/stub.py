from functools import wraps
from typing import Callable


def retry(times: int, exceptions: tuple = (Exception,)):
    # TODO: return a decorator that retries the function up to `times` attempts
    # on any exception in `exceptions`, then re-raises the last exception.
    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # TODO
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def memoize(fn: Callable) -> Callable:
    # TODO: cache results by positional args; expose .cache dict on the wrapper
    @wraps(fn)
    def wrapper(*args):
        # TODO
        return fn(*args)
    wrapper.cache = {}
    return wrapper


if __name__ == "__main__":
    call_count = 0

    @retry(times=3, exceptions=(ValueError,))
    def flaky(fail_times: int) -> str:
        global call_count
        call_count += 1
        if call_count <= fail_times:
            raise ValueError("not yet")
        return "ok"

    print(flaky(2))   # ok (called 3 times total)

    @memoize
    def expensive(n: int) -> int:
        print(f"  computing {n}")
        return n * n

    print(expensive(4))   # computing 4 → 16
    print(expensive(4))   # 16 (cached, no print)
    print(expensive.cache)
