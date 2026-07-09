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

## Watch out

- Forgetting to `return wrapper` (or accidentally calling `fn()` instead of returning the wrapper) is the most common decorator bug — the function silently stops being decorated, or gets called at decoration time instead of call time.
- Forgetting `@wraps(fn)` doesn't break behavior, but it breaks introspection: `help()`, debuggers, and other decorators that inspect `__name__`/`__doc__` all see `wrapper` instead of the real function.
- A decorator factory (`repeat(n)`) needs **three** levels of nesting — factory → decorator → wrapper. Forgetting one level is a common off-by-one: `@repeat(3)` calls `repeat(3)` first (must return a decorator), then applies that decorator to the function.
- Stacking order matters and reads bottom-up: `@a` above `@b` above `def f` means `a(b(f))` — `b` sees the raw `f`, `a` sees `b`'s wrapper.

## The task

Implement two decorators.

**`retry(times: int, exceptions: tuple = (Exception,))`** — a decorator **factory** (a function that returns a decorator). The decorated function is called up to `times` attempts. If it raises one of the exception types in `exceptions`, it's retried; if it succeeds on any attempt, that result is returned immediately with no further calls. If every attempt raises, the exception from the **last** attempt is re-raised. Exceptions not in `exceptions` propagate immediately without retrying. Use `@wraps` so the wrapper preserves the original function's metadata.

```python
attempts = 0

@retry(times=3, exceptions=(ValueError,))
def flaky():
    global attempts
    attempts += 1
    if attempts < 3:
        raise ValueError("not yet")
    return "ok"

flaky()       # "ok" — succeeded on the 3rd attempt; called exactly 3 times

@retry(times=3)
def always_fails():
    raise RuntimeError("boom")

always_fails()  # raises RuntimeError after 3 attempts — last exception re-raised

@retry(times=3, exceptions=(ValueError,))
def wrong_type():
    raise TypeError("not a ValueError")

wrong_type()    # raises TypeError immediately — not in `exceptions`, no retry
```

**`memoize`** — a decorator (not a factory — applied directly as `@memoize`) that caches a function's return value keyed by its positional arguments. Calling the wrapped function again with the same arguments returns the cached value without calling the underlying function. The wrapper must expose the cache as a `.cache` dict attribute (keyed by the argument tuple) for inspection. Use `@wraps`.

```python
calls = []

@memoize
def compute(n):
    calls.append(n)
    return n * 2

compute(5)        # 10 — computed, calls == [5]
compute(5)        # 10 — cached, calls still == [5]
compute(3)        # 6  — new args, calls == [5, 3]

compute.cache      # {(5,): 10, (3,): 6}
```
