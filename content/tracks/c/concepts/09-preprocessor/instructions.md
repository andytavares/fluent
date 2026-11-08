## What you build

You define three macros, `CLAMP`, `IS_POWER_OF_TWO` and `ARRAY_LEN`. You also write two functions that use conditional compilation. This lesson builds on **File I/O**.

## Key concepts

### The preprocessor edits text before the compiler runs

It handles text substitution (`#define`), conditional compilation (`#ifdef`) and file inclusion (`#include`). It knows nothing about types or scopes. You need it to read real C code.

### An object-like macro replaces a name with text

The preprocessor replaces every `PI` with `3.14159265` before compilation. The macro has no type and no scope.

```c
#define PI 3.14159265
#define MAX_SIZE 1024
```

### A function-like macro takes arguments

Wrap each argument in parentheses. Without them, `SQUARE(1+2)` expands to `1+2*1+2`, which is `5`, not `9`.

```c
#define SQUARE(x) ((x) * (x))
#define MAX(a, b) ((a) > (b) ? (a) : (b))
```

### Include guards stop a double include

The guard stops a second copy of one header in a translation unit. `#pragma once` is not standard, but most compilers support it.

```c
#ifndef MY_HEADER_H
#define MY_HEADER_H

// header content

#endif /* MY_HEADER_H */
```

### Conditional compilation picks code at build time

The compiler sees only the branch whose condition is true. `#error` stops the build with a message.

```c
#ifdef DEBUG
    printf("x = %d\n", x);
#endif

#if defined(PLATFORM_LINUX)
    // Linux code
#elif defined(PLATFORM_MACOS)
    // macOS code
#else
    #error "Unsupported platform"
#endif
```

### The compiler predefines some names

`__func__` comes from C99. It is an identifier that the compiler defines, not a preprocessor macro.

```c
// Current file name, a string literal
__FILE__
// Current line number, an integer
__LINE__
// Current function name (C99)
__func__
// Compilation date
__DATE__
```

### `#` makes a string and `##` joins tokens

```c
// STRINGIFY(x) becomes "x"
#define STRINGIFY(x) #x
// CONCAT(a, b) becomes ab
#define CONCAT(a, b) a##b
```

Go, Java, Python and TypeScript have no preprocessor. Rust macros work on the syntax tree, not on text.

## Watch out

- A macro can evaluate an argument more than once. `CLAMP(i++, 0, 10)` increments `i` two or three times.
- Never pass an argument with side effects to a macro, unless its documentation promises one evaluation. Side effects include `++`, `--`, assignment and calls with effects.
- `ARRAY_LEN` on a pointer gives the pointer size divided by the element size. On 64-bit systems a pointer is 8 bytes.
- An array parameter decays to a pointer. Use `ARRAY_LEN` only in the scope that declares the real array.
- Macros have no type check. `CLAMP("hello", 0, 10)` compiles and then misbehaves.
- Parenthesize each parameter and the full expansion. A missing pair gives precedence bugs at some call sites only.

## The task

Define three macros and write two functions in `stub.c`.

1. `#define CLAMP(x, lo, hi)` expands to `x` limited to the range `[lo, hi]`.
2. `CLAMP` gives `lo` when `x` is below `lo`, and `hi` when `x` is above `hi`.
3. Parenthesize every parameter of each macro and each full expansion.
4. `#define IS_POWER_OF_TWO(n)` gives `1` if `n` is a positive power of two. Otherwise it gives `0`.
5. `#define ARRAY_LEN(arr)` gives the number of elements in an array. The array declaration must be in scope.
6. `int debug_enabled(void)` returns `1` if the build defines `DEBUG`. Otherwise it returns `0`.
7. `int platform_id(void)` returns `1` if the compiler defines `__linux__`. It returns `2` if the compiler defines `__APPLE__`.
8. On any other platform, `platform_id` returns `0`.

`CLAMP` uses `x` more than once, so callers must not pass side effects. Zero is not a power of two. For a positive power of two, `n & (n - 1)` is `0`. For `ARRAY_LEN`, use `sizeof(arr) / sizeof(arr[0])`. For `debug_enabled`, use `#ifdef DEBUG` inside the function body.

```c
CLAMP(-5, 0, 10);       // 0
CLAMP(15, 0, 10);       // 10
CLAMP(5, 0, 10);        // 5
CLAMP(0, 0, 10);        // 0
CLAMP(10, 0, 10);       // 10

IS_POWER_OF_TWO(1);     // 1
IS_POWER_OF_TWO(8);     // 1
IS_POWER_OF_TWO(1024);  // 1
IS_POWER_OF_TWO(0);     // 0
IS_POWER_OF_TWO(6);     // 0

int arr3[] = {1, 2, 3};
ARRAY_LEN(arr3);        // 3
char str[10];
ARRAY_LEN(str);         // 10

// 1 with -DDEBUG, 0 without
debug_enabled();
// 1 on Linux, 2 on macOS, else 0
platform_id();
```
