# The Preprocessor

## What you'll learn

C's preprocessor runs before the compiler sees your code. It handles textual substitution (`#define`), conditional compilation (`#ifdef`), and file inclusion (`#include`). It is a blunt instrument — it operates on text, not on types or scopes — but understanding it is essential for reading real C code.

## Key concepts

**Object-like macros:**
```c
#define PI 3.14159265
#define MAX_SIZE 1024
```
The preprocessor replaces every occurrence of `PI` with `3.14159265` before compilation. There are no types, no scope rules.

**Function-like macros:**
```c
#define SQUARE(x) ((x) * (x))
#define MAX(a, b) ((a) > (b) ? (a) : (b))
```
Always wrap arguments in parentheses to avoid precedence bugs: `SQUARE(1+2)` without parens would expand to `1+2*1+2 = 5`, not `9`.

**Include guards — the canonical pattern:**
```c
#ifndef MY_HEADER_H
#define MY_HEADER_H

// header content

#endif /* MY_HEADER_H */
```
Prevents the same header from being included multiple times in a translation unit. `#pragma once` is a non-standard but widely supported alternative.

**Conditional compilation:**
```c
#ifdef DEBUG
    printf("x = %d\n", x);
#endif

#if defined(PLATFORM_LINUX)
    // linux-specific code
#elif defined(PLATFORM_MACOS)
    // mac-specific code
#else
    #error "Unsupported platform"
#endif
```

**Predefined macros:**
```c
__FILE__   // current filename as string literal
__LINE__   // current line number as integer
__func__   // current function name (C99)
__DATE__   // compilation date
```

**Stringification and token pasting:**
```c
#define STRINGIFY(x) #x          // turns x into "x"
#define CONCAT(a, b) a##b        // pastes a and b together
```

**vs other languages:** Most modern languages (Go, Java, Python, TypeScript) have no preprocessor — they use the language itself for constants and conditional logic. Rust has macros but they operate on the AST, not on text. C's preprocessor is purely textual; it has no knowledge of types or scope.

## The task

Implement the following in `stub.c`. The task is primarily definitional — define the macros, then implement the functions that use them:

- `#define CLAMP(x, lo, hi)` — a macro that clamps `x` to `[lo, hi]`; must work correctly for any expression including ones with side effects when `x` appears once
- `#define IS_POWER_OF_TWO(n)` — a macro that evaluates to 1 if `n` is a positive power of two, 0 otherwise (hint: `n & (n-1)`)
- `#define ARRAY_LEN(arr)` — a macro that returns the number of elements in a stack-allocated array
- `int debug_enabled(void)` — returns 1 if the macro `DEBUG` is defined, 0 otherwise (use `#ifdef` inside the function body)
- `int platform_id(void)` — returns 1 for Linux (`__linux__`), 2 for macOS (`__APPLE__`), 0 for unknown
