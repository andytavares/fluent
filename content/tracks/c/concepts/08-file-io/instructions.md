# File I/O

## What you'll learn

C's file I/O is done through `FILE*` pointers — an opaque handle representing an open file. The standard library (`<stdio.h>`) provides functions for reading and writing text and binary data. There is no automatic resource management: every `fopen` must have a matching `fclose`.

## Key concepts

**Opening and closing:**
```c
#include <stdio.h>

FILE *f = fopen("data.txt", "r");   // "r" read, "w" write, "a" append
if (f == NULL) {                     // always check — fopen returns NULL on failure
    perror("fopen");
    return -1;
}
// ... use f ...
fclose(f);
```

Mode strings: `"r"` (read), `"w"` (write/create/truncate), `"a"` (append), `"rb"`/`"wb"` (binary).

**Reading text:**
```c
char line[256];
while (fgets(line, sizeof(line), f) != NULL) {
    // process line — includes the '\n'
}
```

`fgets` reads at most `n-1` characters and null-terminates. It returns `NULL` at EOF or on error.

**Writing text:**
```c
fprintf(f, "Hello, %s! Count: %d\n", name, count);
fputs("literal line\n", f);
```

**Reading/writing binary:**
```c
int nums[4] = {1, 2, 3, 4};
fwrite(nums, sizeof(int), 4, f);   // write 4 ints

int buf[4];
size_t n = fread(buf, sizeof(int), 4, f);  // returns items actually read
```

**Error and EOF detection:**
```c
if (feof(f))   { /* hit end of file */ }
if (ferror(f)) { perror("read error"); }
```

**vs other languages:** Java and Python wrap files in objects with automatic close (try-with-resources / `with` statement). Go's `defer f.Close()` closes at function exit. C++ offers `std::fstream` with RAII. In C, you manage it yourself — leak the `FILE*` and the OS reclaims it at process exit, but that's not acceptable for long-running programs or repeated opens.

## The task

Implement the following functions in `stub.c`:

- `int count_lines(const char *filename)` — return the number of newline-terminated lines in the file; return `-1` on error
- `long file_size(const char *filename)` — return the file size in bytes using `fseek`/`ftell`; return `-1` on error
- `int copy_file(const char *src, const char *dst)` — copy all bytes from `src` to `dst`; return `0` on success, `-1` on error
- `int write_ints(const char *filename, const int *arr, int n)` — write `n` ints to a binary file; return `0` on success, `-1` on error
- `int read_ints(const char *filename, int *arr, int max_n)` — read up to `max_n` ints from a binary file; return the number of ints read, or `-1` on error
