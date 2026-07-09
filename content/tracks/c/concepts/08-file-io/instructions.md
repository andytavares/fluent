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

## Watch out

- **Every successful `fopen` needs a matching `fclose`**, on every return path — including error paths. Forgetting to close on an early `return -1` leaks a file descriptor; the OS reclaims it at process exit, but a long-running program will eventually run out of descriptors.
- `fopen` returning `NULL` is the normal way to signal "file doesn't exist" or "permission denied" — always check before dereferencing the `FILE*`.
- Mixing up `"r"` vs `"w"`: opening for `"w"` **truncates an existing file to zero bytes immediately**, even if you never write anything. There is no "open for read, create if missing" single mode — use `"r"` and handle the `NULL` case, or `"a"` if append-or-create is what you want.
- Binary I/O (`fwrite`/`fread` of raw `int`s) is **not portable across machines** with different endianness or `int` size — fine for a temp file your own program reads back, unsafe as a wire format between different systems.
- None of these functions allocate memory that the caller must free — buffers (`arr` in `write_ints`/`read_ints`) are caller-owned; these functions only read or write bytes through the given `FILE*` handles, which they open and close themselves.

## The task

Implement the following functions. None of them allocate memory — they read/write through caller-owned buffers and manage their own `FILE*` handles (open and close internally).

- `int count_lines(const char *filename)` — return the number of newline-terminated lines in the file; return `-1` if the file can't be opened
- `long file_size(const char *filename)` — return the file size in bytes using `fseek`/`ftell`; return `-1` if the file can't be opened
- `int copy_file(const char *src, const char *dst)` — copy all bytes from `src` to `dst` (creating or truncating `dst`); return `0` on success, `-1` on error
- `int write_ints(const char *filename, const int *arr, int n)` — write `n` ints from `arr` to `filename` in binary format; return `0` on success, `-1` on error
- `int read_ints(const char *filename, int *arr, int max_n)` — read up to `max_n` ints from the binary file `filename` into the caller-provided buffer `arr`; return the number of ints actually read (may be less than `max_n` if the file is shorter), or `-1` if the file can't be opened

```c
// file "notes.txt" contains: "alpha\nbeta\ngamma\n"
count_lines("notes.txt");            // 3
count_lines("/no/such/file");        // -1

// file "notes.txt" contains: "hello" (5 bytes, no trailing newline)
file_size("notes.txt");              // 5

copy_file("notes.txt", "copy.txt");  // 0; copy.txt now has identical contents

int data[] = {10, 20, 30};
write_ints("data.bin", data, 3);     // 0; data.bin now holds 3 binary ints

int buf[10] = {0};
read_ints("data.bin", buf, 10);      // 3 — fewer ints existed than max_n; buf[0..2] == {10,20,30}
int small[2];
read_ints("data.bin", small, 2);     // 2 — max_n caps the read; small == {10, 20}
```
