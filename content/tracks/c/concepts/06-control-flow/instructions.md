## What you build

You write five functions that use `if`, `switch` and loops. Most later languages copied C's control flow. The differences are at the edges: `switch` falls through, and C has no `foreach`. This lesson builds on **Structs**.

## Key concepts

### `if` / `else if` / `else`

The condition goes in parentheses. Python uses `elif` and colons in place of `else if` and braces.

```c
if (x > 0) {
    puts("positive");
} else if (x < 0) {
    puts("negative");
} else {
    puts("zero");
}
```

### The ternary operator is an expression

`?:` gives a value, so you can use it in an assignment. You can nest it, but nested ternaries are hard to read.

```c
int abs_val = (x >= 0) ? x : -x;
```

### `switch` falls through by default

Each case runs into the next one until a `break`. Java's classic `switch` also falls through, but Go's `switch` does not.

```c
switch (day) {
    case 1: puts("Mon"); break;
    case 2: puts("Tue"); break;
    // Intentional fall-through
    case 6:
    case 7: puts("Weekend"); break;
    default: puts("Unknown");
}
```

`switch` works only on integer types, including `char`. It does not work on strings.

### `for` is index-based

C has only the classic index-based `for`. JavaScript's `for...of` has no C equivalent.

```c
for (int i = 0; i < n; i++) {
    // body
}
```

### `while` tests first, `do`-`while` tests last

A `do`-`while` body always runs at least once.

```c
while (n > 0) { n /= 2; }

do {
    input = read_char();
} while (input != '\n');
```

### `break` exits only the innermost loop

`continue` skips to the next iteration. C has no labeled `break`, unlike Java. To leave nested loops, use a flag variable or `goto`, sparingly.

```c
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        // Skip this cell
        if (grid[i][j] == 0) continue;
        // Exit the inner loop only
        if (grid[i][j] < 0) break;
    }
}
```

## Watch out

- A missing `break` is a silent bug, not a compile error. The case runs into the next case's body.
- Give each case a `break`, or a comment that marks the fall-through as intentional.
- Each `case` label must be an integer constant expression. C has no ranges, strings or variables there.
- `?:` is right-associative. Use it for one conditional value, not for chained logic.
- `while (1)` is a common event-loop pattern. Without a reachable `break` or `return`, the program hangs.

## The task

Write five functions. Each one uses a different control-flow construct.

1. `int count_digits(int n)` returns the number of decimal digits in the absolute value of `n`.
2. `count_digits(0)` returns `1`. The sign does not count.
3. `int sum_evens(int limit)` returns the sum of the even integers from `2` to `limit`, inclusive.
4. If `limit < 2`, `sum_evens` returns `0`.
5. `int fizzbuzz_value(int n)` returns `0` if `n` divides by 3 and by 5.
6. It returns `1` if `n` divides by 3 only, `2` if by 5 only, and `3` otherwise.
7. `int day_type(int day)` takes `1` for Monday to `7` for Sunday.
8. `day_type` returns `0` for Monday to Friday, and `1` for Saturday and Sunday.
9. `day_type` returns `-1` for a value outside `1..7`.
10. `int collatz_steps(int n)` counts the steps for `n` to reach `1` under the Collatz rule.
11. The Collatz rule: an even `n` becomes `n / 2`, and an odd `n` becomes `3n + 1`.
12. Assume `n >= 1`. `collatz_steps(1)` returns `0`.

```c
count_digits(0);    // 1
count_digits(9);    // 1
count_digits(100);  // 3
count_digits(-42);  // 2

sum_evens(1);       // 0
sum_evens(2);       // 2
sum_evens(10);      // 30
sum_evens(11);      // 30

fizzbuzz_value(15); // 0
fizzbuzz_value(9);  // 1
fizzbuzz_value(10); // 2
fizzbuzz_value(7);  // 3

day_type(1);        // 0
day_type(6);        // 1
day_type(0);        // -1
day_type(8);        // -1

collatz_steps(1);   // 0
// 6,3,10,5,16,8,4,2,1
collatz_steps(6);   // 8
collatz_steps(27);  // 111
```
