# Classes & Objects

## What you'll learn

Python's class system — `__init__`, `@classmethod`, `@staticmethod`, `@property`, and the dunder (double-underscore) methods that make objects behave like built-in types.

## Key concepts

**Basic class:**
```python
class Circle:
    def __init__(self, radius: float) -> None:
        self._radius = radius   # convention: _ prefix = "private"

    @property
    def radius(self) -> float:
        return self._radius

    @radius.setter
    def radius(self, value: float) -> None:
        if value < 0:
            raise ValueError("radius must be non-negative")
        self._radius = value

    @property
    def area(self) -> float:
        import math
        return math.pi * self._radius ** 2
```

**`@classmethod` vs `@staticmethod`:**
```python
class Temperature:
    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f: float) -> "Temperature":
        return cls((f - 32) * 5 / 9)   # factory — has access to cls

    @staticmethod
    def is_valid(celsius: float) -> bool:
        return celsius >= -273.15       # no self or cls — pure utility
```

**Dunder methods:**
```python
class Vector:
    def __init__(self, x: float, y: float) -> None:
        self.x, self.y = x, y

    def __repr__(self) -> str:
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __abs__(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5
```

**`__repr__` vs `__str__`:** `__repr__` is for developers (should be unambiguous, ideally `eval`-able). `__str__` is for end users. `print()` calls `__str__`; the REPL and `repr()` call `__repr__`. If you only define one, define `__repr__`.

**Dataclasses (3.7+):**
```python
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float
    tags: list[str] = field(default_factory=list)
```
`@dataclass` auto-generates `__init__`, `__repr__`, and `__eq__` from field annotations.

## vs other languages

| Feature | Python | Java | C++ | JS |
|---|---|---|---|---|
| Constructor | `__init__` | constructor method | constructor | `constructor` |
| Factory | `@classmethod` | static factory | static factory | static method |
| Properties | `@property` | getters/setters | getters/setters | `get`/`set` |
| Operator overloading | dunder methods | No (except equals) | Yes | No |
| Privacy | Convention (`_`, `__`) | `private` keyword | `private` keyword | `#` private fields |

Python has no true access control — `_name` is a convention for "internal use", `__name` triggers name-mangling to `_ClassName__name`, but it's still accessible. The community relies on convention, not enforcement.

## The task

Implement a `BankAccount` class with:

- `__init__(self, owner: str, balance: float = 0.0)` — stores `owner` and `balance`
- `deposit(self, amount: float) -> None` — adds `amount`; raises `ValueError` if `amount <= 0`
- `withdraw(self, amount: float) -> None` — subtracts `amount`; raises `ValueError` if `amount <= 0` or would make balance negative
- `@property balance` — read-only access to the current balance
- `@classmethod zero(cls, owner: str) -> "BankAccount"` — factory that returns an account with zero balance
- `__repr__(self) -> str` — returns `"BankAccount(owner='Alice', balance=100.00)"`
