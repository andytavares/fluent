class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0) -> None:
        self._owner = owner
        self._balance = balance

    @property
    def balance(self) -> float:
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError(f"deposit amount must be positive, got {amount}")
        self._balance += amount

    def withdraw(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError(f"withdrawal amount must be positive, got {amount}")
        if amount > self._balance:
            raise ValueError(f"insufficient funds: balance {self._balance}, requested {amount}")
        self._balance -= amount

    @classmethod
    def zero(cls, owner: str) -> "BankAccount":
        return cls(owner, 0.0)

    def __repr__(self) -> str:
        return f"BankAccount(owner={self._owner!r}, balance={self._balance:.2f})"
