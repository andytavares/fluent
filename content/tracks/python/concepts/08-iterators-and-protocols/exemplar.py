import itertools
from typing import Generator


class Range2D:
    def __init__(self, rows: int, cols: int) -> None:
        self.rows = rows
        self.cols = cols

    def __iter__(self) -> Generator[tuple[int, int], None, None]:
        for row in range(self.rows):
            for col in range(self.cols):
                yield (row, col)


def take_while_positive(numbers: list[float]) -> list[float]:
    return list(itertools.takewhile(lambda x: x > 0, numbers))
