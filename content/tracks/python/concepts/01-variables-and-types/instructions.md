## What you build

You write three functions: `type_label`, `clamp` and `first_number`. They use Python's built-in types, type checks and the walrus operator.

## Key concepts

### A variable holds a reference, and the object holds the type

Python has dynamic typing. You do not declare a variable. The type belongs to the object, so one name can refer to objects of different types.

```python
x = 42       # int
x = "hello"  # now str, and legal
x = None     # NoneType: Python's null
```

### Type hints are not checked at run time

Type hints (PEP 484) are annotations only. Python does not enforce them. Tools such as mypy and pyright read them, and they help the reader.

```python
age: int = 30
price: float = 9.99
name: str = "Alice"
active: bool = True
nothing: None = None
```

### Integers have arbitrary precision

A Python `int` does not overflow, so `2 ** 1000` is a valid `int`. Java and C# use fixed-size integers, and JavaScript numbers are IEEE 754 doubles.

```python
2 ** 100
# 1267650600228229401496703205376
```

### `bool` is a subclass of `int`

`True` equals `1` and `False` equals `0`. `type()` still reports `bool`, not `int`.

```python
True == 1         # True
type(True)        # <class 'bool'>
isinstance(True, int)  # True
```

### f-strings format values inline

An f-string (Python 3.6 or later) puts expressions inside `{}`. A format spec follows a colon. The `=` form (Python 3.8 or later) prints the name and the value.

```python
user = "Alice"
score = 42
f"{user} scored {score:.1f} points"
# 'Alice scored 42.0 points'
print(f"{score=}")  # score=42
```

### `type()` gives the exact type, and `isinstance()` checks the family

`type()` returns the class of an object. `isinstance()` also accepts subclasses and a tuple of types.

```python
type(42)             # <class 'int'>
isinstance(42, int)  # True
# A tuple of types: True
isinstance(42, (int, float))
```

### The walrus operator assigns inside an expression

`:=` (Python 3.8 or later) assigns a value and returns it. Use it in an `if` or `while` condition, so you compute the value once.

```python
import re
if m := re.search(r"\d+", text):
    # m is bound here: no second call
    print(m.group())
```

### Compare with `None` by identity

Use `is None`. `== None` also works, but linters warn about it.

```python
if result is None:  # correct
    ...
```

## Watch out

- `==` compares values, and `is` compares identity. Use `is` only for `None`, `True` and `False`.
- CPython caches the small integers -5 to 256. So `x is 256` can be `True`, but larger values give `False`. Do not rely on it.
- `0 < x < 10` is a chained comparison, not a typo. It means `(0 < x) and (x < 10)`, and Python computes `x` once.
- The walrus binding stays in the enclosing scope after the `if` or `while` block. It acts like a normal assignment.
- `0.1 + 0.2 == 0.3` is `False`, because float math is approximate. Compare with a tolerance such as `abs(a - b) < 1e-9`.
- For exact arithmetic, use the `decimal` or `fractions` module.

## The task

Write three functions in `stub.py`.

1. `type_label(value: object) -> str` returns the name of the type of `value`. The result equals `type(value).__name__`.
2. `clamp(value: float, low: float, high: float) -> float` limits `value` to the closed range `[low, high]`.
3. `first_number(text: str) -> int | None` returns the first integer in `text`, or `None`.

Rules for `clamp`:

- A value below `low` returns `low`.
- A value above `high` returns `high`.
- A value inside the range, or on a bound, returns unchanged.
- You can assume `low <= high`.

Rules for `first_number`:

- An integer is a run of digits. An optional `-` directly before it makes it negative.
- Text with no digits returns `None`. An empty string returns `None`.
- Use `re.search` and the walrus operator (`:=`) to get the match in one expression.

`type_label(True)` returns `"bool"`, not `"int"`.

```python
type_label(42)       # "int"
type_label("hi")     # "str"
type_label(3.14)     # "float"
type_label(True)     # "bool"
type_label(None)     # "NoneType"
type_label([])       # "list"

clamp(-5, 0, 10)     # 0
clamp(15, 0, 10)     # 10
clamp(5, 0, 10)      # 5
clamp(0, 0, 10)      # 0
clamp(10, 0, 10)     # 10
clamp(1.5, 1.0, 2.0) # 1.5

first_number("foo 42 bar")       # 42
first_number("temp -7 celsius")  # -7
first_number("99 bottles")       # 99
first_number("no digits here")   # None
first_number("")                 # None
```
