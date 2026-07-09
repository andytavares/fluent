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

## Watch out

- `functools.reduce` with no initial value raises `TypeError` on an empty iterable. Always pass an explicit initial value (as in the `product` example above) unless you're certain the iterable is non-empty.
- `*args` captures positional arguments as a **tuple**, not a list — you can't mutate it in place; convert with `list(args)` first if you need to.
- Mixing positional and keyword-only params: once you write `*` or `*args` in the signature, everything after it must be passed by keyword. Calling with an extra positional argument raises `TypeError: takes N positional arguments but M were given`, which can be a confusing error message if you weren't expecting the cutoff.
- `@cache`/`@lru_cache` keeps every distinct set of arguments alive forever (or until `maxsize` is hit for `lru_cache`) — don't cache functions called with unbounded/unique arguments (e.g. request IDs) or memory grows without limit.

## The task

Implement three functions that exercise variadic arguments, closures, and composition via `reduce`.

**`total(*values: float) -> float`** — returns the sum of all positional arguments passed in. Called with no arguments, returns `0.0`.

```python
total(1, 2, 3)      # 6.0
total(5)            # 5.0
total()              # 0.0
total(1.5, 2.5)      # 4.0
total(-1, -2, 3)     # 0.0
```

**`make_multiplier(factor: float) -> Callable[[float], float]`** — returns a new function that takes a single number `x` and returns `x * factor`. Each call to `make_multiplier` produces an independent function — `factor` is captured from that call, not shared across calls.

```python
double = make_multiplier(2)
double(5)    # 10.0
double(0)    # 0.0

triple = make_multiplier(3)
triple(4)    # 12.0
double(4)    # 8.0 — double is unaffected by triple
```

**`pipeline(value: float, *fns: Callable[[float], float]) -> float`** — applies each function in `fns` to `value` in sequence, left to right (the output of one call is the input to the next), using `functools.reduce`. Called with no `fns`, returns `value` unchanged.

```python
double = make_multiplier(2)
triple = make_multiplier(3)

pipeline(7)                     # 7.0   — no fns, value passes through
pipeline(3, double)              # 6.0   — double(3)
pipeline(3, double, triple)      # 18.0  — triple(double(3)) = triple(6)
pipeline(2, triple, make_multiplier(4))  # 24.0 — order matters: triple first, then *4
```
