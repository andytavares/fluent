import math
from stub import is_palindrome_number, plus_one, my_sqrt, my_pow

passed = 0
failed = 0


def test(name: str, condition: bool, detail: str = "") -> None:
    global passed, failed
    if condition:
        print(f"  PASS: {name}")
        passed += 1
    else:
        msg = f" — {detail}" if detail else ""
        print(f"  FAIL: {name}{msg}")
        failed += 1


def close(actual, expected, tol_factor=1e-9) -> bool:
    if not isinstance(actual, (int, float)):
        return False
    tol = tol_factor * max(1, abs(expected))
    return abs(actual - expected) <= tol


# ── is_palindrome_number ──
r = is_palindrome_number(121)
test("is_palindrome_number: classic palindrome", r is True, f"got {r}")

r = is_palindrome_number(-121)
test("is_palindrome_number: negative is never a palindrome", r is False, f"got {r}")

r = is_palindrome_number(10)
test("is_palindrome_number: trailing zero", r is False, f"got {r}")

r = is_palindrome_number(0)
test("is_palindrome_number: zero", r is True, f"got {r}")

r = is_palindrome_number(7)
test("is_palindrome_number: single digit", r is True, f"got {r}")

r = is_palindrome_number(1221)
test("is_palindrome_number: even digit count", r is True, f"got {r}")

r = is_palindrome_number(12321)
test("is_palindrome_number: odd digit count", r is True, f"got {r}")

r = is_palindrome_number(123)
test("is_palindrome_number: not a palindrome", r is False, f"got {r}")

r = is_palindrome_number(1000021)
test("is_palindrome_number: near-palindrome with inner zeros", r is False, f"got {r}")

r = is_palindrome_number(1000000001)
test("is_palindrome_number: 10-digit palindrome", r is True, f"got {r}")

r = is_palindrome_number(2147447412)
test("is_palindrome_number: large even-length palindrome", r is True, f"got {r}")

r = is_palindrome_number(1234567899)
test("is_palindrome_number: large non-palindrome", r is False, f"got {r}")

r = is_palindrome_number(-7)
test("is_palindrome_number: negative single digit", r is False, f"got {r}")

# ── plus_one ──
r = plus_one([1, 2, 3])
test("plus_one: no carry", r == [1, 2, 4], f"got {r}")

r = plus_one([4, 3, 2, 1])
test("plus_one: last digit below nine", r == [4, 3, 2, 2], f"got {r}")

r = plus_one([9])
test("plus_one: single nine grows", r == [1, 0], f"got {r}")

r = plus_one([9, 9, 9])
test("plus_one: all nines grow by one digit", r == [1, 0, 0, 0], f"got {r}")

r = plus_one([0])
test("plus_one: zero", r == [1], f"got {r}")

r = plus_one([8, 9, 9])
test("plus_one: carry through trailing nines", r == [9, 0, 0], f"got {r}")

r = plus_one([1, 9])
test("plus_one: carry stops after one digit", r == [2, 0], f"got {r}")

twenty_nines = [9] * 20
expected = [1] + [0] * 20
r = plus_one(twenty_nines)
test("plus_one: 20 digits", r == expected, f"got {r}")

digits = [5] + [9] * 39
expected = [6] + [0] * 39
r = plus_one(digits)
test("plus_one: 40-digit number with a mid-array carry stop", r == expected, f"got {r}")

# ── my_sqrt ──
r = my_sqrt(4)
test("my_sqrt: perfect square", r == 2, f"got {r}")

r = my_sqrt(8)
test("my_sqrt: rounds down", r == 2, f"got {r}")

r = my_sqrt(0)
test("my_sqrt: zero", r == 0, f"got {r}")

r = my_sqrt(1)
test("my_sqrt: one", r == 1, f"got {r}")

r = my_sqrt(2)
test("my_sqrt: two", r == 1, f"got {r}")

r = my_sqrt(15)
test("my_sqrt: one below a perfect square", r == 3, f"got {r}")

r = my_sqrt(16)
test("my_sqrt: exactly a perfect square boundary", r == 4, f"got {r}")

r = my_sqrt(2147395599)
test("my_sqrt: large non-square near 2^31", r == 46339, f"got {r}")

r = my_sqrt(2147483647)
test("my_sqrt: max 32-bit int", r == 46340, f"got {r}")

all_match = True
mismatch = ""
for x in range(0, 2001):
    expected = math.isqrt(x)
    got = my_sqrt(x)
    if got != expected:
        all_match = False
        mismatch = f"my_sqrt({x}) should be {expected}, got {got}"
        break
test("my_sqrt: exhaustive sweep 0..2000", all_match, mismatch)

all_match = True
mismatch = ""
for root in (1000, 4321, 46340):
    checks = [(root * root, root), (root * root - 1, root - 1), (root * root + 1, root)]
    for x, expected in checks:
        got = my_sqrt(x)
        if got != expected:
            all_match = False
            mismatch = f"my_sqrt({x}) should be {expected}, got {got}"
            break
    if not all_match:
        break
test("my_sqrt: squares and off-by-ones of large roots", all_match, mismatch)

# ── my_pow ──
r = my_pow(2, 10)
test("my_pow: integer base, positive exponent", close(r, 1024), f"got {r}")

r = my_pow(3, 4)
test("my_pow: another exact power", close(r, 81), f"got {r}")

r = my_pow(2.1, 3)
test("my_pow: float base", close(r, 9.261), f"got {r}")

r = my_pow(2, -2)
test("my_pow: negative exponent", close(r, 0.25), f"got {r}")

r = my_pow(5, 0)
test("my_pow: exponent zero", close(r, 1), f"got {r}")

r = my_pow(0, 0)
test("my_pow: zero to the zero is one by convention", close(r, 1), f"got {r}")

r = my_pow(0, 5)
test("my_pow: zero base, positive exponent", close(r, 0), f"got {r}")

r = my_pow(-2, 3)
test("my_pow: negative base, odd exponent", close(r, -8), f"got {r}")

r = my_pow(-2, 4)
test("my_pow: negative base, even exponent", close(r, 16), f"got {r}")

r = my_pow(1, 2147483647)
test("my_pow: base one with a huge exponent (must be O(log n))", close(r, 1), f"got {r}")

r = my_pow(2, -2147483648)
test("my_pow: huge negative exponent underflows to zero", close(r, 0), f"got {r}")

expected = 1.0000000001 ** 2147483647
r = my_pow(1.0000000001, 2147483647)
test("my_pow: near-one base with a huge exponent (O(n) loops time out)", close(r, expected, 1e-6), f"got {r}")

r = my_pow(0.5, -10)
test("my_pow: fractional base, deep negative exponent", close(r, 1024), f"got {r}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
