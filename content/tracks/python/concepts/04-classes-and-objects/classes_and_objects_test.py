import sys
from stub import BankAccount

passed = 0
failed = 0


def assert_eq(actual, expected):
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


def assert_close(actual, expected, tol=1e-9):
    assert abs(actual - expected) < tol, f"expected ~{expected}, got {actual}"


def assert_raises(exc_type, fn):
    try:
        fn()
        raise AssertionError(f"expected {exc_type.__name__} but no exception was raised")
    except exc_type:
        pass


def test(name: str, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS: {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL: {name} — {e}")
        failed += 1


def check_deposit():
    a = BankAccount("Alice", 100.0)
    a.deposit(50.0)
    assert_close(a.balance, 150.0)


def check_withdraw():
    a = BankAccount("Bob", 200.0)
    a.withdraw(75.0)
    assert_close(a.balance, 125.0)


def check_balance_readonly():
    a = BankAccount("Alice", 100.0)
    try:
        a.balance = 999.0
        raise AssertionError("expected AttributeError but none raised")
    except AttributeError:
        pass


# init and balance
test("init: default balance",  lambda: assert_close(BankAccount("Alice").balance, 0.0))
test("init: given balance",    lambda: assert_close(BankAccount("Alice", 50.0).balance, 50.0))

# deposit
test("deposit: increases balance", check_deposit)
test("deposit: zero raises",       lambda: assert_raises(ValueError, lambda: BankAccount("A").deposit(0)))
test("deposit: negative raises",   lambda: assert_raises(ValueError, lambda: BankAccount("A").deposit(-10)))

# withdraw
test("withdraw: decreases balance",         check_withdraw)
test("withdraw: zero raises",               lambda: assert_raises(ValueError, lambda: BankAccount("A", 100).withdraw(0)))
test("withdraw: negative raises",           lambda: assert_raises(ValueError, lambda: BankAccount("A", 100).withdraw(-5)))
test("withdraw: insufficient funds raises", lambda: assert_raises(
    ValueError, lambda: BankAccount("A", 10).withdraw(20)
))

# zero classmethod
test("zero: balance is 0",  lambda: assert_close(BankAccount.zero("Carol").balance, 0.0))
test("zero: correct type",  lambda: assert_eq(isinstance(BankAccount.zero("Carol"), BankAccount), True))

# __repr__
test("repr: format", lambda: assert_eq(
    repr(BankAccount("Alice", 100.0)),
    "BankAccount(owner='Alice', balance=100.00)"
))
test("repr: zero balance", lambda: assert_eq(
    repr(BankAccount.zero("Bob")),
    "BankAccount(owner='Bob', balance=0.00)"
))

# balance is read-only
test("balance: read-only property", check_balance_readonly)

print(f"\n{passed} passed, {failed} failed")
if failed:
    sys.exit(1)
