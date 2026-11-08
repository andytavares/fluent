## What you build

You write five functions that count lines, measure size, copy files, and write and read binary ints. C does file I/O through `FILE*` pointers from `<stdio.h>`. This lesson builds on **Dynamic Memory**.

## Key concepts

### A `FILE*` is a handle to an open file

`fopen` returns an opaque handle, or `NULL` on failure. Every successful `fopen` needs a matching `fclose`.

```c
#include <stdio.h>

FILE *f = fopen("data.txt", "r");
// Always check: NULL means failure
if (f == NULL) {
    perror("fopen");
    return -1;
}
// ... use f ...
fclose(f);
```

### The mode string sets the access

| Mode | Meaning |
|------|---------|
| `"r"` | Read |
| `"w"` | Write: create or truncate |
| `"a"` | Append |
| `"rb"`, `"wb"` | Binary read, binary write |

### `fgets` reads one line

`fgets` reads at most `n-1` characters and adds a `'\0'`. The line keeps its `'\n'`. It returns `NULL` at end of file or on error.

```c
char line[256];
while (fgets(line, sizeof(line), f)
       != NULL) {
    // line includes the '\n'
}
```

### `fprintf` and `fputs` write text

```c
fprintf(f, "Hi, %s! Count: %d\n",
        name, count);
fputs("literal line\n", f);
```

### `fwrite` and `fread` move raw bytes

`fread` returns the number of items it read.

```c
int nums[4] = {1, 2, 3, 4};
// Write 4 ints
fwrite(nums, sizeof(int), 4, f);

int buf[4];
size_t n =
    fread(buf, sizeof(int), 4, f);
```

### `feof` and `ferror` tell end from error

```c
if (feof(f))   { /* end of file */ }
if (ferror(f)) { perror("read error"); }
```

### You close every file yourself

Python's `with` statement, Java's try-with-resources, Go's `defer f.Close()` and C++ `std::fstream` with RAII all close files for you. In C, you close each `FILE*` yourself. The OS reclaims a leaked `FILE*` at process exit, but a long-running program cannot rely on that.

## Watch out

- Close each opened file on every return path, error paths included. Else a descriptor leaks.
- A long-running program that leaks descriptors runs out of them.
- `fopen` returns `NULL` when the file does not exist or the program has no permission. Check before you use it.
- `"w"` truncates an existing file to zero bytes at once, even if you write nothing.
- No single mode reads and creates when missing. Use `"r"` and handle `NULL`, or use `"a"`.
- Raw binary `int` files depend on the machine's endianness and `int` size. Do not use them between systems.
- A binary file is fine as a temporary file that the same program reads back.
- These functions do not allocate. The caller owns each buffer. Each function opens and closes its own `FILE*`.

## The task

Write five functions. None of them allocates memory. Each one opens and closes its own files.

1. `int count_lines(const char *filename)` returns the number of lines that end with `'\n'`.
2. `long file_size(const char *filename)` returns the file size in bytes. Use `fseek` and `ftell`.
3. `int copy_file(const char *src, const char *dst)` copies all bytes from `src` to `dst`.
4. `copy_file` creates or truncates `dst`. It returns `0` on success and `-1` on error.
5. `int write_ints(const char *filename, const int *arr, int n)` writes `n` ints from `arr` in binary.
6. `write_ints` returns `0` on success and `-1` on error.
7. `int read_ints(const char *filename, int *arr, int max_n)` reads binary ints into the buffer `arr`.
8. `read_ints` reads at most `max_n` ints. It returns the number of ints it read.
9. `count_lines`, `file_size` and `read_ints` return `-1` if `fopen` cannot open the file.

An empty file has 0 lines and 0 bytes. A file with fewer ints than `max_n` gives a smaller count.

```c
// notes.txt: "alpha\nbeta\ngamma\n"
count_lines("notes.txt");      // 3
// notes.txt: "single\n"
count_lines("notes.txt");      // 1
// notes.txt: ""
count_lines("notes.txt");      // 0
file_size("notes.txt");        // 0
count_lines("/no/such/file");  // -1

// notes.txt: "hello" (no newline)
file_size("notes.txt");        // 5

// copy.txt gets the same bytes
copy_file("notes.txt", "copy.txt"); // 0

int data[] = {10, 20, 30, 40, 50};
write_ints("data.bin", data, 5);    // 0

// buf starts {10, 20, 30, 40, 50}
int buf[10] = {0};
read_ints("data.bin", buf, 10);     // 5
// small is {10, 20}
int small[2];
read_ints("data.bin", small, 2);    // 2
```
