# Comprehensions & Generators

## What you'll learn

Python's comprehension syntax is a first-class language feature, not syntactic sugar for `map`/`filter`. Generator expressions and `yield` let you build lazy pipelines that process data without loading it all into memory.

## Key concepts

**List, dict, and set comprehensions:**
```python
squares = [x ** 2 for x in range(10)]
evens   = [x for x in range(20) if x % 2 == 0]

word_len = {word: len(word) for word in ["cat", "elephant", "dog"]}
unique_lengths = {len(w) for w in ["cat", "elephant", "dog"]}
```

Nested comprehensions read left-to-right, same order as the equivalent `for` loops:
```python
flat = [x for row in matrix for x in row]
# equivalent to:
# for row in matrix:
#     for x in row:
#         flat.append(x)
```

**Generator expressions — lazy evaluation:**
```python
# List comprehension: evaluates all 1M items immediately
total = sum([x ** 2 for x in range(1_000_000)])

# Generator expression: computes one at a time
total = sum(x ** 2 for x in range(1_000_000))  # note: no extra []
```

A generator expression returns a generator object — an iterator that yields values on demand.

**`yield` — generator functions:**
```python
def fibonacci() -> Generator[int, None, None]:
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

gen = fibonacci()
[next(gen) for _ in range(8)]  # [0, 1, 1, 2, 3, 5, 8, 13]
```

A function containing `yield` returns a generator object when called. Execution is suspended at each `yield` and resumed on the next call to `next()`.

**`yield from` — delegating to sub-generators:**
```python
def chain(*iterables):
    for it in iterables:
        yield from it

list(chain([1, 2], [3, 4], [5]))  # [1, 2, 3, 4, 5]
```

`yield from` is cleaner than a nested `for x in it: yield x` loop and also threads `send()` and `throw()` through to the sub-generator.

## vs other languages

| Feature | Python | JavaScript | Java | Go |
|---|---|---|---|---|
| List comprehension | `[x for x in ...]` | `.map()` / `.filter()` | streams | manual loop |
| Lazy sequence | generator expression | generators (`function*`) | `Stream<T>` (lazy) | channels |
| Generator function | `yield` | `yield` in `function*` | No direct equivalent | goroutine + channel |
| Delegate generator | `yield from` | `yield*` | No | No |

Python comprehensions are expressions — they can appear anywhere an expression is valid. JavaScript `function*` generators require explicit `.next()` and return `{value, done}` objects; Python generators raise `StopIteration` when exhausted.

## Watch out

- Generators are **single-use**. Once exhausted (fully iterated, or `StopIteration` raised), a second `for` loop or `list()` call over the same generator object yields nothing — you must call the generator function again to get a fresh one.
- Calling a generator function does not run any of its code — the body only executes as you pull values with `next()` or a `for` loop. A bug inside a generator (e.g. a bad index) won't surface until the relevant `yield` is reached.
- Nested comprehensions can be misread: `[x for row in matrix for x in row if x > 0]` filters on the **inner** variable — the `if` binds to the loop it trails, not to the whole expression.
- Don't build a giant list just to throw it at `sum()`/`max()`/`any()` — a generator expression (no brackets) avoids the intermediate list and often needs no code changes beyond removing `[` `]`.

## The task

Implement three functions covering list comprehensions, generator functions, and `yield from`.

**`squares_of_evens(n: int) -> list[int]`** — returns a list of the squares of every even number in `range(0, n)` (0 up to but not including `n`), built with a list comprehension.

```python
squares_of_evens(10)   # [0, 4, 16, 36, 64]   — 0,2,4,6,8 squared
squares_of_evens(5)    # [0, 4, 16]            — 0,2,4 squared
squares_of_evens(1)    # [0]
squares_of_evens(0)    # []
```

**`running_total(numbers: list[float])`** — a **generator function** (must use `yield`, and calling it must return a generator object) that yields the running cumulative total after each element of `numbers`, in order.

```python
list(running_total([1, 2, 3, 4]))   # [1.0, 3.0, 6.0, 10.0]
list(running_total([]))              # []
list(running_total([5.0]))           # [5.0]
list(running_total([10.0, -3.0, -2.0]))  # [10.0, 7.0, 5.0]
```

**`flatten(nested: list[list]) -> list`** — flattens one level of nesting from `nested` and returns a plain `list` (not a generator). Internally, delegate to sublists using `yield from` inside a helper generator, then consume it with `list(...)` before returning.

```python
flatten([[1, 2], [3, 4], [5]])   # [1, 2, 3, 4, 5]
flatten([])                       # []
flatten([[], [], []])             # []
flatten([[1, 2, 3], [], [4]])     # [1, 2, 3, 4]
```
