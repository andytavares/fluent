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

## Watch out

- An **iterator** is single-use — once exhausted, iterating it again produces nothing. An **iterable** whose `__iter__` returns a fresh iterator each time (like `Range2D` below) can be iterated repeatedly; a raw iterator object cannot.
- Since PEP 479 (Python 3.7+), letting `StopIteration` escape uncaught from inside a generator body raises `RuntimeError` instead of silently ending the generator — don't rely on `StopIteration` propagating up through a generator function.
- Confusing iterable and iterator is a common bug: if `__iter__` returns `self` but you also want the object usable in multiple simultaneous loops, you need a *separate* iterator object per call to `iter()`, not the container itself.
- `itertools` combinators (`takewhile`, `islice`, etc.) return lazy iterators — wrap in `list(...)` to materialize, and remember they too are single-use once consumed.

## The task

Implement two things: a custom iterable class and a function built on `itertools`.

**`class Range2D`** — an **iterable** (not an iterator — it must be usable in multiple independent `for` loops or `list()` calls without exhausting) over `(row, col)` tuples for a `rows x cols` grid. Constructor: `Range2D(rows: int, cols: int)`. Iterating yields tuples in row-major order — all columns of row 0, then all columns of row 1, and so on. Implement `__iter__` as a generator method (a method containing `yield`), which naturally produces a fresh generator each time it's called.

```python
list(Range2D(2, 3))
# [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]

list(Range2D(1, 1))   # [(0, 0)]
list(Range2D(0, 5))   # []               — 0 rows
list(Range2D(3, 0))   # []               — 0 cols

r = Range2D(2, 2)
list(r) == list(r)    # True — iterable multiple times, not a spent iterator
```

**`take_while_positive(numbers: list[float]) -> list[float]`** — returns the elements from the start of `numbers` up to (but not including) the first element that is not strictly positive (`<= 0`), using `itertools.takewhile`. Once a non-positive value is hit, nothing after it is included even if later values are positive.

```python
take_while_positive([3, 1, 4, -1, 5])   # [3, 1, 4]   — stops at -1
take_while_positive([5, 3, 0, 2])       # [5, 3]      — stops at 0
take_while_positive([1, 2, 3])          # [1, 2, 3]   — all positive
take_while_positive([-1, 2, 3])         # []          — first element already non-positive
take_while_positive([])                  # []
```
