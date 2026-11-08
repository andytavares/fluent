## What you build

You write a `BankAccount` class with a constructor, a read-only property, a class method and `__repr__`. This lesson builds on **Lists & Dicts**.

## Key concepts

### `__init__` sets up a new object

Python calls `__init__` after it creates the object. `self` is the new object. A leading `_` on a name marks it as internal, by convention only.

```python
class Circle:
    def __init__(self, radius: float):
        # _ prefix: "private" by convention
        self._radius = radius
```

### `@property` turns a method into an attribute

A property runs a method when you read the attribute. A `.setter` runs a method when you assign to it, so you can validate the value. Java and C++ use getter and setter methods for this.

```python
import math

class Circle:
    def __init__(self, radius: float):
        self._radius = radius

    @property
    def radius(self) -> float:
        return self._radius

    @radius.setter
    def radius(self, value: float):
        if value < 0:
            raise ValueError("radius < 0")
        self._radius = value

    @property
    def area(self) -> float:
        return math.pi * self._radius ** 2
```

### `@classmethod` gets the class, and `@staticmethod` gets nothing

A class method receives the class as `cls`. Use it for factory methods. A static method receives no `self` and no `cls`. It is a plain utility function inside the class.

```python
class Temperature:
    def __init__(self, celsius: float):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f: float):
        # Factory: has access to cls
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def is_valid(celsius: float) -> bool:
        return celsius >= -273.15
```

### Dunder methods make objects act like built-in types

A dunder (double underscore) method hooks into Python syntax. `__add__` runs for `+`, `__eq__` for `==` and `__abs__` for `abs()`.

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self) -> str:
        x, y = self.x, self.y
        return f"Vector({x}, {y})"

    def __add__(self, other):
        return Vector(self.x + other.x,
                      self.y + other.y)

    def __eq__(self, other) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return (self.x == other.x
                and self.y == other.y)

    def __abs__(self) -> float:
        return (self.x**2
                + self.y**2) ** 0.5
```

### `__repr__` is for developers, and `__str__` is for users

`__repr__` must be unambiguous. If possible, `eval()` of its output rebuilds the object. `print()` calls `__str__`, and the REPL and `repr()` call `__repr__`. If you define only one, define `__repr__`.

```python
v = Vector(1, 2)
repr(v)  # 'Vector(1, 2)'
# No __str__, so print uses __repr__
print(v)  # Vector(1, 2)
```

### `@dataclass` writes the boilerplate

`@dataclass` (Python 3.7 or later) generates `__init__`, `__repr__` and `__eq__` from the field annotations. Use `field(default_factory=list)` for a mutable default.

```python
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float
    tags: list[str] = field(
        default_factory=list
    )
```

### Python has no true access control

`_name` means "internal use". `__name` triggers name mangling to `_ClassName__name`, but code outside the class can still read it. The community relies on convention, not enforcement.

```python
class Account:
    def __init__(self):
        self.__pin = 1234

Account()._Account__pin  # 1234
```

## Watch out

- If you define `__eq__` without `__hash__`, Python sets `__hash__` to `None`. The object then cannot go in a `set` or be a dict key.
- For value-based equality in a set or dict, define `__hash__` too.
- A mutable class attribute, such as `items = []`, is one list for every instance. Create mutable state in `__init__`.
- Assignment to a `@property` with no setter raises `AttributeError`. It does not fail silently.
- Keep `__repr__` cheap and free of side effects. Debuggers, loggers and the REPL call it often.

## The task

Write a `BankAccount` class in `stub.py`. It uses a constructor, a property, a class method and a dunder method.

1. `__init__(self, owner: str, balance: float = 0.0)` stores `owner` and `balance`.
2. `deposit(self, amount: float) -> None` adds `amount` to the balance.
3. `deposit` raises `ValueError` if `amount <= 0`.
4. `withdraw(self, amount: float) -> None` subtracts `amount` from the balance.
5. `withdraw` raises `ValueError` if `amount <= 0`.
6. `withdraw` raises `ValueError` if `amount` is more than the balance. The account has no overdraft.
7. `balance` is a read-only `@property` that returns the current balance.
8. `balance` has no setter, so assignment to it raises `AttributeError`.
9. `zero(cls, owner: str) -> "BankAccount"` is a `@classmethod`. It returns a new account for `owner` with balance `0.0`.
10. `__repr__(self) -> str` returns `BankAccount(owner='<owner>', balance=<balance>)`. The balance has exactly two decimal places.

```python
BankAccount("Alice").balance        # 0.0
BankAccount("Alice", 50.0).balance  # 50.0

a = BankAccount("Alice", 100.0)
repr(a)
# "BankAccount(owner='Alice', balance=100.00)"
a.deposit(50.0)
a.balance  # 150.0

b = BankAccount("Bob", 200.0)
b.withdraw(75.0)
b.balance  # 125.0

BankAccount("A").deposit(0)  # ValueError
BankAccount("A").deposit(-10)
# ValueError
c = BankAccount("A", 100)
c.withdraw(0)   # ValueError
c.withdraw(-5)  # ValueError
BankAccount("A", 10).withdraw(20)
# ValueError: insufficient funds

BankAccount.zero("Carol").balance  # 0.0
repr(BankAccount.zero("Bob"))
# "BankAccount(owner='Bob', balance=0.00)"

a.balance = 999.0  # AttributeError
```
