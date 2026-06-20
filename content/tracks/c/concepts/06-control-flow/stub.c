#include <stdio.h>

/* count_digits returns the number of decimal digits in n.
 * Treat negative numbers as their absolute value. 0 has one digit. */
int count_digits(int n) {
    /* TODO */
    return 0;
}

/* sum_evens returns the sum of all even integers from 2 to limit (inclusive).
 * Returns 0 if limit < 2. */
int sum_evens(int limit) {
    /* TODO */
    return 0;
}

/* fizzbuzz_value returns:
 *   0 if n is divisible by both 3 and 5
 *   1 if n is divisible by 3 only
 *   2 if n is divisible by 5 only
 *   3 otherwise */
int fizzbuzz_value(int n) {
    /* TODO */
    return 0;
}

/* day_type returns 0 for weekday (Mon-Fri), 1 for weekend (Sat-Sun).
 * day is 1=Mon, 2=Tue, ..., 6=Sat, 7=Sun.
 * Returns -1 for invalid input. */
int day_type(int day) {
    /* TODO */
    return 0;
}

/* collatz_steps returns the number of steps to reach 1 via the Collatz sequence.
 * If n is even: n = n/2. If n is odd: n = 3*n+1. Assume n >= 1. */
int collatz_steps(int n) {
    /* TODO */
    return 0;
}

#ifndef TESTING
int main(void) {
    printf("count_digits(0)    = %d\n", count_digits(0));     /* 1 */
    printf("count_digits(100)  = %d\n", count_digits(100));   /* 3 */
    printf("count_digits(-42)  = %d\n", count_digits(-42));   /* 2 */
    printf("sum_evens(10)      = %d\n", sum_evens(10));        /* 30 */
    printf("fizzbuzz_value(15) = %d\n", fizzbuzz_value(15));   /* 0 */
    printf("fizzbuzz_value(9)  = %d\n", fizzbuzz_value(9));    /* 1 */
    printf("day_type(1)        = %d\n", day_type(1));          /* 0 */
    printf("day_type(7)        = %d\n", day_type(7));          /* 1 */
    printf("collatz_steps(1)   = %d\n", collatz_steps(1));     /* 0 */
    printf("collatz_steps(6)   = %d\n", collatz_steps(6));     /* 8 */
    return 0;
}
#endif
