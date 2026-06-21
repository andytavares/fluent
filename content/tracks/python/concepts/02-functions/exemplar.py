from functools import reduce
from typing import Callable


def total(*values: float) -> float:
    return sum(values)


def make_multiplier(factor: float) -> Callable[[float], float]:
    return lambda x: x * factor


def pipeline(value: float, *fns: Callable[[float], float]) -> float:
    return reduce(lambda acc, fn: fn(acc), fns, value)
