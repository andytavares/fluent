class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0) -> None:
        # TODO: store owner and balance
        pass

    @property
    def balance(self) -> float:
        # TODO: return current balance
        return 0.0

    def deposit(self, amount: float) -> None:
        # TODO: add amount; raise ValueError if amount <= 0
        pass

    def withdraw(self, amount: float) -> None:
        # TODO: subtract amount; raise ValueError if amount <= 0 or insufficient funds
        pass

    @classmethod
    def zero(cls, owner: str) -> "BankAccount":
        # TODO: return a BankAccount with zero balance
        return cls(owner)

    def __repr__(self) -> str:
        # TODO: return "BankAccount(owner='Alice', balance=100.00)"
        return ""


if __name__ == "__main__":
    acct = BankAccount("Alice", 100.0)
    acct.deposit(50)
    acct.withdraw(30)
    print(acct)           # BankAccount(owner='Alice', balance=120.00)
    print(acct.balance)   # 120.0

    empty = BankAccount.zero("Bob")
    print(empty)          # BankAccount(owner='Bob', balance=0.00)
