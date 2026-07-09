# Pointers

## What you'll learn

A pointer is a variable that holds the memory address of another variable. Pointers are how C achieves pass-by-reference, how arrays are passed to functions, and how dynamic memory allocation works.

## Key concepts

**Declaring and using a pointer:**
```c
int value = 42;
int *ptr = &value;   /* ptr holds the address of value */

printf("%d\n", *ptr);  /* dereference: prints 42 */
*ptr = 100;            /* modifies value through ptr */
printf("%d\n", value); /* prints 100 */
```

**Address-of (`&`) and dereference (`*`):**
| Operator | Meaning |
|----------|---------|
| `&x`     | "the address of x" — produces a pointer |
| `*ptr`   | "the value at ptr" — dereference |

**Passing a pointer to a function** lets the function mutate the caller's variable:
```c
void increment(int *n) {
    (*n)++;
}

int x = 5;
increment(&x);
printf("%d\n", x);  /* 6 */
```

**Arrays and pointers:** An array name decays to a pointer to its first element. You can pass an array to a function as `int *arr` or `int arr[]` — they are equivalent:
```c
int sum(const int *arr, int n) {
    int total = 0;
    for (int i = 0; i < n; i++) total += arr[i];
    return total;
}
```

**`const int *p`** — pointer to a constant int (you cannot write `*p = ...` but you can change `p`).  
**`int *const p`** — constant pointer to int (you can write `*p = ...` but cannot change `p`).

**vs other languages:** Most languages hide pointers behind references, smart pointers, or garbage collection. In C, you manage them directly — power and responsibility in equal measure. A NULL pointer dereference crashes your program; there is no NullPointerException with a stack trace.

## Watch out

- Dereferencing `NULL` (or any pointer that hasn't been set) is undefined behavior — usually a segfault, but the compiler is not required to catch it, and in some cases will silently miscompile around it.
- A pointer to a local variable becomes **dangling** the instant the function that owns it returns — never return `&local_var` from a function.
- `arr[i]` and `*(arr + i)` are exactly the same operation in C; pointer arithmetic *is* array indexing. Walking `n` elements from `arr` means valid indices are `0` through `n - 1` — `arr[n]` is one past the end and out of bounds.
- None of the functions below own their input: `swap`, `sum_array`, and `reverse_array` all operate on caller-allocated memory. No allocation, no `free` — the caller's array/variables outlive the call unchanged in size.

## The task

You're given caller-owned memory (stack arrays and local variables) to read or mutate through pointers — none of these functions allocate anything.

- `void swap(int *a, int *b)` — swap the values at the two addresses; `a` and `b` are non-NULL pointers to existing `int`s
- `int sum_array(const int *arr, int n)` — return the sum of the `n` integers starting at `arr` (a `const` pointer: the array is read but never modified); if `n == 0`, return `0`
- `void reverse_array(int *arr, int n)` — reverse the `n` elements of `arr` in place; if `n == 0` or `n == 1`, leave `arr` unchanged

```c
int x = 3, y = 7;
swap(&x, &y);              // x == 7, y == 3

int nums[] = {1, 2, 3, 4, 5};
sum_array(nums, 5);         // 15
sum_array(nums, 0);         // 0  — no elements to sum

reverse_array(nums, 5);     // nums becomes {5, 4, 3, 2, 1}

int single[] = {42};
reverse_array(single, 1);   // single unchanged: {42}
```
