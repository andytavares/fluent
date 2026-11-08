## What you build

You write `swap`, `sum_array` and `reverse_array`. Each one reads or changes the caller's memory through pointers. This lesson builds on **Functions**.

## Key concepts

### A pointer holds an address

A pointer is a variable that holds the memory address of another variable. C uses pointers for pass-by-reference, for array parameters and for dynamic memory.

```c
int value = 42;
// ptr holds the address of value
int *ptr = &value;

printf("%d\n", *ptr);  // prints 42
// Changes value through ptr
*ptr = 100;
printf("%d\n", value); // prints 100
```

### `&` takes an address, `*` follows it

| Operator | Meaning |
|----------|---------|
| `&x`     | The address of `x`. It gives a pointer. |
| `*ptr`   | The value at `ptr` (dereference). |

### A pointer parameter lets a function change the caller's variable

Pass the address. The function writes through it.

```c
void increment(int *n) {
    (*n)++;
}

int x = 5;
increment(&x);
printf("%d\n", x);  // 6
```

### An array name decays to a pointer

An array name becomes a pointer to its first element. The parameters `int *arr` and `int arr[]` are equivalent.

```c
int sum(const int *arr, int n) {
    int total = 0;
    for (int i = 0; i < n; i++)
        total += arr[i];
    return total;
}
```

### `const` can apply to the data or to the pointer

`const int *p` points to a constant `int`. You cannot write `*p = ...`, but you can change `p`. `int *const p` is a constant pointer. You can write `*p = ...`, but you cannot change `p`.

### You manage pointers yourself

Most languages hide pointers behind references, smart pointers or garbage collection. In C, a `NULL` dereference crashes the program. You get no `NullPointerException` and no stack trace.

## Watch out

- Dereferencing `NULL` or an unset pointer is undefined behavior. The compiler does not catch it and can miscompile around it.
- A pointer to a local variable dangles when its function returns. Never return `&local_var`.
- `arr[i]` and `*(arr + i)` are the same operation. For `n` elements, `arr[n]` is out of bounds.
- These functions use memory the caller owns. They do not allocate and do not call `free`.

## The task

Each function reads or changes memory that the caller owns: stack arrays and local variables. No function allocates memory.

1. `void swap(int *a, int *b)` swaps the values at the two addresses.
2. `a` and `b` are non-`NULL` pointers to existing `int` values.
3. `int sum_array(const int *arr, int n)` returns the sum of the `n` integers that start at `arr`.
4. `sum_array` only reads the array. If `n == 0`, it returns `0`.
5. `void reverse_array(int *arr, int n)` reverses the `n` elements of `arr` in place.
6. If `n` is `0` or `1`, `reverse_array` leaves `arr` unchanged.

Negative values follow the same rules.

```c
int x = 3, y = 7;
swap(&x, &y);         // x == 7, y == 3

int a = -1, b = 1;
swap(&a, &b);         // a == 1, b == -1

int nums[] = {1, 2, 3, 4, 5};
sum_array(nums, 5);   // 15
sum_array(nums, 1);   // 1
sum_array(nums, 0);   // 0

int neg[] = {-1, -2, -3};
sum_array(neg, 3);    // -6

// nums becomes {5, 4, 3, 2, 1}
reverse_array(nums, 5);

int one[] = {42};
reverse_array(one, 1); // one == {42}
reverse_array(one, 0); // one == {42}
```
