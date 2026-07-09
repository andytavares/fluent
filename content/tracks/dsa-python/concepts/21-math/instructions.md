# Math

## What you'll learn

Integer arithmetic as an interview topic: pulling a number apart digit by digit without converting it to a string, propagating carries through a digit array, binary-searching a numeric answer space (integer square root), and binary exponentiation. These techniques appear standalone and as building blocks inside bigger problems — fast pow powers matrix exponentiation, digit extraction powers base-conversion and checksum problems. The binary search here reuses the "search on the answer" idea you'll formalize in the Binary Search concept. Throughout, Python's `//` and `%` have a specific behavior — floor division toward negative infinity — that you have to account for the moment negative numbers enter the picture.

## Key concepts

### Digit manipulation — no strings required

`x % 10` reads the last decimal digit; `x // 10` drops it (for non-negative `x`, floor division is the same as truncation). Repeating both walks the number right to left. To *build* a number from digits left to right, multiply-and-add:

```python
rev, n = 0, x          # x >= 0
while n > 0:
    rev = rev * 10 + n % 10   # append n's last digit to rev
    n //= 10                   # drop it from n
# rev is x with its digits reversed
```

Converting to a string also works, but it allocates, and the interviewer's real question is whether you can do the arithmetic. Digit loops run in O(log₁₀ x) — the number of digits.

### `//` floors toward negative infinity — this is not the same as truncation

For non-negative operands, `//` and truncating division agree. They diverge the moment either operand is negative: `-7 // 2` is `-4`, not `-3` — Python rounds *down* (toward −∞), not toward zero. `%` is defined to match: `-7 % 2` is `1` (always same sign as the divisor), not `-1`. This is the single biggest source of off-by-one bugs porting arithmetic code from a language that truncates (C, Java, JavaScript's `Math.trunc`). The fix in every algorithm below is the same: **keep the value non-negative before you divide**, by handling sign once up front (as `my_pow` does) rather than repeatedly inside a loop.

```python
-7 // 2    # -4  (floors down, not toward zero)
-7 % 2     # 1   (sign follows the divisor)
7 // -2    # -4
```

### Half reversal — palindrome check without full reversal

To test whether a number reads the same both ways, you don't need to reverse all of it: reverse digits from the back **until the reversed part catches up with what's left**. At that point the front half sits in `x` and the reversed back half sits in `rev`:

```python
# requires the guards below: x >= 0 and (x % 10 != 0 or x == 0)
rev = 0
while x > rev:
    rev = rev * 10 + x % 10
    x //= 10
return x == rev or x == rev // 10   # even / odd digit count
```

Odd digit counts leave the middle digit at the end of `rev`; `rev // 10` discards it — a middle digit never breaks symmetry. Two guards make the loop condition sound: negatives are never palindromes (the sign reads on one side only — and would also make `//`/`%` floor unexpectedly), and a number ending in 0 (other than 0 itself) can't be one either — its reversal would need a leading zero.

### Carry propagation in a digit array

When a number is given as a list of digits (because it's too big for a numeric type, or the problem insists on the array representation), increment it the way you'd do it on paper — from the last digit, carrying nines:

```python
for i in range(len(digits) - 1, -1, -1):
    if digits[i] < 9:
        digits[i] += 1
        return digits          # carry absorbed — done
    digits[i] = 0               # 9 + 1 -> 0, carry on
return [1] + digits             # every digit was 9: 999 + 1 = 1000
```

The early return is the point: an increment only ripples through trailing 9s, so most calls touch one digit. (Python integers are arbitrary precision, so `int("".join(map(str, digits))) + 1` would technically work without overflow — unlike a fixed-width language — but the array-carry technique is what the problem is testing.)

### Binary search on the answer

Integer sqrt asks for the largest `m` with `m * m <= x`. The predicate `m * m <= x` is monotone in `m`, so binary-search the *answer space* `[1, x // 2]` rather than any array:

```python
if x < 2:
    return x
lo, hi = 1, x // 2
while lo <= hi:
    mid = lo + (hi - lo) // 2
    if mid * mid == x:
        return mid
    if mid * mid < x:
        lo = mid + 1
    else:
        hi = mid - 1
return hi   # hi is the last value whose square is <= x
```

Newton's method is the classic alternative: iterate `r = (r + x // r) // 2` from `r = x` until `r * r <= x`. It converges quadratically — a handful of iterations even for 2³¹ — and is worth mentioning as a follow-up. (`x` and `r` are non-negative throughout, so `//` behaves like truncation here — no floor-division surprises.)

### Binary exponentiation — x^n in O(log n)

Write `n` in binary: `x^13 = x^8 · x^4 · x^1` (13 = 1101₂). Square the base once per bit and multiply it into the result on 1-bits:

```python
if n < 0:
    x = 1 / x       # flip once, up front — n stays non-negative from here on
    n = -n
result = 1
while n > 0:
    if n % 2 == 1:   # this bit is set
        result *= x
    x *= x            # next bit's base
    n //= 2
return result
```

31 iterations cover any 32-bit exponent — a naive loop would take two billion. **Flip the sign of `n` before the loop, not inside it.** If you tried to halve a negative `n` directly with `n //= 2`, floor division rounds toward −∞ (more negative each step, converging to −1 forever, not to 0) instead of toward zero — the loop would never terminate the way a truncating halving would. Making `n` non-negative up front sidesteps the whole issue: every `n //= 2` afterward is ordinary truncating division.

### Legendre's formula — counting a prime factor in n!

Trailing zeros of `n!` are factors of 10 = 2·5, and 2s vastly outnumber 5s, so count the 5s. Every 5th number contributes one 5, every 25th contributes a second, every 125th a third…

```python
count = 0
p = 5
while p <= n:
    count += n // p
    p *= 5
```

Never compute `n!` itself — Python won't overflow (arbitrary precision), but for large `n` the factorial is enormous and computing it is far slower than the O(log₅ n) formula.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Palindrome Number | O(log₁₀ x) | O(1) | half reversal |
| Plus One | O(n) | O(n) output | carry propagation |
| Sqrt(x) | O(log x) | O(1) | binary search on the answer |
| Pow(x, n) | O(log \|n\|) | O(1) | binary exponentiation |

## Watch out

- **`//` floors toward negative infinity, not toward zero.** `-7 // 2 == -4`. Whenever a value entering a division might be negative, either guard it out first (palindrome: reject negatives before dividing) or normalize the sign once up front (pow: flip `n` before the loop) — never divide a possibly-negative value repeatedly and assume it behaves like truncation.
- **Palindrome guards.** `-121` is not a palindrome, and neither is `10` — but `0` is. Both guards must come before the half-reversal loop, or the loop's stopping condition lies to you.
- **Negate the exponent once, before the loop, in `my_pow`.** Handling the sign inside the squaring loop double-applies it, and repeatedly floor-dividing a negative `n` never reaches 0 the way truncating division would.
- **Plus One: never round-trip through a fixed-width type mentally** — Python `int` won't overflow, but the exercise is the array-carry technique, not `int(''.join(...)) + 1`.
- **Sqrt returns `hi`, not `lo`,** after a `lo <= hi` loop — `hi` ends on the last value whose square is ≤ x.
- **Trailing zeroes: count 5s, not zeros.** Computing `n!` and inspecting it is unnecessary and slow for large `n`, even though Python can represent the (huge) exact value.

## Problem walkthroughs

### Palindrome Number ★

**Problem.** Given an integer `x`, return `True` if its decimal digits read the same forwards and backwards. Solve it arithmetically — no string conversion.

**Example.**

    121  → True
    -121 → False   (reads 121- backwards)
    10   → False   (01 would need a leading zero)

**Steps.**
1. Guard: return `False` if `x < 0`, or if `x % 10 == 0 and x != 0`.
2. Reverse from the back while `x > rev`: `rev = rev * 10 + x % 10`, then `x //= 10`. The loop stops as soon as `rev` has at least as many digits as `x` — you've reversed the back half.
3. Even digit count: the halves must match exactly (`x == rev`). Odd: the middle digit sits at the end of `rev` and belongs to neither half — compare `x == rev // 10`.
4. Why the guards matter: without them, `10` reverses to `1` and the odd-length branch reports a false match. With them, the loop condition `x > rev` is a correct "half consumed" test, and you never divide a negative `x`.

**Complexity.** O(log₁₀ x) time / O(1) space — one digit per iteration, half the digits total.

### Plus One ★

**Problem.** `digits` is a non-empty big-endian list of decimal digits representing a non-negative integer with no leading zeros (except the number 0 itself). Return the digit list of that integer plus one.

**Example.**

    [1,2,3] → [1,2,4]
    [9,9,9] → [1,0,0,0]

**Steps.**
1. Walk `i` from the last index toward the front.
2. If `digits[i] < 9`, increment it and return — the carry is absorbed and nothing to the left changes.
3. Otherwise the digit is 9: set it to 0 and continue left (carry propagates).
4. If the loop finishes, every digit was 9 — prepend a 1 (`[1, 0, 0, ..., 0]`).
5. This is a digit-array exercise, not a numeric-precision one in Python — but the array-walk technique is what generalizes to fixed-width languages and to bignum arithmetic in general.

**Complexity.** O(n) worst case (all nines) / O(1) extra beyond the returned list; typical calls touch one digit.

### Factorial Trailing Zeroes

**Problem.** Given `n >= 0`, return the number of trailing zeros in `n!` — without computing `n!`.

**Example.**

    5  → 1    (5! = 120)
    25 → 6
    0  → 0

**Steps.**
1. A trailing zero is a factor of 10 = 2 × 5. In `1..n` the factor 2 appears far more often than 5, so the count of 5s decides.
2. Legendre's formula: multiples of 5 each contribute one 5, multiples of 25 contribute a second, 125 a third, and so on.
3. Loop `p = 5; while p <= n: p *= 5`, accumulating `n // p`.
4. The insight: you're counting *factors in a product* — a question about `n!` answered with O(log n) divisions and no factorial anywhere, which matters even in Python where the factorial itself wouldn't overflow but would be needlessly slow to compute for large `n`.

**Complexity.** O(log₅ n) time / O(1) space.

### Sqrt(x) ★

**Problem.** Given a non-negative integer `x`, return `⌊√x⌋` — the integer square root, rounded down. Library square-root functions are off-limits.

**Example.**

    4 → 2
    8 → 2    (√8 ≈ 2.83, floored)

**Steps.**
1. `x < 2` returns `x` (covers 0 and 1, and lets the search start at `lo = 1`).
2. Binary search `[1, x // 2]` — for `x >= 2`, `⌊√x⌋` never exceeds `x // 2`.
3. If `mid * mid == x`, return `mid`. If less, the answer is `mid` or bigger: `lo = mid + 1`. If more, `hi = mid - 1`.
4. When the loop exits, `hi` is the largest value whose square is ≤ x — return `hi`.
5. Alternative: Newton's method on `f(r) = r² − x`: iterate `r = (r + x // r) // 2` from `r = x` while `r * r > x`. Quadratic convergence — a handful of steps. Both `x` and `r` stay non-negative throughout, so `//` matches truncation here.

**Complexity.** O(log x) time / O(1) space for both approaches.

### Pow(x, n) ★

**Problem.** Implement `x` raised to the integer power `n`, where `n` may be negative and as large as 32 bits allow. The `**` operator and `math.pow` are off-limits; the naive O(n) multiplication loop is too slow for `n` near 2³¹.

**Example.**

    x = 2,   n = 10 → 1024
    x = 2,   n = -2 → 0.25

**Steps.**
1. Negative exponent: `x^(−n) = (1/x)^n`. Set `x = 1 / x; n = -n` once, before anything else — this is also what keeps every later `n //= 2` behaving like truncation instead of floor-toward-negative-infinity.
2. Loop while `n > 0` with an accumulator `result = 1`: when `n` is odd (`n % 2 == 1`), multiply `result *= x`; every iteration, square `x *= x` and halve `n //= 2`.
3. Each iteration processes one binary digit of `n`: `x` holds `x^(2^i)` at step `i`, and `result` collects exactly the powers whose bits are set.
4. Convention: `n == 0` returns 1, including `0^0 → 1`.

**Complexity.** O(log |n|) time / O(1) space — at most 32 squarings for any 32-bit exponent.

### Max Points on a Line

**Problem.** Given `points`, a list of `[x, y]` integer coordinates (all distinct), return the maximum number of points lying on one straight line.

**Example.**

    [[1,1],[2,2],[3,3]]                     → 3
    [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]   → 4

**Steps.**
1. `n <= 2` → every pair is collinear; return `n`.
2. Any best line passes through *some* point, so anchor each point `i` in turn and ask: among lines through `i`, which direction is most popular?
3. For each other point `j`, compute `dy = yj - yi`, `dx = xj - xi`. Hashing the float `dy / dx` is a precision bug — reduce the pair by `g = gcd(dy, dx)` and normalize the sign (e.g. force `dx > 0`; for verticals use the canonical key `(1, 0)`), then key a `dict` on `(dy // g, dx // g)`.
4. The largest bucket for anchor `i`, plus 1 for the anchor itself, is `i`'s best line. Take the max over all anchors.
5. The anchoring trick turns "check every triple" O(n³) into "hash every pair per anchor" O(n²).

**Complexity.** O(n²) time / O(n) space per anchor for the direction map.

## Interview follow-ups

After Palindrome Number:
- "Why reverse only half?" — the half reversal never risks the numeric-range issues a full reversal could hit in a fixed-width language, and it's simply less work.
- "Palindrome linked list?" — same idea, different tools: fast/slow pointers to the middle, reverse one half, compare.

After Pow:
- "Recursive version?" — `pow(x, n) = pow(x*x, n // 2)` times `x` when odd; same O(log n), plus O(log n) stack.
- "Where else does fast exponentiation appear?" — modular exponentiation in RSA/Diffie–Hellman, and matrix exponentiation (Fibonacci in O(log n)).

After Sqrt:
- "Newton vs binary search?" — Newton converges quadratically (digits of accuracy double per step); binary search gains one bit per step. Both are O(log x); Newton wins by a constant factor.

After Factorial Trailing Zeroes:
- "Why not count 2s too?" — every second number is even; 5s are strictly scarcer, so `min(#2s, #5s) = #5s`.

## The task

Four arithmetic classics. Each must hit the stated complexity — the naive alternative (string conversion, O(n) multiplication loops, library shortcuts) is exactly what's being screened out.

### `is_palindrome_number(x)`

Return `True` if the integer `x` reads the same forwards and backwards in decimal. **String conversion is forbidden** — no `str(x)`, no slicing, no f-strings; solve it with `% 10` and `// 10` (reversing only the back half is the clean way). Negative numbers are never palindromes. Numbers ending in 0 are never palindromes — except `0` itself, which is one. O(log₁₀ x) time, O(1) space.

```python
is_palindrome_number(121)   # True
is_palindrome_number(-121)  # False
is_palindrome_number(10)    # False
is_palindrome_number(0)     # True
```

Edge cases: single-digit numbers (all palindromes), even vs odd digit counts (`1221` and `12321` are both palindromes), `1000021` (false — don't let trailing/leading digit mismatches slip through).

### `plus_one(digits)`

`digits` is a non-empty big-endian list of decimal digits (`0`–`9`) representing a non-negative integer with no leading zeros (except the number 0 as `[0]`). Return the digit list of that integer plus one. Work digit-by-digit from the back. O(n) time.

```python
plus_one([1, 2, 3])   # [1, 2, 4]
plus_one([9])         # [1, 0]
plus_one([9, 9, 9])   # [1, 0, 0, 0]
plus_one([0])         # [1]
```

Edge cases: no carry at all (last digit < 9), carry through several trailing 9s (`[8, 9, 9]` → `[9, 0, 0]`), all nines (result grows one digit), lists with dozens of digits.

### `my_sqrt(x)`

Return `⌊√x⌋` for a non-negative integer `x` — the largest integer `m` with `m * m <= x`. **`math.sqrt`, `math.pow`, and `**` are forbidden**; binary-search the answer space (or use Newton's method). O(log x) time.

```python
my_sqrt(4)           # 2
my_sqrt(8)           # 2
my_sqrt(0)           # 0
my_sqrt(2147395599)  # 46339
```

Edge cases: `0` and `1` (return themselves), perfect squares vs one-below-a-perfect-square (`15` → 3, `16` → 4), values near 2³¹ (`2147483647` → 46340).

### `my_pow(x, n)`

Return `x` raised to the integer power `n`. `x` is a float; `n` is an integer that may be negative, with magnitude up to 2³¹. **`math.pow` and `**` are forbidden**, and the solution must run in O(log |n|) time — binary exponentiation, not a multiplication loop. Handle the negative exponent by inverting the base once up front. `my_pow(anything, 0)` is `1`.

```python
my_pow(2, 10)   # 1024
my_pow(2.1, 3)  # 9.261
my_pow(2, -2)   # 0.25
my_pow(-2, 3)   # -8
```

Edge cases: `n == 0` (returns 1, even for `x = 0`), negative base with even vs odd exponent, `x = 0` with positive `n` (returns 0), `n = ±(2³¹ − 1)` scale exponents (must finish instantly), tiny results that underflow toward 0 (fine — return what the arithmetic gives).
