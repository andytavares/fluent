from typing import Generator


def squares_of_evens(n: int) -> list[int]:
    return [x ** 2 for x in range(n) if x % 2 == 0]


def running_total(numbers: list[float]) -> Generator[float, None, None]:
    total = 0.0
    for n in numbers:
        total += n
        yield total


def flatten(nested: list[list]) -> list:
    def _gen():
        for sublist in nested:
            yield from sublist
    return list(_gen())
