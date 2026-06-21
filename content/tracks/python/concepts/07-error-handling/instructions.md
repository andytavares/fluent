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

## The task

Implement three things:

- `class ParseError(ValueError)` — custom exception with a `raw` attribute storing the original string that failed to parse, and a message `"cannot parse: '<raw>'"`.
- `safe_divide(a: float, b: float) -> float` — returns `a / b`; raises `ValueError` with message `"division by zero"` if `b == 0`. Use `raise ... from None` to suppress the original `ZeroDivisionError`.
- `class Accumulator` — a context manager class. On `__enter__`, returns itself. Collects any exception types (not instances) that occur inside the block via an `errors` list attribute, suppresses those exceptions, and lets others propagate. Constructor takes `*suppress_types`.
