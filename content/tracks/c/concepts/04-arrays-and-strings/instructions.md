## What you build

You write `str_count`, `str_reverse` and `str_starts_with` on C strings. C has no string type: a string is an array of `char` that ends with a `'\0'` byte. This lesson builds on **Pointers**.

## Key concepts

### An array has a fixed size

`sizeof` on an array gives its size in bytes. Divide by the element size to get the length.

```c
int nums[5] = {1, 2, 3, 4, 5};
nums[0];       // 1
// 20: 5 * 4 bytes on most platforms
sizeof(nums);
// 5
int len = sizeof(nums) / sizeof(nums[0]);
```

### A string ends with `'\0'`

Every `char*` string ends with a `'\0'` byte that marks the end. A string literal is a read-only `char` array.

```c
// 6 bytes: h e l l o \0
const char *greeting = "hello";
```

### `<string.h>` has the basic string functions

```c
#include <string.h>
// 5: does not count the \0
strlen("hello");
// 0: equal
strcmp("abc", "abc");
// negative
strcmp("a", "b");
// Copies src into dest.
// dest must be big enough.
strcpy(dest, src);
// Appends src to dest
strcat(dest, src);
// Safer copy: at most n bytes
strncpy(dest, src, n);
```

### Convert between strings and numbers

```c
#include <stdlib.h>
#include <stdio.h>
// string to int
int n = atoi("42");
char buf[32];
// int to string
sprintf(buf, "%d", 42);
```

### C does no bounds checking

C has no `+` operator for strings and no `length` property. A write past the end of a buffer is undefined behavior and the basis of many security holes. Use `snprintf` instead of `sprintf` to prevent buffer overflows.

## Watch out

- `str_reverse` writes into a buffer the caller owns. Do not call `malloc`, and do not free anything.
- A missing `'\0'` is the most common C string bug. `<string.h>` and `%s` then read past the buffer.
- `strlen` walks the whole string on each call, so it is O(n). In a loop condition, the loop becomes O(n²).
- C's `char` is a byte. `str_count` counts bytes, so a multi-byte UTF-8 character counts as several bytes.

## The task

Write three string functions. None of them allocates memory.

1. `int str_count(const char *s, char c)` returns how many times the byte `c` occurs in `s`.
2. `void str_reverse(const char *src, char *dst)` writes `src` reversed into `dst`, with a final `'\0'`.
3. The caller gives `dst` room for at least `strlen(src) + 1` bytes. You do not allocate `dst`.
4. `int str_starts_with(const char *s, const char *prefix)` returns `1` if `s` begins with `prefix`.
5. Otherwise, `str_starts_with` returns `0`.

All strings end with `'\0'`. An empty string has a count of `0` and reverses to itself. An empty `prefix` always matches. A `prefix` longer than `s` never matches.

```c
str_count("hello", 'l');   // 2
str_count("banana", 'a');  // 3
str_count("hello", 'z');   // 0
str_count("", 'a');        // 0

char buf[64];
str_reverse("abcde", buf); // "edcba"
str_reverse("a", buf);     // "a"
str_reverse("", buf);      // ""
str_reverse("abba", buf);  // "abba"

str_starts_with("foobar", "foo"); // 1
str_starts_with("foobar", "bar"); // 0
str_starts_with("foobar", "");    // 1
str_starts_with("hello", "hello");// 1
str_starts_with("hi", "hillo");   // 0
```
