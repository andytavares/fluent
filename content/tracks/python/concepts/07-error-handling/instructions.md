# Error Handling

## What you'll learn

Python's `try/except/else/finally` block, the exception class hierarchy, defining custom exceptions, and context managers — both `with` statements and the `contextlib` module.

## Key concepts

**Full `try` block anatomy:**
```python
try:
    result = int(user_input)
except ValueError as e:
    print(f"bad input: {e}")
except (TypeError, OverflowError):
    print("type or overflow problem")
else:
    # runs only if no exception was raised
    print(f"got {result}")
finally:
    # always runs — cleanup goes here
    print("done")
```

The `else` clause is Python-specific and underused. It runs when the `try` block completes without raising — keeping it separate from `finally` makes the intent explicit.

**Exception hierarchy:**
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

Never catch `BaseException` unless you mean it — `SystemExit` and `KeyboardInterrupt` are subclasses and you almost never want to swallow those. Catching bare `except:` (no type) also catches `BaseException`.

**Custom exceptions:**
```python
class AppError(Exception):
    """Base for all application errors."""

class ConfigError(AppError):
    def __init__(self, key: str, message: str) -> None:
        super().__init__(f"config key '{key}': {message}")
        self.key = key
```

Define a base `AppError` and subclass it. This lets callers catch `AppError` broadly or specific subclasses narrowly.

**Exception chaining:**
```python
try:
    data = json.loads(raw)
except json.JSONDecodeError as e:
    raise ConfigError("data", "invalid JSON") from e
```
`raise ... from e` sets `__cause__` and produces clean tracebacks. `raise ... from None` suppresses the original.

**Context managers — `with` statement:**
```python
with open("file.txt") as f:
    data = f.read()
# file is closed even if an exception is raised
```

Implement `__enter__` and `__exit__` to make a class a context manager:
```python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        return False  # False = don't suppress the exception
```

**`contextlib.contextmanager` — generator-based:**
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

## vs other languages

| Feature | Python | Java | Go | JS |
|---|---|---|---|---|
| Error model | exceptions | checked + unchecked exceptions | return `(value, error)` | exceptions |
| Cleanup | `finally` / `with` | `finally` / try-with-resources | `defer` | `finally` |
| Custom errors | subclass `Exception` | subclass `Exception` | implement `error` interface | subclass `Error` |
| Error chaining | `raise X from Y` | `initCause` / constructor | wrapping via `fmt.Errorf %w` | No standard |
| Context managers | `with` / `__enter__/__exit__` | try-with-resources (`Closeable`) | `defer` | No |

Go's error model forces you to handle errors at each call site; Python's exception model lets errors propagate up the call stack automatically. Both have tradeoffs — Python can lead to silent propagation; Go can lead to verbose boilerplate.

## Watch out

- Bare `except:` (no exception type) catches `BaseException`, including `KeyboardInterrupt` and `SystemExit` — it can make `Ctrl-C` and `sys.exit()` stop working as expected. Always catch a specific type, or at least `Exception`.
- A `return` inside `finally` silently swallows any exception (and overrides any `return` from the `try`/`except`) — `finally` blocks should handle cleanup, not control flow.
- `except Exception as e: pass` hides bugs. If you must suppress an error, log it or narrow the exception type — don't catch broadly "just in case."
- `__exit__` must return a truthy value to **suppress** an exception; returning `None` (the default if you forget a `return`) lets the exception propagate. It's easy to write an `__exit__` that looks like it handles errors but doesn't.

## The task

Implement three things: a custom exception, a function that translates one exception into another, and a context manager class.

**`class ParseError(ValueError)`** — a custom exception subclassing `ValueError`. Its `__init__(self, raw: str)` stores the original string on a `raw` attribute and passes the message `f"cannot parse: '{raw}'"` to the base class.

```python
try:
    raise ParseError("abc123")
except ParseError as e:
    str(e)    # "cannot parse: 'abc123'"
    e.raw     # "abc123"

issubclass(ParseError, ValueError)  # True
```

**`safe_divide(a: float, b: float) -> float`** — returns `a / b`. If `b == 0`, raises `ValueError("division by zero")` instead of letting `ZeroDivisionError` propagate — use `raise ... from None` so the original `ZeroDivisionError` doesn't appear in the traceback as the cause.

```python
safe_divide(10, 2)   # 5.0
safe_divide(1, 4)    # 0.25
safe_divide(0, 5)    # 0.0
safe_divide(5, 0)    # raises ValueError("division by zero")
```

**`class Accumulator`** — a context manager class. Constructor `__init__(self, *suppress_types)` stores the exception types to suppress and initializes an `errors: list` attribute to `[]`. `__enter__` returns `self`. `__exit__` inspects the exception type raised inside the `with` block (if any): if it's one of `suppress_types` (checked with `issubclass`), append that type to `self.errors` and suppress it (the exception does not propagate); otherwise let it propagate normally. A `with` block that raises nothing leaves `errors` empty.

```python
with Accumulator(ValueError, TypeError) as acc:
    raise ValueError("oops")
acc.errors   # [ValueError]  — suppressed, doesn't propagate

with Accumulator(ValueError) as acc:
    x = 1 + 1
acc.errors   # []  — no exception was raised

with Accumulator(ValueError):
    raise TypeError("wrong")   # not in suppress_types — propagates out of the `with`
```
