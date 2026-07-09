# Math

## What you'll learn

Integer arithmetic as an interview topic: pulling a number apart digit by digit without converting it to a string, propagating carries through a digit array, binary-searching a numeric answer space (integer square root), and binary exponentiation. These techniques appear standalone and as building blocks inside bigger problems — fast pow powers matrix exponentiation, digit extraction powers base-conversion and checksum problems. The binary search here reuses the "search on the answer" idea you'll formalize in the Binary Search concept.

## Key concepts

### Digit manipulation — no strings required

`x % 10` reads the last decimal digit; `Math.trunc(x / 10)` drops it. Repeating both walks the number right to left. To *build* a number from digits left to right, multiply-and-add:

```ts
let rev = 0, n = x;          // x >= 0
while (n > 0) {
  rev = rev * 10 + (n % 10); // append n's last digit to rev
  n = Math.trunc(n / 10);    // drop it from n
}
// rev is x with its digits reversed
```

Converting to a string also works, but it allocates, and in fixed-width languages the interviewer's real question is whether you can do the arithmetic. Digit loops run in O(log₁₀ x) — the number of digits.

### Half reversal — palindrome check without full reversal

To test whether a number reads the same both ways, you don't need to reverse all of it: reverse digits from the back **until the reversed part catches up with what's left**. At that point the front half sits in `x` and the reversed back half sits in `rev`:

```ts
// requires the guards below: x >= 0 and (x % 10 !== 0 || x === 0)
let rev = 0;
while (x > rev) {
  rev = rev * 10 + (x % 10);
  x = Math.trunc(x / 10);
}
return x === rev || x === Math.trunc(rev / 10); // even / odd digit count
```

Odd digit counts leave the middle digit at the end of `rev`; `Math.trunc(rev / 10)` discards it — a middle digit never breaks symmetry. Two guards make the loop condition sound: negatives are never palindromes (the sign reads on one side only), and a number ending in 0 (other than 0 itself) can't be one either — its reversal would need a leading zero. In fixed-width languages half reversal also dodges overflow: the full reversal of a valid 32-bit int can exceed 32 bits, the half never does.

### Carry propagation in a digit array

When a number is given as an array of digits (because it's too big for a numeric type), increment it the way you'd do it on paper — from the last digit, carrying nines:

```ts
for (let i = digits.length - 1; i >= 0; i--) {
  if (digits[i] < 9) { digits[i]++; return digits; } // carry absorbed — done
  digits[i] = 0;                                     // 9 + 1 → 0, carry on
}
digits.unshift(1); // every digit was 9: 999 + 1 = 1000
```

The early return is the point: an increment only ripples through trailing 9s, so most calls touch one digit.

### Binary search on the answer

Integer sqrt asks for the largest `m` with `m * m <= x`. The predicate `m * m <= x` is monotone in `m`, so binary-search the *answer space* `[1, x/2]` rather than any array:

```ts
if (x < 2) return x;
let lo = 1, hi = Math.trunc(x / 2);
while (lo <= hi) {
  const mid = lo + Math.trunc((hi - lo) / 2);
  if (mid * mid === x) return mid;
  if (mid * mid < x) lo = mid + 1;
  else hi = mid - 1;
}
return hi; // hi is the last value whose square is <= x
```

Newton's method is the classic alternative: iterate `r = Math.trunc((r + x / r) / 2)` from `r = x` until `r * r <= x`. It converges quadratically — a handful of iterations even for 2³¹ — and is worth mentioning as a follow-up.

### Binary exponentiation — x^n in O(log n)

Write `n` in binary: `x^13 = x^8 · x^4 · x^1` (13 = 1101₂). Square the base once per bit and multiply it into the result on 1-bits:

```ts
if (n < 0) { x = 1 / x; n = -n; } // flip once, up front
let result = 1;
while (n > 0) {
  if (n % 2 === 1) result *= x;   // this bit is set
  x *= x;                          // next bit's base
  n = Math.trunc(n / 2);
}
return result;
```

31 iterations cover any 32-bit exponent — a naive `for` loop would take two billion. Use `n % 2` and `Math.trunc(n / 2)`, **not** `n & 1` / `n >> 1` (see Watch out).

### Legendre's formula — counting a prime factor in n!

Trailing zeros of `n!` are factors of 10 = 2·5, and 2s vastly outnumber 5s, so count the 5s. Every 5th number contributes one 5, every 25th contributes a second, every 125th a third…

```ts
let count = 0;
for (let p = 5; p <= n; p *= 5) count += Math.trunc(n / p);
```

Never compute `n!` itself — it overflows every fixed-width type almost immediately and loses precision as a double past 170!.

### Complexity of the flagship problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Palindrome Number | O(log₁₀ x) | O(1) | half reversal |
| Plus One | O(n) | O(n) output | carry propagation |
| Sqrt(x) | O(log x) | O(1) | binary search on the answer |
| Pow(x, n) | O(log \|n\|) | O(1) | binary exponentiation |

## Watch out

- **`/` is float division.** `x / 10` gives `12.1`, not `12`. Wrap every digit-drop in `Math.trunc`. The `| 0` trick truncates too but silently corrupts values past 2³¹ — don't use it here.
- **Bitwise operators coerce to signed 32-bit.** In `myPow`, `n & 1` and `n >> 1` break when `|n| ≥ 2³¹` (and the exponent can be −2³¹). `n % 2` and `Math.trunc(n / 2)` are safe at any magnitude.
- **Palindrome guards.** `-121` is not a palindrome, and neither is `10` — but `0` is. Both guards must come before the half-reversal loop, or the loop's stopping condition lies to you.
- **Negate the exponent once, before the loop.** Handling the sign inside the squaring loop double-applies it. Flip `x = 1 / x; n = -n` up front and forget about it.
- **Plus One: never round-trip through `number`.** A 20-digit array exceeds `Number.MAX_SAFE_INTEGER` and rounds silently. Stay in the array.
- **Sqrt returns `hi`, not `lo`,** after a `lo <= hi` loop — `hi` ends on the last value whose square is ≤ x. And in fixed-width languages compare with `mid > x / mid` instead of `mid * mid > x` to avoid overflow (TS/JS doubles are fine up to 2⁵³).
- **Trailing zeroes: count 5s, not zeros.** Computing `n!` and inspecting it is both wrong (overflow) and unnecessary.

## Problem walkthroughs

### Palindrome Number ★

**Problem.** Given an integer `x`, return `true` if its decimal digits read the same forwards and backwards. Solve it arithmetically — no string conversion.

**Example.**

    121  → true
    -121 → false   (reads 121- backwards)
    10   → false   (01 would need a leading zero)

**Steps.**
1. Guard: return `false` if `x < 0`, or if `x % 10 === 0 && x !== 0`.
2. Reverse from the back while `x > rev`: `rev = rev * 10 + x % 10`, then `x = Math.trunc(x / 10)`. The loop stops as soon as `rev` has at least as many digits as `x` — you've reversed the back half.
3. Even digit count: the halves must match exactly (`x === rev`). Odd: the middle digit sits at the end of `rev` and belongs to neither half — compare `x === Math.trunc(rev / 10)`.
4. Why the guards matter: without them, `10` reverses to `1` and the odd-length branch reports a false match. With them, the loop condition `x > rev` is a correct "half consumed" test.

**Complexity.** O(log₁₀ x) time / O(1) space — one digit per iteration, half the digits total.

### Plus One ★

**Problem.** `digits` is a big-endian array of decimal digits representing a non-negative integer with no leading zeros (except the number 0 itself). Return the digit array of that integer plus one.

**Example.**

    [1,2,3] → [1,2,4]
    [9,9,9] → [1,0,0,0]

**Steps.**
1. Walk `i` from the last index toward the front.
2. If `digits[i] < 9`, increment it and return — the carry is absorbed and nothing to the left changes.
3. Otherwise the digit is 9: set it to 0 and continue left (carry propagates).
4. If the loop finishes, every digit was 9 — prepend a 1 (`[1, 0, 0, ..., 0]`).
5. Do not convert to a `number` and back: the array may be longer than 15 digits, past `Number.MAX_SAFE_INTEGER`, and the round trip rounds.

**Complexity.** O(n) worst case (all nines) / O(1) extra beyond the returned array; typical calls touch one digit.

### Factorial Trailing Zeroes

**Problem.** Given `n >= 0`, return the number of trailing zeros in `n!` — without computing `n!`.

**Example.**

    5  → 1    (5! = 120)
    25 → 6
    0  → 0

**Steps.**
1. A trailing zero is a factor of 10 = 2 × 5. In `1..n` the factor 2 appears far more often than 5, so the count of 5s decides.
2. Legendre's formula: multiples of 5 each contribute one 5, multiples of 25 contribute a second, 125 a third, and so on.
3. Loop `p = 5; p <= n; p *= 5`, accumulating `Math.trunc(n / p)`.
4. The insight: you're counting *factors in a product* — a question about `n!` answered with O(log n) divisions and no factorial anywhere.

**Complexity.** O(log₅ n) time / O(1) space.

### Sqrt(x) ★

**Problem.** Given a non-negative integer `x`, return `⌊√x⌋` — the integer square root, rounded down. Library square-root functions are off-limits.

**Example.**

    4 → 2
    8 → 2    (√8 ≈ 2.83, floored)

**Steps.**
1. `x < 2` returns `x` (covers 0 and 1, and lets the search start at `lo = 1`).
2. Binary search `[1, x/2]` — for `x ≥ 2`, `⌊√x⌋` never exceeds `x/2`.
3. If `mid * mid === x`, return `mid`. If less, the answer is `mid` or bigger: `lo = mid + 1`. If more, `hi = mid - 1`.
4. When the loop exits, `hi` is the largest value whose square is ≤ x — return `hi`.
5. Alternative: Newton's method on `f(r) = r² − x`: iterate `r = Math.trunc((r + x / r) / 2)` from `r = x` while `r * r > x`. Quadratic convergence — a handful of steps.

**Complexity.** O(log x) time / O(1) space for both approaches.

### Pow(x, n) ★

**Problem.** Implement `x` raised to the integer power `n`, where `n` may be negative and as large as 32 bits allow. `Math.pow` and `**` are off-limits; the naive O(n) multiplication loop is too slow for `n` near 2³¹.

**Example.**

    x = 2,   n = 10 → 1024
    x = 2,   n = -2 → 0.25

**Steps.**
1. Negative exponent: `x^(−n) = (1/x)^n`. Set `x = 1 / x; n = -n` once, before anything else.
2. Loop while `n > 0` with an accumulator `result = 1`: when `n` is odd (`n % 2 === 1`), multiply `result *= x`; every iteration, square `x *= x` and halve `n = Math.trunc(n / 2)`.
3. Each iteration processes one binary digit of `n`: `x` holds `x^(2^i)` at step `i`, and `result` collects exactly the powers whose bits are set.
4. Avoid `n & 1` / `n >> 1` — bitwise coercion to 32 bits corrupts `n = 2³¹` (which arises from negating −2³¹).
5. Convention: `n === 0` returns 1, including `0^0 → 1`.

**Complexity.** O(log |n|) time / O(1) space — at most 32 squarings for any 32-bit exponent.

### Max Points on a Line

**Problem.** Given `points`, an array of `[x, y]` integer coordinates (all distinct), return the maximum number of points lying on one straight line.

**Example.**

    [[1,1],[2,2],[3,3]]                     → 3
    [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]   → 4

**Steps.**
1. `n <= 2` → every pair is collinear; return `n`.
2. Any best line passes through *some* point, so anchor each point `i` in turn and ask: among lines through `i`, which direction is most popular?
3. For each other point `j`, compute `dy = yj - yi`, `dx = xj - xi`. Hashing the float `dy / dx` is a precision bug — reduce the pair by `g = gcd(dy, dx)` and normalize the sign (e.g. force `dx > 0`; for verticals use the canonical key `"1,0"`), then key a `Map` on `"${dy/g},${dx/g}"`.
4. The largest bucket for anchor `i`, plus 1 for the anchor itself, is `i`'s best line. Take the max over all anchors.
5. The anchoring trick turns "check every triple" O(n³) into "hash every pair per anchor" O(n²).

**Complexity.** O(n²) time / O(n) space per anchor for the direction map.

## Interview follow-ups

After Palindrome Number:
- "Why reverse only half?" — in 32-bit languages the full reversal of a valid input can overflow; the half reversal never exceeds the original's magnitude.
- "Palindrome linked list?" — same idea, different tools: fast/slow pointers to the middle, reverse one half, compare.

After Pow:
- "Recursive version?" — `pow(x, n) = pow(x*x, n/2)` times `x` when odd; same O(log n), plus O(log n) stack.
- "Where else does fast exponentiation appear?" — modular exponentiation in RSA/Diffie–Hellman, and matrix exponentiation (Fibonacci in O(log n)).

After Sqrt:
- "Newton vs binary search?" — Newton converges quadratically (digits of accuracy double per step); binary search gains one bit per step. Both are O(log x); Newton wins by a constant factor.

After Factorial Trailing Zeroes:
- "Why not count 2s too?" — every second number is even; 5s are strictly scarcer, so `min(#2s, #5s) = #5s`.

## The task

Four arithmetic classics. Each must hit the stated complexity — the naive alternative (string conversion, O(n) multiplication loops, library shortcuts) is exactly what's being screened out.

### `isPalindromeNumber(x: number): boolean`

Return `true` if the integer `x` reads the same forwards and backwards in decimal. **String conversion is forbidden** — no `String(x)`, no `x.toString()`, no template literals; solve it with `% 10` and `Math.trunc(x / 10)` (reversing only the back half is the clean way). Negative numbers are never palindromes. Numbers ending in 0 are never palindromes — except `0` itself, which is one. O(log₁₀ x) time, O(1) space.

```ts
isPalindromeNumber(121);   // true
isPalindromeNumber(-121);  // false
isPalindromeNumber(10);    // false
isPalindromeNumber(0);     // true
```

Edge cases: single-digit numbers (all palindromes), even vs odd digit counts (`1221` and `12321` are both palindromes), `1000021` (false — don't let trailing/leading digit mismatches slip through).

### `plusOne(digits: number[]): number[]`

`digits` is a non-empty big-endian array of decimal digits (`0`–`9`) representing a non-negative integer with no leading zeros (except the number 0 as `[0]`). Return the digit array of that integer plus one. Work digit-by-digit from the back — the array can be far longer than `Number.MAX_SAFE_INTEGER` allows, so converting to a number and back corrupts the value. O(n) time.

```ts
plusOne([1, 2, 3]);    // [1, 2, 4]
plusOne([9]);          // [1, 0]
plusOne([9, 9, 9]);    // [1, 0, 0, 0]
plusOne([0]);          // [1]
```

Edge cases: no carry at all (last digit < 9), carry through several trailing 9s (`[8, 9, 9]` → `[9, 0, 0]`), all nines (result grows one digit), arrays with dozens of digits.

### `mySqrt(x: number): number`

Return `⌊√x⌋` for a non-negative integer `x` — the largest integer `m` with `m * m <= x`. **`Math.sqrt`, `Math.pow`, and `**` are forbidden**; binary-search the answer space (or use Newton's method). O(log x) time.

```ts
mySqrt(4);           // 2
mySqrt(8);           // 2
mySqrt(0);           // 0
mySqrt(2147395599);  // 46339
```

Edge cases: `0` and `1` (return themselves), perfect squares vs one-below-a-perfect-square (`15` → 3, `16` → 4), values near 2³¹ (`2147483647` → 46340).

### `myPow(x: number, n: number): number`

Return `x` raised to the integer power `n`. `x` is a float; `n` is an integer that may be negative, with magnitude up to 2³¹. **`Math.pow` and `**` are forbidden**, and the solution must run in O(log |n|) time — binary exponentiation, not a multiplication loop. Handle the negative exponent by inverting the base once up front. `myPow(anything, 0)` is `1`.

```ts
myPow(2, 10);   // 1024
myPow(2.1, 3);  // 9.261
myPow(2, -2);   // 0.25
myPow(-2, 3);   // -8
```

Edge cases: `n === 0` (returns 1, even for `x = 0`), negative base with even vs odd exponent, `x = 0` with positive `n` (returns 0), `n = ±2³¹ − 1` scale exponents (must finish instantly), tiny results that underflow toward 0 (fine — return what the arithmetic gives).
