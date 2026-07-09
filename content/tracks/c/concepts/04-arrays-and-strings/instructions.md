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

## Watch out

- **No allocation happens here.** `str_reverse` writes into a buffer the *caller* already owns — you never call `malloc` and there is nothing to `free`. Your job is only to write the right bytes and terminate with `'\0'`.
- A forgotten `'\0'` is the #1 C string bug: every function in `<string.h>` (and `printf`'s `%s`) keeps reading past the end of the buffer until it happens to hit a zero byte somewhere in memory — undefined behavior, not a clean error.
- `strlen` walks the whole string every call — it is O(n), not O(1) like `.length` in other languages. Calling it repeatedly in a loop condition (`for (i = 0; i < strlen(s); i++)`) makes the loop O(n²).
- `str_count("hello", 'l')` counts `char`s, not "characters" in the Unicode sense — C's `char` is a byte. Multi-byte UTF-8 sequences are counted per-byte, not per-codepoint.

## The task

Implement three functions. None of them allocate memory — `str_reverse` writes into a buffer the caller has already allocated large enough to hold the result; you own no memory and free nothing.

- `int str_count(const char *s, char c)` — count how many times the byte `c` appears in the null-terminated string `s`
- `void str_reverse(const char *src, char *dst)` — write `src` into `dst` reversed and null-terminated. **`dst` must already have room for at least `strlen(src) + 1` bytes** — the caller guarantees this; you do not allocate `dst`.
- `int str_starts_with(const char *s, const char *prefix)` — return `1` if `s` begins with `prefix`, `0` otherwise; an empty `prefix` always matches

```c
str_count("hello", 'l');    // 2
str_count("banana", 'a');   // 3
str_count("hello", 'z');    // 0  — not present
str_count("", 'a');         // 0  — empty string

char buf[64];                        // caller-owned, big enough for any test input
str_reverse("abcde", buf);           // buf == "edcba"
str_reverse("", buf);                // buf == ""    — reversing empty is empty
str_reverse("abba", buf);            // buf == "abba" — a palindrome reverses to itself

str_starts_with("foobar", "foo");    // 1
str_starts_with("foobar", "bar");    // 0
str_starts_with("foobar", "");       // 1  — empty prefix always matches
str_starts_with("hi", "hillo");      // 0  — prefix longer than s
```
