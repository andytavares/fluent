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

## The task

Implement three functions:

- `squares_of_evens(n: int) -> list[int]` — returns a list of squares of even numbers from 0 up to (but not including) `n`, using a list comprehension
- `running_total(numbers: list[float])` — a generator function that yields the running (cumulative) total after each number
- `flatten(nested: list[list]) -> list` — flattens one level of nesting using `yield from`; return type is a plain list (consume the generator inside the function)
