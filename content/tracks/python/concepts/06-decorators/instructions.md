# Decorators

## What you'll learn

Decorators are functions (or classes) that wrap other functions to extend their behavior without modifying their source. Python's `@` syntax is pure syntactic sugar for `fn = decorator(fn)`. You'll build decorators from scratch, use `functools.wraps` correctly, write decorator factories, and stack multiple decorators.

## Key concepts

**A decorator is a callable that takes a callable and returns a callable:**
```python
def loudly(fn):
    def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        result = fn(*args, **kwargs)
        print(f"done")
        return result
    return wrapper

@loudly
def add(a, b):
    return a + b
# equivalent to: add = loudly(add)
```

**`functools.wraps` — preserve metadata:**
Without `@wraps`, the wrapper hides the original function's `__name__`, `__doc__`, and signature. Always use it:
```python
from functools import wraps

def loudly(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper
```

**Decorator factory — decorator with arguments:**
A factory returns the actual decorator. It adds one extra layer:
```python
def repeat(n: int):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = fn(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say(msg: str) -> None:
    print(msg)
# equivalent to: say = repeat(3)(say)
```

**Stacking decorators — applied bottom-up:**
```python
@decorator_a
@decorator_b
def fn():
    ...
# equivalent to: fn = decorator_a(decorator_b(fn))
```

`decorator_b` wraps `fn` first, then `decorator_a` wraps the result.

**Class-based decorators:**
```python
class CountCalls:
    def __init__(self, fn):
        wraps(fn)(self)   # copy metadata
        self.fn = fn
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.fn(*args, **kwargs)
```

## vs other languages

| Feature | Python | Java | TypeScript | Go |
|---|---|---|---|---|
| Decorator syntax | `@decorator` | `@Annotation` (compile-time metadata) | `@decorator` (stage 3) | No |
| Runtime modification | Yes — full code wrapping | No — annotations are metadata | Yes (but limited) | Manual wrapper functions |
| Argument access | `*args, **kwargs` forwarding | N/A | N/A | Manual |

Java `@Annotation` and Python `@decorator` look similar but are fundamentally different. Java annotations are compile-time metadata read by frameworks via reflection — they don't modify behavior at runtime. Python decorators execute at import time and completely replace the decorated object.

## The task

Implement two decorators:

- `retry(times: int, exceptions: tuple = (Exception,))` — a decorator factory. The decorated function is called up to `times` attempts. If it raises one of the given `exceptions`, it retries. If all attempts fail, the last exception is re-raised. Use `@wraps`.
- `memoize` — a decorator (not a factory) that caches return values by positional args. If the same args are passed again, return the cached result. The decorated function must expose a `.cache` dict attribute on the wrapper for inspection. Use `@wraps`.
