## What you build

You write `total`, `make_multiplier` and `pipeline`. They use variadic arguments, closures and `functools.reduce`. This lesson builds on **Variables & Types**.

## Key concepts

### Functions are first-class objects

You can store a function in a variable, pass it as an argument and return it from another function. A returned inner function keeps the variables of the call that made it. This is a closure.

```python
def make_greeter(greeting):
    def greet(name):
        return f"{greeting}, {name}"
    return greet

hi = make_greeter("Hi")
hi("Ana")  # 'Hi, Ana'
```

### A bare `*` makes the next parameters keyword-only

The caller must pass every parameter after `*` by name. `greet("Alice", loud=True)` works. `greet("Alice", True)` raises `TypeError`.

```python
def greet(
    name: str, *, loud: bool = False
) -> str:
    msg = f"Hello, {name}"
    return msg.upper() if loud else msg
```

### A `/` makes the earlier parameters positional-only

The caller must pass every parameter before `/` by position. You can combine `/` and `*` in one signature. A caller can pass any other argument by name, which Java and JavaScript do not allow.

```python
def mixed(pos_only, /, normal, *, kw_only):
    ...
```

### Python creates a default value once

Python evaluates a default when it defines the function, not on each call. Every call shares a mutable default, such as a list. Use `None` as a sentinel.

```python
# Wrong: one list for every call
def append_to(item, lst=[]):
    lst.append(item)
    return lst

# Right: a new list for each call
def append_to(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

### `*args` and `**kwargs` collect extra arguments

`*args` collects extra positional arguments into a tuple. `**kwargs` collects extra keyword arguments into a dict.

```python
def variadic(*args: int, **kwargs: str):
    for n in args:
        print(n)
    for key, val in kwargs.items():
        print(f"{key}={val}")

variadic(1, 2, 3, color="red")
```

### `reduce` folds a sequence, and `partial` fixes arguments

`functools.reduce` calls a function on an accumulator and each item in turn. `functools.partial` returns a new function with some arguments already filled in.

```python
from functools import reduce, partial

product = reduce(
    lambda acc, x: acc * x, [1, 2, 3, 4], 1
)  # 24

double = partial(lambda f, x: x * f, 2)
double(5)  # 10
```

### `cache` stores the results of a function

`functools.cache` (Python 3.9 or later) stores the result for each set of arguments. `functools.lru_cache` does the same, with an optional `maxsize` limit.

```python
from functools import cache

@cache
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

## Watch out

- `reduce` with no initial value raises `TypeError` on an empty iterable. Pass an initial value.
- `*args` is a tuple, not a list. To change it, convert it with `list(args)` first.
- After `*` or `*args`, every parameter is keyword-only. An extra positional argument raises `TypeError`.
- That error says `takes N positional arguments but M were given`. It is confusing when you do not expect the cutoff.
- `@cache` keeps every distinct set of arguments in memory forever. `@lru_cache` keeps them until it reaches `maxsize`.
- Do not cache a function that gets unique arguments, such as request IDs. Memory grows without limit.

## The task

Write three functions in `stub.py`. They use variadic arguments, closures and composition with `reduce`.

1. `total(*values: float) -> float` returns the sum of all positional arguments.
2. With no arguments, `total` returns `0.0`.
3. `make_multiplier(factor: float) -> Callable[[float], float]` returns a function. That function takes one number `x` and returns `x * factor`.
4. Each call to `make_multiplier` returns an independent function. It keeps the `factor` of its own call.
5. `pipeline(value: float, *fns: Callable[[float], float]) -> float` applies each function in `fns` to `value`, left to right.
6. The output of one function is the input of the next. Use `functools.reduce`.
7. With no `fns`, `pipeline` returns `value` unchanged.

```python
total(1, 2, 3)     # 6.0
total(5)           # 5.0
total()            # 0.0
total(1.5, 2.5)    # 4.0
total(-1, -2, 3)   # 0.0

make_multiplier(2)(5)     # 10.0
make_multiplier(3)(4)     # 12.0
make_multiplier(0)(99)    # 0.0
make_multiplier(0.5)(10)  # 5.0

double = make_multiplier(2)
triple = make_multiplier(3)
pipeline(7)                  # 7.0
pipeline(3, double)          # 6.0
pipeline(3, double, triple)  # 18.0
inc = lambda x: x + 1
pipeline(5, inc, double)     # 12.0

# Order matters: 2 * 3, then * 4 = 24.0
pipeline(2, triple, make_multiplier(4))
```
