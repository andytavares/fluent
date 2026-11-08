## What you build

You write three small functions: `add`, `clamp` and `celsius_to_fahrenheit`. C uses static types. Every variable declaration needs an explicit type, and the compiler rejects type mismatches.

## Key concepts

### The type sets size, range and operations

Each variable has one type for its whole life. An `int` is usually 32 bits. A `char` is one byte.

```c
// Signed integer, usually 32-bit
int    count = 42;
// Double-precision float
double ratio = 3.14;
// One byte, often an ASCII character
char   letter = 'A';
// Use 0/1 for false/true
int    flag = 1;
```

Before C23, C has no `bool` keyword. Use `0` and `1`, or include `<stdbool.h>`. C23 makes `bool`, `true` and `false` keywords.

### C99 lets you declare anywhere

C89/C90 needs declarations at the top of a block, before other statements. C99 and later allow a declaration anywhere. Top-of-block is still a common style.

### `printf` needs the right format specifier

| Type     | Specifier       |
|----------|-----------------|
| `int`    | `%d`            |
| `double` | `%f` or `%.2f`  |
| `char`   | `%c`            |
| `char*`  | `%s`            |

```c
printf("%d %.2f %c\n", 7, 3.5, 'A');
```

### Integer division truncates

Division of two `int` values truncates toward zero. Cast one operand to `double` first to keep the fraction.

```c
int a = 7, b = 2;
int quotient  = a / b;          // 3
double ratio  = (double)a / b;  // 3.5
int remainder = a % b;          // 1
```

### You manage memory and errors

C has no garbage collector. The function's stack variables end when the function returns. C has no exceptions. Functions report errors with integer return codes or with `errno`.

## Watch out

- Signed integer overflow is undefined behavior. `INT_MAX + 1` does not wrap like Java or grow like Python.
- `(double)(a / b)` casts a result that is already truncated. Write `(double)a / b` to get the fraction.
- `printf` does not check types against the format string. A `double` passed to `%d` prints garbage.
- An uninitialized local variable holds old stack data. Always initialize a variable before you read it.

## The task

Write three functions. The test runner provides `main`.

1. `int add(int a, int b)` returns the sum of `a` and `b`.
2. `int clamp(int value, int min_val, int max_val)` returns `value` limited to the inclusive range `[min_val, max_val]`.
3. If `value` is below `min_val`, `clamp` returns `min_val`.
4. If `value` is above `max_val`, `clamp` returns `max_val`.
5. `double celsius_to_fahrenheit(double c)` returns `c * 9.0 / 5.0 + 32.0`.

A value equal to `min_val` or `max_val` stays unchanged. At -40, both scales agree.

```c
add(2, 3);                    // 5
add(-5, -3);                  // -8
clamp(15, 0, 10);             // 10
clamp(-5, 0, 10);             // 0
clamp(5, 0, 10);              // 5
clamp(10, 0, 10);             // 10
celsius_to_fahrenheit(0.0);   // 32.0
celsius_to_fahrenheit(100.0); // 212.0
celsius_to_fahrenheit(-40.0); // -40.0
celsius_to_fahrenheit(37.0);  // 98.6
```
