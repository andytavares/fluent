/*
 * Build: gcc -o test stub.c pointers_test.c && ./test
 * (Guard main() in stub.c with #ifndef TESTING.)
 */
#include <stdio.h>
#include <string.h>

void swap(int *a, int *b);
int  sum_array(const int *arr, int n);
void reverse_array(int *arr, int n);

static int passed = 0, failed = 0;

#define CHECK_INT(name, expected, actual) \
    do { \
        int _e = (expected), _a = (actual); \
        if (_e == _a) { printf("  PASS: %s\n", name); passed++; } \
        else { printf("  FAIL: %s — expected %d, got %d\n", name, _e, _a); failed++; } \
    } while (0)

static int arr_eq(const int *a, const int *b, int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    /* swap */
    int x = 3, y = 7;
    swap(&x, &y);
    CHECK_INT("swap: x becomes 7", 7, x);
    CHECK_INT("swap: y becomes 3", 3, y);

    int a = -1, b = 1;
    swap(&a, &b);
    CHECK_INT("swap negative: a becomes 1",  1, a);
    CHECK_INT("swap negative: b becomes -1", -1, b);

    /* sum_array */
    int arr1[] = {1, 2, 3, 4, 5};
    CHECK_INT("sum_array [1..5]", 15, sum_array(arr1, 5));
    CHECK_INT("sum_array n=1",     1, sum_array(arr1, 1));
    CHECK_INT("sum_array n=0",     0, sum_array(arr1, 0));

    int arr2[] = {-1, -2, -3};
    CHECK_INT("sum_array negatives", -6, sum_array(arr2, 3));

    /* reverse_array */
    int fwd[] = {1, 2, 3, 4, 5};
    int rev[] = {5, 4, 3, 2, 1};
    reverse_array(fwd, 5);
    int ok_rev = arr_eq(fwd, rev, 5);
    if (ok_rev) { printf("  PASS: reverse [1..5]\n"); passed++; }
    else        { printf("  FAIL: reverse [1..5]\n"); failed++; }

    int single[] = {42};
    reverse_array(single, 1);
    CHECK_INT("reverse single element", 42, single[0]);

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
