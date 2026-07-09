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

## Watch out

- **`realloc` may move the block.** `realloc(arr, ...)` can return a *different* address than `arr`; always assign the result to a (possibly new) variable and never keep using the old pointer. If `realloc` fails, it returns `NULL` but the *original* pointer is still valid and still allocated — you must free it yourself or you'll leak it.
- **Double-free is undefined behavior**, not a safe no-op — freeing the same pointer twice can corrupt the heap allocator's internal bookkeeping and crash somewhere unrelated, much later.
- **Use-after-free** reads/writes through a pointer whose memory has already been returned to the allocator; the memory may look fine for a while and then get silently overwritten by something else. Setting a pointer to `NULL` right after `free` turns a future use-after-free into an obvious, safe-to-diagnose NULL dereference.
- `malloc` leaves memory **uninitialized** — reading it before writing is undefined behavior (garbage, not zero). `calloc` zero-initializes; that's the whole reason it exists as a separate function instead of just being `malloc` + `memset`.
- Every function below that returns a heap pointer documents who owns the result — see each function's note. Get the ownership wrong (forget to `free`, or `free` something you don't own) and you leak or crash.

## The task

Implement the following functions. Each documents its own memory-ownership contract — read it before writing code.

- `int* create_int_array(int size)` — allocate a zero-initialized array of `size` ints on the heap. **The caller owns the result and must `free` it.** Returns `NULL` if allocation fails.
- `int* resize_array(int* arr, int old_size, int new_size)` — resize a heap array previously returned by `create_int_array` (or a prior `resize_array` call) from `old_size` to `new_size` elements; any newly grown slots must be zero. **Returns the new pointer, which the caller now owns and must `free`** — the old `arr` pointer must not be used again after this call, whether or not the address changed. Returns `NULL` on allocation failure (in which case `arr` is untouched and still the caller's responsibility).
- `char* string_duplicate(const char* s)` — allocate a heap copy of the null-terminated string `s`, including its terminator. **The caller owns the result and must `free` it.** Returns `NULL` on allocation failure.
- `void reverse_in_place(int* arr, int size)` — reverse `size` elements of `arr` in place. No allocation, no ownership change — `arr` is caller-owned stack or heap memory that already existed before the call. `size == 0` is a no-op (and `arr` may be `NULL` in that case).

```c
int *arr = create_int_array(5);   // {0,0,0,0,0}, heap-allocated
arr[0] = 1; arr[1] = 2; arr[2] = 3;

int *big = resize_array(arr, 3, 6);
// big[0..2] == {1,2,3} preserved, big[3..5] == {0,0,0} newly zeroed
// `arr` must not be touched again — only `big` is valid now
free(big);

char *dup = string_duplicate("hello");  // heap copy, independent of the literal
// dup[0] == 'h', strcmp(dup, "hello") == 0
free(dup);

int nums[] = {1, 2, 3, 4, 5};   // stack array — reverse_in_place does not allocate
reverse_in_place(nums, 5);      // {5, 4, 3, 2, 1}
reverse_in_place(NULL, 0);      // no-op, must not crash
```
