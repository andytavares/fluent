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

## The task

Implement three functions:

- `void swap(int *a, int *b)` — swap the values at the two addresses
- `int sum_array(const int *arr, int n)` — return the sum of n integers starting at arr
- `void reverse_array(int *arr, int n)` — reverse arr in-place
