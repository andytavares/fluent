## What you build

You write a custom exception `ParseError`, a function `safe_divide` that translates one exception into another, and a context manager `Accumulator`. This lesson builds on **Classes & Objects**.

## Key concepts

### A `try` block has four clauses

`except` handles a matching exception. `else` runs only when the `try` body raises nothing. `finally` always runs, so cleanup goes there. A separate `else` makes the intent clear.

```python
try:
    result = int(user_input)
except ValueError as e:
    print(f"bad input: {e}")
except (TypeError, OverflowError):
    print("type or overflow problem")
else:
    # Runs only if nothing raised
    print(f"got {result}")
finally:
    # Always runs: cleanup goes here
    print("done")
```

### Exceptions form a class hierarchy

An `except` clause also catches every subclass of its type. `SystemExit` and `KeyboardInterrupt` derive from `BaseException`, not from `Exception`.

```
BaseException
├── SystemExit
├── KeyboardInterrupt
└── Exception
    ├── ValueError
    ├── TypeError
    ├── RuntimeError
    ├── OSError
    │   ├── FileNotFoundError
    │   └── PermissionError
    └── ...
```

### Custom exceptions subclass `Exception`

Define one base class for your application, then subclass it. Callers can catch the base class broadly or a subclass narrowly.

```python
class AppError(Exception):
    """Base for all app errors."""

class ConfigError(AppError):
    def __init__(self, key: str, msg: str):
        super().__init__(
            f"config key '{key}': {msg}"
        )
        self.key = key
```

### `raise ... from` chains exceptions

`raise X from e` sets `__cause__`, and the traceback shows both exceptions. `raise X from None` hides the original exception. Go returns an error value at each call site, but Python exceptions propagate up the stack on their own.

```python
try:
    data = json.loads(raw)
except json.JSONDecodeError as e:
    raise ConfigError(
        "data", "invalid JSON"
    ) from e
```

### `with` runs cleanup for you

A context manager runs setup code on entry and cleanup code on exit. The cleanup runs even if the block raises.

```python
with open("file.txt") as f:
    data = f.read()
# The file is closed, even on error
```

### `__enter__` and `__exit__` make a class a context manager

`__enter__` returns the value for `as`. `__exit__` receives the exception type, value and traceback, or three `None` values. If `__exit__` returns a truthy value, Python suppresses the exception.

```python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        now = time.perf_counter()
        self.elapsed = now - self.start
        # False: do not suppress
        return False
```

### `@contextmanager` builds one from a generator

The code before `yield` is the setup, and the code after it is the cleanup. Put `yield` in a `try` block, so the cleanup runs on error.

```python
from contextlib import contextmanager

@contextmanager
def managed_resource():
    resource = acquire()
    try:
        yield resource
    finally:
        release(resource)
```

## Watch out

- A bare `except:` catches `BaseException`. Then `Ctrl-C` and `sys.exit()` can stop working. Catch a specific type, or `Exception`.
- Do not catch `BaseException` unless you mean to stop `SystemExit` and `KeyboardInterrupt`.
- A `return` inside `finally` discards any exception. It also replaces any `return` from `try` or `except`.
- Use `finally` for cleanup, not for control flow.
- `except Exception as e: pass` hides bugs. To suppress an error, log it or narrow the type.
- `__exit__` must return a truthy value to suppress an exception. A missing `return` gives `None`, so the exception propagates.

## The task

Write a custom exception, a function that translates an exception, and a context manager class in `stub.py`.

`class ParseError(ValueError)` is a custom exception.

1. `__init__(self, raw: str)` stores the original string in the `raw` attribute.
2. It passes the message `f"cannot parse: '{raw}'"` to the base class.

`safe_divide(a: float, b: float) -> float` returns `a / b`.

1. If `b == 0`, raise `ValueError("division by zero")`. Do not let `ZeroDivisionError` propagate.
2. Use `raise ... from None`, so the traceback does not show `ZeroDivisionError` as the cause.

`class Accumulator` is a context manager.

1. `__init__(self, *suppress_types)` stores the exception types to suppress. It sets `self.errors` to `[]`.
2. `__enter__` returns `self`.
3. `__exit__` checks the type of the exception from the `with` block with `issubclass`.
4. If the type is in `suppress_types`, append the type to `self.errors` and suppress the exception.
5. Any other exception propagates.
6. A `with` block that raises nothing leaves `errors` empty.

```python
issubclass(ParseError, ValueError)  # True
str(ParseError("bad_input"))
# "cannot parse: 'bad_input'"
ParseError("xyz").raw  # "xyz"

safe_divide(10, 2)  # 5.0
safe_divide(1, 4)   # 0.25
safe_divide(0, 5)   # 0.0
safe_divide(5, 0)
# ValueError("division by zero")

with Accumulator(ValueError) as acc:
    raise ValueError("oops")
acc.errors  # [ValueError]

with Accumulator(ValueError,
                 TypeError) as acc:
    raise TypeError("type")
acc.errors  # [TypeError]

with Accumulator(ValueError) as acc:
    x = 1 + 1
acc.errors  # []

# TypeError propagates out of the with
with Accumulator(ValueError):
    raise TypeError("wrong")
```
