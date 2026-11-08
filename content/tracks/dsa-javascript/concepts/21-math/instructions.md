## What you build

You write four integer arithmetic functions: a palindrome check without strings, an increment of a digit array, an integer square root and fast exponentiation. Fast exponentiation powers matrix exponentiation, and digit extraction powers base conversion and checksums. This lesson builds on **Binary Search**.

## Key concepts

### `% 10` reads a digit and division drops it

`x % 10` reads the last decimal digit. `Math.trunc(x / 10)` drops it. Repeat both to walk the number from right to left. To build a number from digits left to right, multiply and add.

```js
// x >= 0
let rev = 0, n = x;
while (n > 0) {
  // append the last digit of n to rev
  rev = rev * 10 + (n % 10);
  // drop it from n
  n = Math.trunc(n / 10);
}
// rev is x with its digits reversed
```

A string conversion also works, but it allocates memory. In fixed-width languages, the real interview question is whether you can do the arithmetic. Digit loops run in O(log₁₀ x), the number of digits.

### Reverse only half to check a palindrome

To test whether a number reads the same both ways, reverse digits from the back until the reversed part catches up. Then the front half is in `x`, and the reversed back half is in `rev`.

```js
// Needs the guards: x >= 0 and
// (x % 10 !== 0 || x === 0)
let rev = 0;
while (x > rev) {
  rev = rev * 10 + (x % 10);
  x = Math.trunc(x / 10);
}
// even or odd digit count
return x === rev ||
  x === Math.trunc(rev / 10);
```

An odd digit count leaves the middle digit at the end of `rev`. `Math.trunc(rev / 10)` discards it, because a middle digit never breaks symmetry.

Two guards make the loop condition sound. A negative number is never a palindrome, because the sign is on one side only. A number that ends in 0, other than 0, is never one either, because its reversal needs a leading zero.

In fixed-width languages, half reversal also avoids overflow. The full reversal of a valid 32-bit int can exceed 32 bits; the half never does.

### Carry through a digit array like on paper

A number too big for a numeric type can come as an array of digits. Increment it from the last digit, and carry through the nines.

```js
const last = digits.length - 1;
for (let i = last; i >= 0; i--) {
  if (digits[i] < 9) {
    // carry absorbed: done
    digits[i]++;
    return digits;
  }
  // 9 + 1 → 0, carry on
  digits[i] = 0;
}
// every digit was 9: 999 + 1 = 1000
digits.unshift(1);
```

The early return is the point. An increment ripples only through trailing 9s, so most calls touch one digit.

### Binary search on the answer finds an integer square root

The integer square root is the largest `m` with `m * m <= x`. The predicate `m * m <= x` is monotonic in `m`. So binary search the answer space `[1, x/2]`, not an array.

```js
if (x < 2) return x;
let lo = 1, hi = Math.trunc(x / 2);
while (lo <= hi) {
  const mid =
    lo + Math.trunc((hi - lo) / 2);
  if (mid * mid === x) return mid;
  if (mid * mid < x) lo = mid + 1;
  else hi = mid - 1;
}
// last value whose square is <= x
return hi;
```

Newton's method is the classic alternative. Start from `r = x`, and repeat `r = Math.trunc((r + x / r) / 2)` until `r * r <= x`. It converges quadratically: a few iterations, even for 2³¹. Mention it as a follow-up.

### Binary exponentiation computes x^n in O(log n)

Write `n` in binary: `x^13 = x^8 · x^4 · x^1`, because 13 = 1101₂. Square the base once per bit. On each 1-bit, multiply it into the result.

```js
// flip once, up front
if (n < 0) { x = 1 / x; n = -n; }
let result = 1;
while (n > 0) {
  // this bit is set
  if (n % 2 === 1) result *= x;
  // the base for the next bit
  x *= x;
  n = Math.trunc(n / 2);
}
return result;
```

31 iterations cover any 32-bit exponent. A plain `for` loop takes two billion. Use `n % 2` and `Math.trunc(n / 2)`, not `n & 1` and `n >> 1`. See Watch out.

### Legendre's formula counts a prime factor in n!

The trailing zeros of `n!` are factors of 10 = 2·5. Factors of 2 far outnumber factors of 5, so count the 5s. Every 5th number gives one 5, every 25th gives a second, every 125th a third, and so on.

```js
let count = 0;
for (let p = 5; p <= n; p *= 5)
  count += Math.trunc(n / p);
```

Never compute `n!` itself. It overflows every fixed-width type almost at once. As a double, it passes `Number.MAX_SAFE_INTEGER` after 18! and becomes `Infinity` after 170!.

### Complexity of the main problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Palindrome Number | O(log₁₀ x) | O(1) | half reversal |
| Plus One | O(n) | O(n) output | carry propagation |
| Sqrt(x) | O(log x) | O(1) | binary search on the answer |
| Pow(x, n) | O(log \|n\|) | O(1) | binary exponentiation |

## Watch out

- In JavaScript, `/` is float division. `121 / 10` gives `12.1`, not `12`. Wrap every digit drop in `Math.trunc`.
- `| 0` also truncates, but it corrupts values past 2³¹ with no error. Do not use it here.
- Bitwise operators convert to signed 32-bit. In `myPow`, `n & 1` and `n >> 1` break when `|n| ≥ 2³¹`.
- The exponent can be −2³¹. `n % 2` and `Math.trunc(n / 2)` are safe at any size.
- `-121` is not a palindrome, and neither is `10`. `0` is a palindrome.
- Put both palindrome guards before the half-reversal loop. Without them, the stop condition gives wrong answers.
- Negate the exponent once, before the loop. Sign handling inside the squaring loop applies it twice.
- In Plus One, never convert through `Number`. A 20-digit array exceeds `Number.MAX_SAFE_INTEGER` and rounds with no error.
- After a `lo <= hi` loop, Sqrt returns `hi`, not `lo`. `hi` ends on the last value whose square is ≤ x.
- In fixed-width languages, compare `mid > x / mid`, not `mid * mid > x`. That avoids overflow.
- JavaScript doubles hold exact integers up to 2⁵³, so `mid * mid` is safe here.
- For trailing zeros, count factors of 5. Computing `n!` overflows, and you do not need it.

## Problem walkthroughs

### Palindrome Number ★

**Problem.** Given an integer `x`, return `true` if its decimal digits read the same forwards and backwards. Solve it with arithmetic, not a string conversion.

**Example.**

```
121  → true
-121 → false
  (reads 121- backwards)
10   → false
  (01 needs a leading zero)
```

**Steps.**

1. Guard: return `false` if `x < 0`, or if `x % 10 === 0 && x !== 0`.
2. While `x > rev`, set `rev = rev * 10 + x % 10`, then `x = Math.trunc(x / 10)`. The loop stops when `rev` has at least as many digits as `x`. You reversed the back half.
3. For an even digit count, the halves must match exactly: `x === rev`. For an odd count, the middle digit is at the end of `rev` and belongs to neither half. Compare `x === Math.trunc(rev / 10)`.
4. Why the guards matter: without them, `10` reverses to `1`, and the odd-length branch reports a false match. With them, `x > rev` is a correct "half consumed" test.

**Complexity.** O(log₁₀ x) time, O(1) space: one digit per iteration, half the digits in total.

### Plus One ★

**Problem.** `digits` is a big-endian array of decimal digits for a non-negative integer. It has no leading zeros, except for the number 0 itself. Return the digit array of that integer plus one.

**Example.**

```
[1,2,3] → [1,2,4]
[9,9,9] → [1,0,0,0]
```

**Steps.**

1. Walk `i` from the last index toward the front.
2. If `digits[i] < 9`, increment it and return. The carry stops, and nothing to the left changes.
3. Otherwise, the digit is 9. Set it to 0 and continue left; the carry moves on.
4. If the loop finishes, every digit was 9. Prepend a 1: `[1, 0, 0, ..., 0]`.
5. Do not convert to a `Number` and back. The array can be longer than 15 digits, past `Number.MAX_SAFE_INTEGER`, and the conversion rounds.

**Complexity.** O(n) in the worst case, all nines. O(1) extra space beyond the returned array. Typical calls touch one digit.

### Factorial Trailing Zeroes

**Problem.** Given `n >= 0`, return the number of trailing zeros in `n!`, without computing `n!`.

**Example.**

```
5  → 1  (5! = 120)
25 → 6
0  → 0
```

**Steps.**

1. A trailing zero is a factor of 10 = 2 × 5. In `1..n`, the factor 2 appears far more often than 5. So the count of 5s decides.
2. Legendre's formula: each multiple of 5 gives one 5. Each multiple of 25 gives a second, each multiple of 125 a third, and so on.
3. Loop `p = 5; p <= n; p *= 5`, and add `Math.trunc(n / p)` each time.
4. The insight: you count factors in a product. You answer a question about `n!` with O(log n) divisions and no factorial.

**Complexity.** O(log₅ n) time, O(1) space.

### Sqrt(x) ★

**Problem.** Given a non-negative integer `x`, return `⌊√x⌋`, the integer square root rounded down. You cannot use library square-root functions.

**Example.**

```
4 → 2
8 → 2  (√8 ≈ 2.83, floored)
```

**Steps.**

1. If `x < 2`, return `x`. That covers 0 and 1, and lets the search start at `lo = 1`.
2. Binary search `[1, x/2]`. For `x ≥ 2`, `⌊√x⌋` never exceeds `x/2`.
3. If `mid * mid === x`, return `mid`. If it is less, the answer is `mid` or bigger: set `lo = mid + 1`. If it is more, set `hi = mid - 1`.
4. When the loop ends, `hi` is the largest value whose square is ≤ x. Return `hi`.
5. Alternative: Newton's method on `f(r) = r² − x`. Start from `r = x`, and repeat `r = Math.trunc((r + x / r) / 2)` while `r * r > x`. It converges quadratically, in a few steps.

**Complexity.** O(log x) time, O(1) space for both approaches.

### Pow(x, n) ★

**Problem.** Compute `x` raised to the integer power `n`. `n` can be negative and as large as 32 bits allow. You cannot use `Math.pow` or `**`. A plain O(n) multiplication loop is too slow for `n` near 2³¹.

**Example.**

```
x = 2, n = 10 → 1024
x = 2, n = -2 → 0.25
```

**Steps.**

1. For a negative exponent, `x^(−n) = (1/x)^n`. Set `x = 1 / x; n = -n` once, before anything else.
2. Start `result = 1`, and loop while `n > 0`. When `n` is odd (`n % 2 === 1`), set `result *= x`. On every iteration, square `x *= x` and halve `n = Math.trunc(n / 2)`.
3. Each iteration handles one binary digit of `n`. At step `i`, `x` holds `x^(2^i)`, and `result` collects exactly the powers whose bits are set.
4. Avoid `n & 1` and `n >> 1`. The 32-bit conversion corrupts `n = 2³¹`, which comes from negating −2³¹.
5. The convention: `n === 0` returns 1, including `0^0 → 1`.

**Complexity.** O(log |n|) time, O(1) space: at most 32 squarings for any 32-bit exponent.

### Max Points on a Line

**Problem.** Given `points`, an array of distinct `[x, y]` integer coordinates, return the maximum number of points on one straight line.

**Example.**

```
[[1,1],[2,2],[3,3]] → 3
[[1,1],[3,2],[5,3],
 [4,1],[2,3],[1,4]] → 4
```

**Steps.**

1. If `n <= 2`, every pair is collinear, so return `n`.
2. Any best line passes through some point. So anchor each point `i` in turn, and ask which direction through `i` is most popular.
3. For each other point `j`, compute `dy = yj - yi` and `dx = xj - xi`. Hashing the float `dy / dx` is a precision bug.
4. Instead, divide both by `g = gcd(dy, dx)` and normalize the sign, for example force `dx > 0`. Vertical lines use the key `"1,0"`. Key a `Map` on `"${dy/g},${dx/g}"`.
5. The largest bucket for anchor `i`, plus 1 for the anchor, is the best line through `i`. Take the maximum over all anchors.

The anchor trick turns "check every triple", O(n³), into "hash every pair per anchor", O(n²).

**Complexity.** O(n²) time, O(n) space per anchor for the direction map.

## Interview follow-ups

After Palindrome Number:

- "Why reverse only half?" In 32-bit languages, the full reversal of a valid input can overflow. The half reversal never exceeds the size of the original.
- "Check a palindrome linked list." Use the same idea with other tools: fast and slow pointers to the middle, reverse one half, compare.

After Pow:

- "Give a recursive version." `pow(x, n) = pow(x*x, n/2)`, times `x` when `n` is odd. It is the same O(log n), plus O(log n) stack.
- "Where else does fast exponentiation appear?" In modular exponentiation for RSA and Diffie–Hellman, and in matrix exponentiation, such as Fibonacci in O(log n).

After Sqrt:

- "Newton or binary search?" Newton converges quadratically: the digits of accuracy double per step. Binary search gains one bit per step. Both are O(log x); Newton wins by a constant factor.

After Factorial Trailing Zeroes:

- "Why not count 2s too?" Every second number is even, so 5s are always scarcer. `min(#2s, #5s) = #5s`.

## The task

Write four classic arithmetic functions. Each must meet its complexity limit. The tests use exponents large enough to time out an O(n) loop. They cannot detect string conversion or library shortcuts, so do not use them.

### `isPalindromeNumber(x)`

1. Return `true` if the integer `x` reads the same forwards and backwards in decimal.
2. Do not convert to a string: no `String(x)`, no `x.toString()`, no template literals.
3. Use `% 10` and `Math.trunc(x / 10)`. Reversing only the back half is the clean way.
4. Negative numbers are never palindromes.
5. Numbers that end in 0 are never palindromes, except `0` itself.
6. Run in O(log₁₀ x) time and O(1) space.

```js
isPalindromeNumber(121) // true
isPalindromeNumber(-121) // false
isPalindromeNumber(10) // false
isPalindromeNumber(0) // true
```

Edge cases:

- Single-digit numbers are all palindromes.
- Even and odd digit counts: `1221` and `12321` are both palindromes.
- `1000021` is false. Do not let a mismatch between the outer digits slip through.

### `plusOne(digits)`

`digits` is a non-empty big-endian array of decimal digits (`0`–`9`) for a non-negative integer. It has no leading zeros, except the number 0 as `[0]`.

1. Return the digit array of that integer plus one.
2. Work digit by digit from the back.
3. The array can be longer than `Number.MAX_SAFE_INTEGER` allows. A conversion to a number and back corrupts the value.
4. Run in O(n) time.

```js
plusOne([1, 2, 3]) // [1, 2, 4]
plusOne([9]) // [1, 0]
plusOne([9, 9, 9]) // [1, 0, 0, 0]
plusOne([0]) // [1]
```

Edge cases:

- No carry: the last digit is below 9.
- A carry through several trailing 9s: `[8, 9, 9]` gives `[9, 0, 0]`.
- All nines: the result grows by one digit.
- Arrays with dozens of digits.

### `mySqrt(x)`

1. Return `⌊√x⌋` for a non-negative integer `x`: the largest integer `m` with `m * m <= x`.
2. Do not use `Math.sqrt`, `Math.pow` or `**`.
3. Binary search the answer space, or use Newton's method.
4. Run in O(log x) time.

```js
mySqrt(4) // 2
mySqrt(8) // 2
mySqrt(0) // 0
mySqrt(2147395599) // 46339
```

Edge cases:

- `0` and `1` return themselves.
- A perfect square and the value one below it: `15` gives 3, `16` gives 4.
- Values near 2³¹: `2147483647` gives 46340.

### `myPow(x, n)`

`x` is a float. `n` is an integer that can be negative, with a size up to 2³¹.

1. Return `x` raised to the integer power `n`.
2. Do not use `Math.pow` or `**`.
3. Run in O(log |n|) time. Use binary exponentiation, not a multiplication loop.
4. For a negative exponent, invert the base once, before the loop.
5. `myPow(anything, 0)` is `1`.

```js
myPow(2, 10) // 1024
myPow(2.1, 3) // 9.261
myPow(2, -2) // 0.25
myPow(-2, 3) // -8
```

Edge cases:

- `n === 0` returns 1, even for `x = 0`.
- A negative base with an even or an odd exponent.
- `x = 0` with a positive `n` returns 0.
- Exponents near ±2³¹ must finish at once.
- Tiny results underflow toward 0. Return what the arithmetic gives.
