# Functions

## What you'll learn

C functions must be declared before they are called. A **declaration** (prototype) tells the compiler the function's signature; a **definition** provides the body. In a single-file program these are often combined.

## Key concepts

**Function definition:**
```c
int square(int n) {
    return n * n;
}
```

**Function prototype** (declaration without body — place at the top of the file or in a header):
```c
int square(int n);  /* prototype */
```

**Recursive functions** call themselves — the base case prevents infinite recursion:
```c
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```

**Multiple return values don't exist** — C functions return at most one value. Use output parameters (pointers) or a struct to return multiple values.

**Pass by value:** C passes arguments by value — the function receives a copy. Modifying a parameter inside the function has no effect on the caller's variable. Use pointers to mutate caller-side data (covered in the Pointers concept).

**vs other languages:** No function overloading, no default parameters, no named arguments. If you want an optional parameter, use a separate function or pass a sentinel value (e.g., `NULL` or `-1`).

## Watch out

- `factorial(n)` grows fast: `13!` already overflows a 32-bit `int`. This exercise assumes small, well-behaved inputs — production code would use `long long` or check for overflow before multiplying.
- Every recursive call consumes stack frame space. There's no tail-call guarantee in C — a sufficiently deep recursion (tens of thousands of frames) can overflow the stack with no compiler warning.
- `max` compares with `>`, not `>=`; when `a == b` either branch returns the same value, so the choice doesn't matter here, but it does the moment you compare non-numeric or floating-point values (NaN comparisons are always false).
- A function without a `return` on every path has undefined behavior if the caller uses the return value — the compiler may warn (`-Wreturn-type`) but won't always stop you.

## The task

Implement three functions:

- `int max(int a, int b)` — returns the larger of `a` and `b`
- `int factorial(int n)` — returns `n!` for `n >= 0`, computed recursively (`factorial(0)` is `1` by definition)
- `int is_palindrome(int n)` — returns `1` if the decimal representation of `n` reads the same forwards and backwards, `0` otherwise; assume `n >= 0`

```c
max(3, 7);    // 7
max(7, 3);    // 7
max(5, 5);    // 5
max(-1, -2);  // -1

factorial(0);  // 1  — base case
factorial(1);  // 1
factorial(5);  // 120

is_palindrome(121);  // 1
is_palindrome(0);    // 1  — a single digit is trivially a palindrome
is_palindrome(120);  // 0  — trailing zero breaks symmetry (021 != 120)
is_palindrome(123);  // 0
```
