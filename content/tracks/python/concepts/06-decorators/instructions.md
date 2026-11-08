## What you build

You write two decorators: the factory `retry` and the plain decorator `memoize`. This lesson builds on **Functions**.

## Key concepts

### A decorator takes a callable and returns a callable

A decorator wraps a function to extend its behavior without a change to its source. The `@` syntax is sugar for `fn = decorator(fn)`. A decorator can be a function or a class.

```python
def loudly(fn):
    def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        result = fn(*args, **kwargs)
        print("done")
        return result
    return wrapper

@loudly
def add(a, b):
    return a + b
# The same as: add = loudly(add)
```

### `functools.wraps` keeps the metadata

Without `@wraps`, the wrapper hides the `__name__`, `__doc__` and signature of the original function. Always use it.

```python
from functools import wraps

def loudly(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print(f"calling {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper
```

### A decorator factory takes arguments

A factory returns the real decorator, so it adds one more level. `@repeat(3)` first calls `repeat(3)`, then applies the decorator it returns.

```python
def repeat(n: int):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kw):
            for _ in range(n):
                result = fn(*args, **kw)
            return result
        return wrapper
    return decorator

@repeat(3)
def say(msg: str) -> None:
    print(msg)
# The same as: say = repeat(3)(say)
```

### Stacked decorators apply from the bottom up

The decorator nearest the `def` wraps the function first. The decorator above it wraps the result.

```python
@decorator_a
@decorator_b
def fn():
    ...
# fn = decorator_a(decorator_b(fn))
```

### A class can be a decorator

The class receives the function in `__init__`. Each call to the decorated name runs `__call__`. The instance can keep state, such as a call count.

```python
class CountCalls:
    def __init__(self, fn):
        # Copy the metadata of fn
        wraps(fn)(self)
        self.fn = fn
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.fn(*args, **kwargs)
```

### Python decorators run code, and Java annotations do not

A Python decorator runs when Python defines the function and replaces the decorated object. A Java `@Annotation` is metadata that frameworks read through reflection.

```python
@loudly       # runs loudly(add) now
def add(a, b):
    return a + b
```

## Watch out

- If the decorator does not `return wrapper`, the decorated name becomes `None`.
- If the decorator calls `fn()` in place of returning the wrapper, `fn` runs at definition time, not at call time.
- Without `@wraps(fn)`, behavior still works, but `help()`, debuggers and other decorators see `wrapper` as the name.
- A decorator factory needs three levels: factory, decorator and wrapper. With one level missing, the decorator breaks.
- `@a` above `@b` above `def f` gives `a(b(f))`. `b` gets the raw `f`, and `a` gets the wrapper of `b`.

## The task

Write two decorators in `stub.py`. Both use `@wraps`, so the wrapper keeps the `__name__` of the original function.

`retry(times: int, exceptions: tuple = (Exception,))` is a decorator factory: a function that returns a decorator.

1. The wrapper calls the decorated function at most `times` times.
2. If a call raises an exception type from `exceptions`, the wrapper tries again.
3. If a call succeeds, the wrapper returns its result at once. It makes no more calls.
4. If every call raises, the wrapper raises the exception from the last call.
5. An exception type not in `exceptions` propagates at once, with no retry.

`memoize` is a plain decorator. You apply it as `@memoize`, with no arguments.

1. The wrapper caches each return value. The key is the tuple of positional arguments.
2. A call with the same arguments returns the cached value. It does not call the original function.
3. The wrapper exposes the cache as a `.cache` dict attribute.

```python
@retry(times=3)
def ok():
    return "done"
ok()  # "done", after 1 call

# Fails once, then returns "ok"
@retry(times=3)
def flaky(): ...
flaky()  # "ok", after 2 calls

@retry(times=3)
def always_fails():
    raise RuntimeError("boom")
always_fails()
# RuntimeError, after 3 calls

@retry(times=3, exceptions=(ValueError,))
def wrong_exc():
    raise TypeError("wrong type")
wrong_exc()  # TypeError, after 1 call

@memoize
def compute(n):
    return n * 2
compute(5)  # 10: calls compute
compute(5)  # 10: from the cache
compute(3)  # 6: calls compute
compute(4)  # 8: calls compute

@memoize
def square(n):
    return n ** 2
square(3)
square(4)
square.cache[(3,)]  # 9
square.cache[(4,)]  # 16
square.__name__     # "square"
```
