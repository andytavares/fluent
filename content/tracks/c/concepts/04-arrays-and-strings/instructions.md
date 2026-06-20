# Arrays & Strings

## What you'll learn

In C, a string is not a first-class type — it is a null-terminated array of `char`. Understanding this model is essential: every `char*` string ends with a `'\0'` byte that marks the end.

## Key concepts

**Fixed-size arrays:**
```c
int nums[5] = {1, 2, 3, 4, 5};
nums[0];           /* 1 */
sizeof(nums);      /* 20 (5 * 4 bytes on most platforms) */
int len = sizeof(nums) / sizeof(nums[0]);  /* 5 */
```

**String literals** are read-only `char*` arrays:
```c
const char *greeting = "hello";  /* 6 bytes: h e l l o \0 */
```

**`<string.h>` functions:**
```c
#include <string.h>
strlen("hello");          /* 5  — does not count the \0 */
strcmp("abc", "abc");     /* 0  — equal */
strcmp("a", "b");         /* negative */
strcpy(dest, src);        /* copies src into dest (dest must be big enough) */
strcat(dest, src);        /* appends src to dest */
strncpy(dest, src, n);    /* safer copy: at most n bytes */
```

**String to number and back:**
```c
#include <stdlib.h>
#include <stdio.h>
int n  = atoi("42");         /* string → int */
char buf[32];
sprintf(buf, "%d", 42);      /* int → string */
```

**vs other languages:** No `+` operator for strings, no `str.length` property, no bounds checking. Writing past the end of a buffer is undefined behavior — the basis of many security vulnerabilities. Prefer `snprintf` over `sprintf` to prevent buffer overflows.

## The task

Implement three functions (all output goes into a caller-provided buffer):

- `int str_count(const char *s, char c)` — count how many times character `c` appears in string `s`
- `void str_reverse(const char *src, char *dst)` — copy `src` into `dst` reversed (null-terminated)
- `int str_starts_with(const char *s, const char *prefix)` — return 1 if `s` starts with `prefix`, 0 otherwise
