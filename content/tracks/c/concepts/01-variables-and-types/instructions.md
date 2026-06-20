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

## The task

Implement three functions (no `main` needed — the test runner provides it):

- `int add(int a, int b)` — return the sum
- `int clamp(int value, int min_val, int max_val)` — return value clamped to `[min_val, max_val]`
- `double celsius_to_fahrenheit(double c)` — convert Celsius to Fahrenheit (`c * 9.0 / 5.0 + 32.0`)
