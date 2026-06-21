from typing import Generator


def squares_of_evens(n: int) -> list[int]:
    # TODO: return squares of even numbers in range [0, n) using a list comprehension
    return []


def running_total(numbers: list[float]) -> Generator[float, None, None]:
    # TODO: yield the running cumulative total after each number
    return
    yield  # make this a generator function


def flatten(nested: list[list]) -> list:
    # TODO: flatten one level of nesting using yield from; return a list
    return []


if __name__ == "__main__":
    print(squares_of_evens(10))   # [0, 4, 16, 36, 64]
    print(list(running_total([1, 2, 3, 4])))  # [1.0, 3.0, 6.0, 10.0]
    print(flatten([[1, 2], [3, 4], [5]]))      # [1, 2, 3, 4, 5]
