import itertools
from typing import Generator


class Range2D:
    """An iterable over (row, col) pairs for a rows x cols grid."""

    def __init__(self, rows: int, cols: int) -> None:
        # TODO: store rows and cols
        self.rows = rows
        self.cols = cols

    def __iter__(self) -> Generator[tuple[int, int], None, None]:
        # TODO: yield (row, col) tuples in row-major order using nested loops + yield
        return
        yield  # make this a generator


def take_while_positive(numbers: list[float]) -> list[float]:
    # TODO: use itertools.takewhile to return elements while > 0
    return []


if __name__ == "__main__":
    for cell in Range2D(2, 3):
        print(cell)
    # (0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)

    print(take_while_positive([3, 1, 4, -1, 5]))  # [3, 1, 4]
    print(take_while_positive([]))                  # []
