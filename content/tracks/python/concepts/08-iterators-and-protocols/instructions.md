## What you build

You write `Range2D`, a reusable iterable over grid cells, and `take_while_positive`, built on `itertools`. This lesson builds on **Comprehensions & Generators**.

## Key concepts

### `for` runs on the iterator protocol

`for x in obj` calls `iter(obj)` once, then calls `next()` until `StopIteration`. `list()`, `zip()` and most of the standard library use the same protocol.

```python
# What "for x in obj" does
it = iter(obj)    # obj.__iter__()
while True:
    try:
        x = next(it)  # it.__next__()
    except StopIteration:
        break
```

### Iterable and iterator are two roles

An object with `__iter__` that returns an iterator is an iterable. An object with `__next__`, and an `__iter__` that returns `self`, is an iterator. A list is iterable but is not an iterator: `iter(a_list)` returns a separate iterator object.

```python
nums = [1, 2]
it = iter(nums)
next(it)     # 1
it is nums   # False
iter(it) is it  # True
```

### A custom iterable returns a new iterator each time

The container makes a new iterator on each call to `__iter__`. Each loop then has its own position. A generator function is almost always simpler than a hand-written iterator class.

```python
class CountDown:
    def __init__(self, start: int):
        self.start = start

    def __iter__(self):
        n = self.start
        return CountDownIterator(n)


class CountDownIterator:
    def __init__(self, n: int):
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

### Python ends iteration with an exception

Java and Go poll with a "has next" check, but Python raises `StopIteration`. You do not keep a `hasNext` state, but the exception acts as control flow.

```python
it = iter([])
next(it)  # raises StopIteration
```

### `itertools` gives lazy combinators

Each function returns a lazy iterator. `count` and `cycle` never end, so limit them with `islice` or `takewhile`.

```python
import itertools as it

it.count(10)        # 10, 11, 12, ...
it.cycle([1, 2, 3]) # 1, 2, 3, 1, ...
it.islice(xs, 5)    # first 5 items
# Take items while pred is true
it.takewhile(pred, xs)
# Drop items while pred is true
it.dropwhile(pred, xs)
it.chain([1, 2], [3, 4])  # 1, 2, 3, 4
# Groups of equal neighbours:
# sort the input first
it.groupby(xs, key=fn)
it.accumulate([1, 2, 3, 4])
# 1, 3, 6, 10: running total
# Chunks of size n: Python 3.12+
it.batched(xs, n)
```

### `__getitem__` alone makes an object iterable

Without `__iter__`, `iter()` falls back to the sequence protocol. It calls `__getitem__(0)`, `__getitem__(1)` and so on, until `IndexError`. This is a legacy protocol, so prefer `__iter__`.

```python
class Three:
    def __getitem__(self, i):
        if i > 2:
            raise IndexError
        return i

list(Three())  # [0, 1, 2]
```

## Watch out

- An iterator works once. After it ends, a second loop over it gives nothing.
- An iterable whose `__iter__` returns a new iterator, like `Range2D`, works in many loops.
- Since PEP 479 (Python 3.7), a `StopIteration` that escapes a generator body becomes `RuntimeError`.
- Do not rely on `StopIteration` to end a generator from inside its body.
- If `__iter__` returns `self`, two loops at once share one position. Return a separate iterator for each `iter()` call.
- `itertools` functions return lazy iterators. Wrap them in `list(...)` to get the values. They also work only once.

## The task

Write a custom iterable class and a function built on `itertools` in `stub.py`.

`class Range2D` is an iterable over the `(row, col)` cells of a grid.

1. `Range2D(rows: int, cols: int)` is the constructor.
2. Iteration yields tuples in row-major order: every column of row 0, then every column of row 1.
3. A grid with 0 rows or 0 columns yields nothing.
4. `Range2D` is an iterable, not an iterator. Many `for` loops or `list()` calls give the same result.
5. Write `__iter__` as a generator method with `yield`. Each call then returns a new generator.

`take_while_positive(numbers: list[float]) -> list[float]` uses `itertools.takewhile`.

1. It returns the items from the start of `numbers`, up to the first item that is `<= 0`.
2. It excludes that item and every item after it, even positive ones.
3. It returns a `list`.

```python
list(Range2D(2, 3))
# [(0, 0), (0, 1), (0, 2),
#  (1, 0), (1, 1), (1, 2)]
list(Range2D(3, 2))
# [(0, 0), (0, 1), (1, 0),
#  (1, 1), (2, 0), (2, 1)]
list(Range2D(1, 1))  # [(0, 0)]
list(Range2D(0, 5))  # []
list(Range2D(3, 0))  # []
r = Range2D(2, 2)
list(r) == list(r)   # True

take_while_positive([3, 1, 4, -1, 5])
# [3, 1, 4]
take_while_positive([5, 3, 0, 2])
# [5, 3]
take_while_positive([1, 2, 3])
# [1, 2, 3]
take_while_positive([-1, 2, 3])  # []
take_while_positive([])          # []
```
