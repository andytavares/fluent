from functools import wraps
from typing import Callable


def retry(times: int, exceptions: tuple = (Exception,)):
    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            last_exc: BaseException | None = None
            for _ in range(times):
                try:
                    return fn(*args, **kwargs)
                except exceptions as e:
                    last_exc = e
            raise last_exc  # type: ignore[misc]
        return wrapper
    return decorator


def memoize(fn: Callable) -> Callable:
    cache: dict = {}

    @wraps(fn)
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]

    wrapper.cache = cache  # type: ignore[attr-defined]
    return wrapper
