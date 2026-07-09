# Variables & Types

## What you'll learn

C is statically typed and requires an explicit type on every variable declaration. Types determine size, range, and the operations you can perform — the compiler rejects type mismatches.

## Key concepts

**Primitive types:**
```c
int    count = 42;          // signed integer (typically 32-bit)
double ratio = 3.14;        // double-precision float
char   letter = 'A';        // single byte, often used for ASCII
int    flag = 1;            // C has no bool; use 0/1 or <stdbool.h>
```

**Declarations must precede use** (in C89/C90). Modern C (C99+) allows declarations anywhere, but top-of-block is conventional.

**printf format specifiers:**
| Type     | Specifier |
|----------|-----------|
| `int`    | `%d`      |
| `double` | `%f` / `%.2f` |
| `char`   | `%c`      |
| `char*`  | `%s`      |

**Arithmetic:**
```c
int a = 7, b = 2;
int quotient  = a / b;   // 3   — integer division truncates
double ratio  = (double)a / b;  // 3.5 — cast first
int remainder = a % b;   // 1
```

**vs other languages:** There is no garbage collector — you manage memory. Stack variables are freed when the function returns. No exceptions — errors are returned as integer codes or indicated via `errno`.

## Watch out

- **Signed integer overflow is undefined behavior**, not a wraparound like Java's `int` or a promotion to bignum like Python's `int`. Don't write code that depends on `INT_MAX + 1` doing anything in particular.
- **Integer division truncates toward zero, before any surrounding cast**: `(double)(a / b)` casts an already-truncated integer result; `(double)a / b` casts an operand first, giving a real fraction. Mixing these up is a classic C bug.
- `printf` does no type checking against its format string — passing a `double` where `%d` expects an `int` reads garbage because varargs carry no type information at runtime.
- Uninitialized local variables hold whatever garbage was already on the stack — always initialize before reading.

## The task

Implement three functions (no `main` needed — the test runner provides it):

- `int add(int a, int b)` — return the sum
- `int clamp(int value, int min_val, int max_val)` — return `value` clamped to the inclusive range `[min_val, max_val]`
- `double celsius_to_fahrenheit(double c)` — convert Celsius to Fahrenheit using `c * 9.0 / 5.0 + 32.0`

```c
add(2, 3);                     // 5
add(-5, -3);                   // -8

clamp(15, 0, 10);               // 10  — above max_val, pulled down
clamp(-5, 0, 10);                // 0  — below min_val, pulled up
clamp(5, 0, 10);                 // 5  — already in range, unchanged

celsius_to_fahrenheit(0.0);     // 32.0
celsius_to_fahrenheit(100.0);   // 212.0
celsius_to_fahrenheit(-40.0);   // -40.0  — the crossover point where both scales agree
```
