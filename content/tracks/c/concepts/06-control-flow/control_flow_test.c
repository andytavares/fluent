/*
 * Build: gcc -DTESTING -o test stub.c control_flow_test.c && ./test
 */
#include <stdio.h>

/* Forward declarations of learner-implemented functions. */
int count_digits(int n);
int sum_evens(int limit);
int fizzbuzz_value(int n);
int day_type(int day);
int collatz_steps(int n);

static int passed = 0, failed = 0;

#define CHECK_INT(name, expected, actual) \
    do { \
        int _e = (expected), _a = (actual); \
        if (_e == _a) { printf("  PASS: %s\n", name); passed++; } \
        else { printf("  FAIL: %s — expected %d, got %d\n", name, _e, _a); failed++; } \
    } while (0)

int main(void) {
    /* count_digits */
    CHECK_INT("count_digits(0)",         1, count_digits(0));
    CHECK_INT("count_digits(9)",         1, count_digits(9));
    CHECK_INT("count_digits(10)",        2, count_digits(10));
    CHECK_INT("count_digits(100)",       3, count_digits(100));
    CHECK_INT("count_digits(-42)",       2, count_digits(-42));
    CHECK_INT("count_digits(999)",       3, count_digits(999));

    /* sum_evens */
    CHECK_INT("sum_evens(0)",            0, sum_evens(0));
    CHECK_INT("sum_evens(1)",            0, sum_evens(1));
    CHECK_INT("sum_evens(2)",            2, sum_evens(2));
    CHECK_INT("sum_evens(10)",          30, sum_evens(10));
    CHECK_INT("sum_evens(11)",          30, sum_evens(11));

    /* fizzbuzz_value */
    CHECK_INT("fizzbuzz(15) FizzBuzz",   0, fizzbuzz_value(15));
    CHECK_INT("fizzbuzz(30) FizzBuzz",   0, fizzbuzz_value(30));
    CHECK_INT("fizzbuzz(9)  Fizz",       1, fizzbuzz_value(9));
    CHECK_INT("fizzbuzz(10) Buzz",       2, fizzbuzz_value(10));
    CHECK_INT("fizzbuzz(7)  other",      3, fizzbuzz_value(7));

    /* day_type */
    CHECK_INT("day_type Mon=weekday",    0, day_type(1));
    CHECK_INT("day_type Fri=weekday",    0, day_type(5));
    CHECK_INT("day_type Sat=weekend",    1, day_type(6));
    CHECK_INT("day_type Sun=weekend",    1, day_type(7));
    CHECK_INT("day_type 0=invalid",     -1, day_type(0));
    CHECK_INT("day_type 8=invalid",     -1, day_type(8));

    /* collatz_steps */
    CHECK_INT("collatz_steps(1)",        0, collatz_steps(1));
    CHECK_INT("collatz_steps(2)",        1, collatz_steps(2));
    CHECK_INT("collatz_steps(4)",        2, collatz_steps(4));
    CHECK_INT("collatz_steps(6)",        8, collatz_steps(6));
    CHECK_INT("collatz_steps(27)",     111, collatz_steps(27));

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
