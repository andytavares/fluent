# Iterators & Protocols

## What you'll learn

Python's iterator protocol — `__iter__` and `__next__` — and how `for` loops, `list()`, `zip()`, and most of the stdlib work against it. You'll also use `itertools` for common lazy sequence patterns.

## Key concepts

**The iterator protocol:**
Python's `for x in obj` desugars to:
```python
it = iter(obj)       # calls obj.__iter__()
while True:
    try:
        x = next(it)  # calls it.__next__()
    except StopIteration:
        break
```

Any object implementing `__iter__` (returning an iterator) is **iterable**. Any object implementing `__next__` (and `__iter__` returning `self`) is an **iterator**. These are separate roles — a list is iterable but not an iterator; `iter(list)` returns a separate iterator object.

**Custom iterable:**
```python
class CountDown:
    def __init__(self, start: int) -> None:
        self.start = start

    def __iter__(self):
        return CountDownIterator(self.start)


class CountDownIterator:
    def __init__(self, n: int) -> None:
        self.n = n

    def __iter__(self):
        return self

    def __next__(self) -> int:
        if self.n < 0:
            raise StopIteration
        val = self.n
        self.n -= 1
        return val

list(CountDown(3))  # [3, 2, 1, 0]
```

In practice, generator functions are almost always simpler than hand-rolled iterator classes.

**`itertools` — lazy combinators:**
```python
import itertools

itertools.count(10)               # 10, 11, 12, ... (infinite)
itertools.cycle([1, 2, 3])        # 1, 2, 3, 1, 2, 3, ... (infinite)
itertools.islice(it, 5)           # take first 5 items
itertools.takewhile(pred, it)     # take while predicate holds
itertools.dropwhile(pred, it)     # drop while predicate holds
itertools.chain([1, 2], [3, 4])   # 1, 2, 3, 4
itertools.groupby(it, key=fn)     # consecutive groups (needs sorted input)
itertools.accumulate([1,2,3,4])   # 1, 3, 6, 10 (running total)
itertools.batched(it, n)          # 3.12+ — yield chunks of size n
```

**`__len__` and `__getitem__` — the sequence protocol:**
An object with `__len__` and `__getitem__` (indexed from 0) is automatically iterable without needing `__iter__` — Python falls back to calling `__getitem__(0)`, `__getitem__(1)`, ... until `IndexError`. This legacy protocol supports old-style classes but `__iter__` is preferred.

## vs other languages

| Feature | Python | Java | Go | Rust |
|---|---|---|---|---|
| Iterator protocol | `__iter__` / `__next__` | `Iterable` / `Iterator` interface | `range` / channels | `Iterator` trait |
| Infinite sequences | `itertools.count` / generators | `Stream.iterate` | goroutine + channel | custom `Iterator` |
| Lazy pipelines | generator expressions + `itertools` | `Stream` (lazy) | No built-in | `Iterator` adapters |
| `StopIteration` signal | `StopIteration` exception | `hasNext()` returns false | range exhaustion | `Option::None` |

Java and Go use explicit "has next" polling; Python uses exception-based termination. This makes Python iterators simpler to implement (no `hasNext` to maintain) but relies on exceptions as control flow, which surprises engineers coming from other languages.

## The task

Implement two things:

- `class Range2D` — an iterable (not an iterator) that yields `(row, col)` tuples for a 2D grid. Constructor: `Range2D(rows: int, cols: int)`. Iterating it yields tuples in row-major order: `(0,0), (0,1), ..., (rows-1, cols-1)`. Implement `__iter__` as a generator method (use `yield`).
- `take_while_positive(numbers: list[float]) -> list[float]` — uses `itertools.takewhile` to return elements from the start of the list while they are positive (> 0). Stops at the first non-positive value.
