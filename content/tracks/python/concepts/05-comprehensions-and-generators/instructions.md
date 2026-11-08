## What you build

You write `squares_of_evens`, `running_total` and `flatten`. They use a list comprehension, a generator function and `yield from`. This lesson builds on **Classes & Objects**.

## Key concepts

### A comprehension builds a collection in one expression

Comprehensions are a language feature, not sugar for `map` and `filter`. They are expressions, so they can go anywhere an expression can go. Python has list, dict and set comprehensions.

```python
squares = [x ** 2 for x in range(10)]
evens = [x for x in range(20)
         if x % 2 == 0]

words = ["cat", "elephant", "dog"]
word_len = {w: len(w) for w in words}
unique_lengths = {len(w) for w in words}
```

### Nested comprehensions read left to right

The `for` clauses come in the same order as nested `for` loops.

```python
flat = [x for row in matrix for x in row]
# The same as:
# for row in matrix:
#     for x in row:
#         flat.append(x)
```

### A generator expression is lazy

Parentheses in place of brackets give a generator expression. It returns a generator object: an iterator that computes each value on demand. It does not load all values into memory.

```python
# Builds all 1M items first
sum([x ** 2 for x in range(1_000_000)])

# Computes one item at a time.
# No extra [] inside sum().
sum(x ** 2 for x in range(1_000_000))
```

### `yield` makes a generator function

A call to a function with `yield` returns a generator object and runs none of the body. Each `next()` runs the body to the next `yield`, then pauses there. When the body ends, the generator raises `StopIteration`.

```python
from typing import Generator

def fibonacci() -> Generator[
    int, None, None
]:
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

gen = fibonacci()
[next(gen) for _ in range(8)]
# [0, 1, 1, 2, 3, 5, 8, 13]
```

JavaScript `function*` generators return `{value, done}` objects from `.next()` in place of `StopIteration`.

### `yield from` hands off to another iterable

`yield from it` yields each value of `it`. It is shorter than `for x in it: yield x`. It also passes `send()` and `throw()` through to a sub-generator.

```python
def chain(*iterables):
    for it in iterables:
        yield from it

list(chain([1, 2], [3, 4], [5]))
# [1, 2, 3, 4, 5]
```

## Watch out

- A generator works once. After it ends, a second `for` loop or `list()` over it yields nothing.
- To start again, call the generator function again for a new generator.
- A call to a generator function runs no code. A bug in the body appears only when iteration reaches it.
- In `[x for row in m for x in row if x > 0]`, `if` filters the inner `x`.
- An `if` applies to the loop it follows, not to the whole expression.
- Do not build a list only to pass it to `sum()`, `max()` or `any()`. Remove the `[` `]` to use a generator expression.

## The task

Write three functions in `stub.py`. They use a list comprehension, a generator function and `yield from`.

1. `squares_of_evens(n: int) -> list[int]` returns the square of each even number in `range(0, n)`.
2. `range(0, n)` includes 0 and excludes `n`. Build the list with a list comprehension.
3. `running_total(numbers: list[float]) -> Generator[float, None, None]` is a generator function. It must use `yield`.
4. A call to `running_total` returns a generator object. It yields the running total after each number, in order.
5. `flatten(nested: list[list]) -> list` removes one level of nesting. It returns a plain `list`, not a generator.
6. Inside `flatten`, use a helper generator with `yield from`. Pass it to `list(...)` before you return.

Empty input gives an empty result for all three functions.

```python
squares_of_evens(10)  # [0, 4, 16, 36, 64]
squares_of_evens(5)   # [0, 4, 16]
squares_of_evens(2)   # [0]
squares_of_evens(1)   # [0]
squares_of_evens(0)   # []

list(running_total([1, 2, 3, 4]))
# [1.0, 3.0, 6.0, 10.0]
list(running_total([]))     # []
list(running_total([5.0]))  # [5.0]
list(running_total([10.0, -3.0, -2.0]))
# [10.0, 7.0, 5.0]

flatten([[1, 2], [3, 4], [5]])
# [1, 2, 3, 4, 5]
flatten([])                  # []
flatten([[], [], []])        # []
flatten([[1], [2], [3]])     # [1, 2, 3]
flatten([[1, 2, 3], [], [4]])
# [1, 2, 3, 4]
```
