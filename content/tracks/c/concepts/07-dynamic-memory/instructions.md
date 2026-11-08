## What you build

You write four functions that allocate, resize, copy and reverse heap memory. C has no garbage collector: you request memory with `malloc` and release it with `free`. This lesson builds on **Control Flow**.

## Key concepts

### `malloc` and `calloc` allocate on the heap

`malloc` leaves the memory uninitialized. `calloc` sets it to zero.

```c
#include <stdlib.h>

// Uninitialized
int *a = malloc(10 * sizeof(int));
// Zero-initialized
int *b = calloc(10, sizeof(int));
```

### Always check for `NULL`

`malloc` returns `NULL` when the allocation fails.

```c
int *p = malloc(n * sizeof(int));
if (p == NULL) return NULL;
```

### `realloc` resizes a block

On failure, `realloc` returns `NULL` and does not free the original block. The original pointer stays valid.

```c
int *bigger =
    realloc(arr, new_size * sizeof(int));
if (bigger == NULL) {
    // arr is still valid: free it
    free(arr);
    return NULL;
}
arr = bigger;
```

### `free` releases a block

Set the pointer to `NULL` after `free`. A later use then fails as a clear `NULL` dereference.

```c
free(arr);
arr = NULL;
```

Never free the same pointer twice. Never use memory after you free it.

### Copy a string onto the heap

Allocate one more byte than `strlen` for the `'\0'`.

```c
#include <string.h>

char *dup = malloc(strlen(s) + 1);
if (dup) strcpy(dup, s);
```

### Tools find memory bugs

On Linux, run `valgrind --leak-check=full ./program`. On macOS, run `leaks`. AddressSanitizer (`-fsanitize=address`) catches use-after-free and double-free at runtime.

### Every `malloc` needs one `free`

C++ releases memory in destructors through RAII and smart pointers (`unique_ptr`, `shared_ptr`), and Java, Go, JavaScript and Python use a garbage collector. C has none of these. You track the owner of each block yourself. Correct code gets deterministic memory management with no overhead.

## Watch out

- `realloc` can return a different address. Never use the old pointer after the call.
- If `realloc` fails, the original block is still allocated. Free it, or it leaks.
- Double-free is undefined behavior. It can corrupt the allocator and crash later, in unrelated code.
- After use-after-free, the memory can look correct for a while. Then other code overwrites it.
- Reading `malloc` memory before you write it is undefined behavior. You get garbage, not zero.
- That is the reason `calloc` exists: it zero-initializes the block.
- Each function below states who owns its result. A missing `free` leaks. A wrong `free` crashes.

## The task

Write four functions. Each one states who owns the memory.

1. `int* create_int_array(int size)` allocates a heap array of `size` ints, all zero.
2. The caller owns the result of `create_int_array` and must `free` it. It returns `NULL` if allocation fails.
3. `int* resize_array(int* arr, int old_size, int new_size)` resizes `arr` from `old_size` to `new_size` elements.
4. `arr` comes from `create_int_array` or an earlier `resize_array` call.
5. `resize_array` keeps the existing values up to the smaller size. New slots must be zero.
6. The caller owns the returned pointer and must `free` it. Never use the old `arr` again.
7. On allocation failure, `resize_array` returns `NULL`. Then `arr` keeps its contents and the caller still owns it.
8. `char* string_duplicate(const char* s)` returns a heap copy of `s`, including its `'\0'`.
9. The caller owns the copy and must `free` it. It returns `NULL` if allocation fails.
10. `void reverse_in_place(int* arr, int size)` reverses `size` elements of `arr` in place.
11. `reverse_in_place` does not allocate. The caller owns `arr`.
12. If `size == 0`, `reverse_in_place` does nothing. `arr` can be `NULL` then.

The copy of `""` is a new empty string. Shrinking keeps the first `new_size` values.

```c
// {0, 0, 0, 0, 0}
int *arr = create_int_array(5);
arr[0] = 1; arr[1] = 2; arr[2] = 3;

// {1, 2, 3, 0, 0, 0}. Do not use arr.
int *big = resize_array(arr, 3, 6);
// {1, 2}. Do not use big.
int *small = resize_array(big, 6, 2);
free(small);

// "hello", a new heap pointer
char *dup = string_duplicate("hello");
free(dup);
// "", not NULL
char *empty = string_duplicate("");
free(empty);

int nums[] = {1, 2, 3, 4, 5};
// {5, 4, 3, 2, 1}
reverse_in_place(nums, 5);
int two[] = {7, 8};
reverse_in_place(two, 2);  // {8, 7}
int one[] = {42};
reverse_in_place(one, 1);  // {42}
// Does nothing, does not crash
reverse_in_place(NULL, 0);
```
