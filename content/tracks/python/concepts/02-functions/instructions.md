# Functions

## What you'll learn

Python functions are first-class objects. You'll cover the full argument system (`*args`, `**kwargs`, keyword-only params, defaults), type annotations, and `functools` utilities that belong in any Python engineer's toolkit.

## Key concepts

**Basic signature with annotations:**
```python
def greet(name: str, *, loud: bool = False) -> str:
    msg = f"Hello, {name}"
    return msg.upper() if loud else msg
```

The `*` in the parameter list marks everything after it as keyword-only. `greet("Alice", loud=True)` works; `greet("Alice", True)` raises `TypeError`.

**Default values — the mutable default trap:**
```python
# WRONG — the list is created once at function definition time
def append_to(item, lst=[]):
    lst.append(item)
    return lst

# RIGHT — use None as sentinel
def append_to(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

**`*args` and `**kwargs`:**
```python
def variadic(*args: int, **kwargs: str) -> None:
    for n in args:
        print(n)
    for key, val in kwargs.items():
        print(f"{key}={val}")

variadic(1, 2, 3, color="red", size="large")
```

**Keyword-only and positional-only:**
```python
def mixed(pos_only, /, normal, *, kw_only):
    ...
# pos_only must be positional, kw_only must be keyword
```

**`functools.reduce` and `functools.partial`:**
```python
from functools import reduce, partial

product = reduce(lambda acc, x: acc * x, [1, 2, 3, 4], 1)  # 24

double = partial(lambda factor, x: x * factor, 2)
double(5)  # 10
```

**`functools.cache` (3.9+) / `lru_cache`:**
```python
from functools import cache

@cache
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

## vs other languages

| Feature | Python | JavaScript | Java |
|---|---|---|---|
| Default args | Yes, but mutable default trap | Yes, same trap | No (use overloads) |
| Variadic | `*args` tuple | rest `...args` array | varargs `T...` array |
| Named args at call site | Always available | No (object destructuring workaround) | No |
| First-class functions | Yes | Yes | Yes (lambdas/method refs) |
| Partial application | `functools.partial` | `.bind()` | Manual or libraries |

Python's keyword argument system is its biggest ergonomic advantage over most languages. Any argument can be passed by name, and you can enforce keyword-only with `*`.

## The task

Implement three functions:

- `total(*values: float) -> float` — returns the sum of all positional arguments; returns `0.0` if called with no arguments
- `make_multiplier(factor: float)` — returns a new function that multiplies its single argument by `factor`
- `pipeline(value: float, *fns) -> float` — applies each function in `fns` to `value` in sequence (left to right) using `functools.reduce`, then returns the result
