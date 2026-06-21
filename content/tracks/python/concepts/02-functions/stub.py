from functools import reduce
from typing import Callable


def total(*values: float) -> float:
    # TODO: return the sum of all positional arguments; 0.0 if none
    return 0.0


def make_multiplier(factor: float) -> Callable[[float], float]:
    # TODO: return a function that multiplies its argument by factor
    return lambda x: 0.0


def pipeline(value: float, *fns: Callable[[float], float]) -> float:
    # TODO: apply each fn in fns to value left-to-right using functools.reduce
    return 0.0


if __name__ == "__main__":
    print(total(1, 2, 3))           # 6.0
    print(total())                  # 0.0
    double = make_multiplier(2)
    print(double(5))                # 10.0
    print(pipeline(3, double, make_multiplier(3)))  # 18.0
