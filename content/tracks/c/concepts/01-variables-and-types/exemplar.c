#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int clamp(int value, int min_val, int max_val) {
    if (value < min_val) return min_val;
    if (value > max_val) return max_val;
    return value;
}

double celsius_to_fahrenheit(double c) {
    return c * 9.0 / 5.0 + 32.0;
}

int main(void) {
    printf("add(2, 3) = %d\n", add(2, 3));
    printf("clamp(15, 0, 10) = %d\n", clamp(15, 0, 10));
    printf("0 C = %.1f F\n", celsius_to_fahrenheit(0.0));
    return 0;
}
