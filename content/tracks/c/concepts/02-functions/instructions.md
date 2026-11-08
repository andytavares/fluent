## What you build

You write `max`, a recursive `factorial` and `is_palindrome`. In C, you must declare a function before you call it. This lesson builds on **Variables & Types**.

## Key concepts

### A definition gives the body

A definition states the return type, the name, the parameters and the body.

```c
int square(int n) {
    return n * n;
}
```

### A prototype declares the signature

A prototype is a declaration with no body. Put it at the top of the file or in a header. A single-file program often combines declaration and definition.

```c
int square(int n);
```

### A recursive function needs a base case

A recursive function calls itself. The base case stops the recursion.

```c
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```

### A function returns one value

C has no multiple return values. To give back more than one value, use output parameters (pointers) or a struct.

### C passes arguments by value

The function gets a copy of each argument. A change to a parameter does not change the caller's variable. The **Pointers** concept shows how to change caller data.

```c
void reset(int n) { n = 0; }

int x = 5;
reset(x);  // x is still 5
```

### No overloading and no default parameters

C has no function overloading, default parameters or named arguments. For an optional parameter, write a separate function or pass a sentinel value, such as `NULL` or `-1`.

## Watch out

- `13!` overflows a 32-bit `int`. Real code uses `long long` or checks before it multiplies.
- C does not guarantee tail calls. Very deep recursion can overflow the stack with no warning.
- `max` uses `>`. With `a == b` either branch is correct. With NaN, every comparison is false.
- A path with no `return` gives undefined behavior if the caller uses the result. `-Wreturn-type` warns only sometimes.

## The task

Write three functions.

1. `int max(int a, int b)` returns the larger of `a` and `b`.
2. If `a == b`, `max` returns that value.
3. `int factorial(int n)` returns `n!` for `n >= 0`. Compute it recursively.
4. `factorial(0)` returns `1`.
5. `int is_palindrome(int n)` returns `1` if the decimal digits of `n` read the same in both directions.
6. Otherwise, `is_palindrome` returns `0`. Assume `n >= 0`.

A single digit, including `0`, is a palindrome. A trailing zero breaks the symmetry: `120` reversed is `021`.

```c
max(3, 7);           // 7
max(7, 3);           // 7
max(5, 5);           // 5
max(-1, -2);         // -1
factorial(0);        // 1
factorial(1);        // 1
factorial(5);        // 120
factorial(7);        // 5040
is_palindrome(0);    // 1
is_palindrome(121);  // 1
is_palindrome(1221); // 1
is_palindrome(120);  // 0
is_palindrome(123);  // 0
```
