# Dynamic Memory

## What you'll learn

C gives you direct control over heap allocation. There is no garbage collector — you request memory with `malloc` and release it with `free`. Get it wrong and you get memory leaks, double-frees, or use-after-free bugs. Get it right and you have deterministic, zero-overhead memory management.

## Key concepts

**Allocating memory:**
```c
#include <stdlib.h>

int *arr = malloc(10 * sizeof(int));  // uninitialized
int *arr = calloc(10, sizeof(int));   // zero-initialized
```

Always check the return value — `malloc` returns `NULL` if allocation fails:
```c
int *p = malloc(n * sizeof(int));
if (p == NULL) return NULL;  // handle failure
```

**Resizing:**
```c
int *bigger = realloc(arr, new_size * sizeof(int));
if (bigger == NULL) {
    free(arr);   // original pointer still valid; realloc didn't free it
    return NULL;
}
arr = bigger;
```

**Freeing:**
```c
free(arr);
arr = NULL;  // convention: null the pointer after freeing to catch use-after-free
```

Never `free` the same pointer twice (double-free is undefined behavior). Never access memory after freeing it (use-after-free).

**String duplication:**
```c
#include <string.h>

char *dup = malloc(strlen(s) + 1);  // +1 for the null terminator
if (dup) strcpy(dup, s);
```

**Diagnosing leaks:** Run with `valgrind --leak-check=full ./program` on Linux, or `leaks` on macOS. Tools like AddressSanitizer (`-fsanitize=address`) catch use-after-free and double-free at runtime.

**vs other languages:** Java, Go, JavaScript, and Python all have garbage collectors — you allocate and forget, and the runtime reclaims memory automatically. C++ adds RAII and smart pointers (`unique_ptr`, `shared_ptr`) so destructors release memory deterministically without a GC. C has none of that: every `malloc` must have a matching `free`, and you must track ownership manually.

## The task

Implement the following functions in `stub.c`:

- `int* create_int_array(int size)` — allocate a zero-initialized array of `size` ints; return `NULL` on failure
- `int* resize_array(int* arr, int old_size, int new_size)` — resize the array; if growing, new slots must be zero; return the new pointer (caller must free), or `NULL` on failure
- `char* string_duplicate(const char* s)` — allocate and return a copy of `s`; caller must free; return `NULL` on failure
- `void reverse_in_place(int* arr, int size)` — reverse the array in place (no extra allocation needed)
