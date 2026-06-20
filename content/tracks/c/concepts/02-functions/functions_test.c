/*
 * Build: gcc -o test stub.c functions_test.c && ./test
 * (Remove or guard the main() in stub.c with #ifndef TESTING before linking.)
 */
#include <stdio.h>

int max(int a, int b);
int factorial(int n);
int is_palindrome(int n);

static int passed = 0, failed = 0;

#define CHECK_INT(name, expected, actual) \
    do { \
        int _e = (expected), _a = (actual); \
        if (_e == _a) { printf("  PASS: %s\n", name); passed++; } \
        else { printf("  FAIL: %s — expected %d, got %d\n", name, _e, _a); failed++; } \
    } while (0)

int main(void) {
    CHECK_INT("max(3,7)",   7, max(3, 7));
    CHECK_INT("max(7,3)",   7, max(7, 3));
    CHECK_INT("max(5,5)",   5, max(5, 5));
    CHECK_INT("max(-1,-2)", -1, max(-1, -2));

    CHECK_INT("factorial(0)",  1,   factorial(0));
    CHECK_INT("factorial(1)",  1,   factorial(1));
    CHECK_INT("factorial(5)",  120, factorial(5));
    CHECK_INT("factorial(7)",  5040, factorial(7));

    CHECK_INT("is_palindrome(0)",    1, is_palindrome(0));
    CHECK_INT("is_palindrome(1)",    1, is_palindrome(1));
    CHECK_INT("is_palindrome(121)",  1, is_palindrome(121));
    CHECK_INT("is_palindrome(1221)", 1, is_palindrome(1221));
    CHECK_INT("is_palindrome(123)",  0, is_palindrome(123));
    CHECK_INT("is_palindrome(120)",  0, is_palindrome(120));

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
