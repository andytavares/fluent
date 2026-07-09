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

## Watch out

- **Macro parameters can be evaluated more than once.** `CLAMP(x, lo, hi)` written the natural way references `x` two or three times in its expansion — call it as `CLAMP(i++, 0, 10)` and `i` gets incremented multiple times per "call". This is a real, well-known macro footgun: never pass an expression with side effects (`++`, `--`, assignment, function calls with effects) to a macro unless its documentation explicitly guarantees single evaluation.
- `ARRAY_LEN` only works on an actual array in the scope where you write it — `sizeof(arr)` on a `pointer` (including an array parameter, which decays to a pointer) silently gives the pointer's size (8 on 64-bit), not the array's length. This is why `ARRAY_LEN` must be used at the call site, never passed a pointer received as a function parameter.
- Macros are **not type-checked** — `CLAMP("hello", 0, 10)` compiles (and misbehaves) because the preprocessor only does text substitution, before the compiler ever sees types.
- Missing parentheses around macro parameters and the whole expansion causes operator-precedence bugs invisible until a specific call site triggers them — always parenthesize both each parameter and the full expansion.

## The task

Implement the following in `stub.c`. The task is primarily definitional — define the macros, then implement the functions that use them.

- `#define CLAMP(x, lo, hi)` — expands to an expression that clamps `x` to `[lo, hi]`. Parenthesize every parameter and the whole expansion to avoid precedence bugs. Note: like most clamp-style macros, this one references `x` more than once in its expansion — callers must avoid passing expressions with side effects (see Watch out).
- `#define IS_POWER_OF_TWO(n)` — expands to `1` if `n` is a positive power of two, `0` otherwise (hint: for a positive power of two, `n & (n - 1)` is `0`)
- `#define ARRAY_LEN(arr)` — expands to the number of elements in a stack-allocated array (hint: `sizeof(arr) / sizeof(arr[0])`)
- `int debug_enabled(void)` — returns `1` if the macro `DEBUG` is defined at compile time, `0` otherwise (use `#ifdef DEBUG` inside the function body)
- `int platform_id(void)` — returns `1` on Linux (`__linux__` defined), `2` on macOS (`__APPLE__` defined), `0` otherwise

```c
CLAMP(15, 0, 10);   // 10
CLAMP(-5, 0, 10);   // 0
CLAMP(5, 0, 10);    // 5

IS_POWER_OF_TWO(8);     // 1
IS_POWER_OF_TWO(1024);  // 1
IS_POWER_OF_TWO(0);     // 0  — zero is not a power of two
IS_POWER_OF_TWO(6);     // 0

int arr[5];
ARRAY_LEN(arr);   // 5

debug_enabled();  // 1 if compiled with -DDEBUG, 0 otherwise
platform_id();    // 1, 2, or 0 depending on the host platform
```
