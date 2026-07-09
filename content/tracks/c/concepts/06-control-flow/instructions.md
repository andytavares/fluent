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

## Watch out

- **Missing `break` is a silent bug, not a compile error.** `case 1: puts("Mon");` with no `break` falls straight into `case 2`'s body. Every `case` needs an explicit `break` (or a comment marking intentional fall-through).
- `switch` requires **integer constant expressions** for each `case` label — no ranges (`case 1..5:` isn't C), no strings, no variables.
- The ternary `? :` is right-associative and easy to over-nest into unreadable code; use it for a single conditional value, not chained logic.
- An infinite `while (1)` loop with no reachable `break` is a valid, common pattern for event loops — but forgetting the `break`/return that was supposed to end it is a classic hang bug.

## The task

Implement these five functions:

- `int count_digits(int n)` — count the number of decimal digits in `n`'s absolute value (`0` counts as one digit)
- `int sum_evens(int limit)` — sum every even integer from `2` up to and including `limit`; if `limit < 2`, return `0`
- `int fizzbuzz_value(int n)` — return `0` if `n` is divisible by both 3 and 5, `1` if divisible by 3 only, `2` if divisible by 5 only, `3` otherwise
- `int day_type(int day)` — `day` is `1`=Mon … `7`=Sun; return `0` for a weekday (Mon-Fri), `1` for a weekend (Sat/Sun), `-1` for any value outside `1..7`
- `int collatz_steps(int n)` — count the steps for `n` to reach `1` under the Collatz rule (even: `n / 2`; odd: `3n + 1`); assume `n >= 1`; `collatz_steps(1)` is `0` (already there)

```c
count_digits(0);     // 1
count_digits(100);   // 3
count_digits(-42);   // 2  — sign is ignored

sum_evens(10);       // 30  — 2+4+6+8+10
sum_evens(1);        // 0   — no evens <= 1

fizzbuzz_value(15);  // 0  — divisible by 3 and 5
fizzbuzz_value(9);   // 1  — divisible by 3 only
fizzbuzz_value(10);  // 2  — divisible by 5 only
fizzbuzz_value(7);   // 3  — neither

day_type(1);   // 0   — Monday, weekday
day_type(6);   // 1   — Saturday, weekend
day_type(0);   // -1  — out of range
day_type(8);   // -1  — out of range

collatz_steps(1);   // 0
collatz_steps(6);   // 8   — 6,3,10,5,16,8,4,2,1
```
