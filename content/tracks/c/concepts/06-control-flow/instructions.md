# Control Flow

## What you'll learn

C's control flow is the template that most later languages copied. The syntax is nearly identical to Java, C++, and JavaScript — the differences are in the edges: `switch` fallthrough is the default, there's no `foreach`, and the ternary operator is an expression you can nest (but shouldn't).

## Key concepts

**if / else if / else**
```c
if (x > 0) {
    puts("positive");
} else if (x < 0) {
    puts("negative");
} else {
    puts("zero");
}
```

**Ternary operator** — an expression, not a statement:
```c
int abs_val = (x >= 0) ? x : -x;
```

**switch / case** — fall-through is the *default*. You must `break` to stop:
```c
switch (day) {
    case 1: puts("Mon"); break;
    case 2: puts("Tue"); break;
    case 6:               /* intentional fall-through */
    case 7: puts("Weekend"); break;
    default: puts("Unknown");
}
```
`switch` only works on integer types (including `char`). No strings.

**for loop:**
```c
for (int i = 0; i < n; i++) {
    /* body */
}
```

**while / do-while:**
```c
while (n > 0) { n /= 2; }   /* test first */

do {
    input = read_char();
} while (input != '\n');     /* always runs at least once */
```

**break / continue / nested loops:**
```c
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        if (grid[i][j] == 0) continue;  /* skip this cell */
        if (grid[i][j] < 0) break;      /* break inner loop only */
    }
}
```
`break` exits only the *innermost* enclosing loop. C has no labeled breaks (unlike Java). Use a flag variable or `goto` (sparingly) to break out of nested loops.

**vs other languages:** Python uses `elif` and colons, no braces. Java and JS have identical syntax but Java's `switch` also defaults to fall-through. Go's `switch` does *not* fall through by default — the opposite of C. JavaScript's `for...of` has no C equivalent; C only has the classic index-based `for`.

## The task

Implement these five functions:

- `int count_digits(int n)` — count the number of decimal digits in `n` (treat negatives as their absolute value; `0` has one digit)
- `int sum_evens(int limit)` — return the sum of all even integers from 2 up to and including `limit` (if `limit < 2`, return 0)
- `int fizzbuzz_value(int n)` — return 0 for FizzBuzz (divisible by both 3 and 5), 1 for Fizz (3 only), 2 for Buzz (5 only), 3 otherwise
- `int day_type(int day)` — `day` is 1=Mon…7=Sun; return 0 for weekday, 1 for weekend (Sat/Sun); return -1 for invalid input
- `int collatz_steps(int n)` — count steps to reach 1 via the Collatz sequence (if even: n/2; if odd: 3n+1); assume n >= 1
