#include <stdio.h>

int max(int a, int b) {
    return a > b ? a : b;
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int is_palindrome(int n) {
    int original = n, reversed = 0;
    while (n > 0) {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    return original == reversed ? 1 : 0;
}

int main(void) {
    printf("max(3, 7) = %d\n", max(3, 7));
    printf("factorial(5) = %d\n", factorial(5));
    printf("is_palindrome(121) = %d\n", is_palindrome(121));
    printf("is_palindrome(123) = %d\n", is_palindrome(123));
    return 0;
}
