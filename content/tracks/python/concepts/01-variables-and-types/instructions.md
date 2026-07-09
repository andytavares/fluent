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

## Watch out

- `==` vs `is`: `==` compares values; `is` compares identity. Never use `is` for value comparison except with singletons (`None`, `True`, `False`) — `x is 256` can be `True` by accident (CPython caches small ints -5..256) and `False` for larger ones. That's an implementation detail, not a guarantee.
- Chained comparisons are real Python, not a typo: `0 < x < 10` is `(0 < x) and (x < 10)`, evaluated left to right with `x` computed once.
- The walrus operator's binding leaks into the enclosing scope, not just the `if`/`while` block — `if (n := len(items)) > 5: ...` leaves `n` accessible afterward, same as a regular assignment.
- Float equality is approximate: `0.1 + 0.2 == 0.3` is `False`. Compare with a tolerance (`abs(a - b) < 1e-9`) or use `decimal`/`fractions` for exact arithmetic.

## The task

Implement three standalone functions.

**`type_label(value: object) -> str`** — returns the name of `value`'s type as a string, exactly as `type(value).__name__` would produce it.

```python
type_label(42)        # "int"
type_label("hello")   # "str"
type_label(3.14)      # "float"
type_label(True)      # "bool" — bool is its own type, distinct from int here
type_label(None)      # "NoneType"
type_label([])        # "list"
```

**`clamp(value: float, low: float, high: float) -> float`** — returns `value` restricted to the closed interval `[low, high]`: unchanged if already inside the range, `low` if below it, `high` if above it. Assume `low <= high`.

```python
clamp(15, 0, 10)     # 10   — above high, clamped down
clamp(-5, 0, 10)     # 0    — below low, clamped up
clamp(5, 0, 10)      # 5    — already in range, unchanged
clamp(0, 0, 10)      # 0    — exactly at low
clamp(1.5, 1.0, 2.0) # 1.5
```

**`first_number(text: str) -> int | None`** — extracts the first run of digits (optionally preceded by a `-`) from `text` and returns it as an `int`. Returns `None` if no digits appear anywhere in the string. Implement it using a regex (`re.search`) combined with the walrus operator (`:=`) so the match is captured in a single expression.

```python
first_number("foo 42 bar")       # 42
first_number("temp -7 celsius")  # -7   — leading minus sign is part of the number
first_number("99 bottles")       # 99
first_number("no digits here")   # None
first_number("")                 # None
```
