#include <stdio.h>

int count_digits(int n) {
    if (n == 0) return 1;
    if (n < 0) n = -n;
    int count = 0;
    while (n > 0) {
        n /= 10;
        count++;
    }
    return count;
}

int sum_evens(int limit) {
    int sum = 0;
    for (int i = 2; i <= limit; i += 2) {
        sum += i;
    }
    return sum;
}

int fizzbuzz_value(int n) {
    if (n % 15 == 0) return 0;
    if (n % 3  == 0) return 1;
    if (n % 5  == 0) return 2;
    return 3;
}

int day_type(int day) {
    switch (day) {
        case 1: case 2: case 3: case 4: case 5:
            return 0;
        case 6: case 7:
            return 1;
        default:
            return -1;
    }
}

int collatz_steps(int n) {
    int steps = 0;
    while (n != 1) {
        n = (n % 2 == 0) ? n / 2 : 3 * n + 1;
        steps++;
    }
    return steps;
}

#ifndef TESTING
int main(void) {
    printf("count_digits(0)    = %d\n", count_digits(0));
    printf("count_digits(100)  = %d\n", count_digits(100));
    printf("count_digits(-42)  = %d\n", count_digits(-42));
    printf("sum_evens(10)      = %d\n", sum_evens(10));
    printf("fizzbuzz_value(15) = %d\n", fizzbuzz_value(15));
    printf("fizzbuzz_value(9)  = %d\n", fizzbuzz_value(9));
    printf("day_type(1)        = %d\n", day_type(1));
    printf("day_type(7)        = %d\n", day_type(7));
    printf("collatz_steps(1)   = %d\n", collatz_steps(1));
    printf("collatz_steps(6)   = %d\n", collatz_steps(6));
    return 0;
}
#endif
