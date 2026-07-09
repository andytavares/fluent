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

## Watch out

- Defining `__eq__` without `__hash__` makes instances **unhashable** — Python sets `__hash__` to `None` automatically whenever you override `__eq__`. Define `__hash__` explicitly (or accept the object can't go in a `set`/dict key) if equality is based on value.
- Mutable class-level attributes (`class Foo: items = []`) are shared by every instance, the same trap as mutable default arguments. Initialize mutable state in `__init__`, not as a class attribute.
- A `@property` with no setter makes the attribute genuinely read-only from outside the class — assigning to it raises `AttributeError`, not a silent no-op.
- `__repr__` should not have side effects and should stay cheap — debuggers, loggers, and REPLs call it constantly and unpredictably.

## The task

Implement a `BankAccount` class that exercises constructors, properties, class methods, and dunder methods.

- **`__init__(self, owner: str, balance: float = 0.0)`** — stores `owner` and `balance`.
- **`deposit(self, amount: float) -> None`** — adds `amount` to the balance. Raises `ValueError` if `amount <= 0`.
- **`withdraw(self, amount: float) -> None`** — subtracts `amount` from the balance. Raises `ValueError` if `amount <= 0`, or if `amount` exceeds the current balance (no overdrafts).
- **`balance`** (read-only `@property`) — returns the current balance. Assigning to `account.balance` must raise `AttributeError` — there is no setter.
- **`zero(cls, owner: str) -> "BankAccount"`** (`@classmethod`) — factory that returns a new `BankAccount` for `owner` with a balance of `0.0`.
- **`__repr__(self) -> str`** — returns `"BankAccount(owner='<owner>', balance=<balance>)"` with the balance formatted to exactly two decimal places.

```python
acct = BankAccount("Alice", 100.0)
acct.deposit(50)
acct.withdraw(30)
repr(acct)          # "BankAccount(owner='Alice', balance=120.00)"
acct.balance        # 120.0

acct.deposit(0)      # raises ValueError
acct.withdraw(-5)    # raises ValueError
acct.withdraw(9999)  # raises ValueError — insufficient funds

empty = BankAccount.zero("Bob")
repr(empty)          # "BankAccount(owner='Bob', balance=0.00)"

acct.balance = 999   # raises AttributeError — balance has no setter
```
