# Variables & Types

## What you'll learn

Python is dynamically typed — variables hold references to objects, and the type lives on the object, not the variable. You'll learn Python's core built-in types, how to annotate them without enforcing them at runtime, f-strings for formatting, and the walrus operator for inline assignment.

## Key concepts

**Dynamic typing — no declarations:**
```python
x = 42          # int
x = "hello"     # now str — perfectly legal
x = None        # NoneType — Python's null
```

**Core built-in types:**
```python
age: int = 30
price: float = 9.99
name: str = "Alice"
active: bool = True
nothing: None = None
```

Type hints (PEP 484) are annotations only — Python does not enforce them at runtime. Use them for tooling (mypy, pyright) and readability.

**f-strings (3.6+):**
```python
user = "Alice"
score = 42
label = f"{user} scored {score:.1f} points"
# debug format (3.8+)
print(f"{score=}")  # score=42
```

**`type()` and `isinstance()`:**
```python
type(42)            # <class 'int'>
isinstance(42, int) # True
isinstance(42, (int, float))  # True — checks against a tuple of types
```

**Walrus operator `:=` (3.8+):**
Assigns and returns a value in a single expression. Useful inside `while` or `if` to avoid reading twice:
```python
import re
if m := re.search(r"\d+", text):
    print(m.group())   # m is bound here, no second call
```

**`None` comparisons — always use `is`:**
```python
if result is None:   # correct
if result == None:   # works but triggers linter warnings
```

## vs other languages

| Feature | Python | Java/C# | JS/TS |
|---|---|---|---|
| Type system | Dynamic, optional hints | Static, enforced | Dynamic (JS) / Static (TS) |
| Null | `None` | `null` / `null` | `null` / `undefined` |
| Integer size | Arbitrary precision | Fixed (int, long) | IEEE 754 double |
| String interpolation | f-strings | String.format / interpolated strings | template literals |
| Type check | `isinstance()` | `instanceof` | `typeof` / `instanceof` |

Python integers have **arbitrary precision** — no overflow. `2 ** 1000` is a valid int. Booleans in Python are a subclass of `int`: `True == 1` and `False == 0`.

## The task

Implement three functions:

- `type_label(value: object) -> str` — returns the name of the type as a string (e.g. `"int"`, `"str"`, `"NoneType"`)
- `clamp(value: float, low: float, high: float) -> float` — returns `value` clamped to `[low, high]`
- `first_number(text: str) -> int | None` — extracts the first integer from a string using a regex; returns `None` if none found. Use the walrus operator in your implementation.
