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

## The task

Implement three functions:

- `int max(int a, int b)` — returns the larger of a and b
- `int factorial(int n)` — returns n! for n ≥ 0 (`factorial(0)` = 1)
- `int is_palindrome(int n)` — returns 1 if the decimal representation of n is a palindrome (same forwards and backwards), 0 otherwise (assume n ≥ 0)
