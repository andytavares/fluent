#include <stdio.h>

// CLAMP(x, lo, hi) clamps x to [lo, hi]. x must not have side effects.
// TODO: replace 0 with the correct expression
#define CLAMP(x, lo, hi) (0)

// IS_POWER_OF_TWO(n) evaluates to 1 if n is a positive power of two.
// TODO: replace 0 with the correct expression
#define IS_POWER_OF_TWO(n) (0)

// ARRAY_LEN(arr) evaluates to the number of elements in a stack-allocated array.
// TODO: replace 0 with the correct expression
#define ARRAY_LEN(arr) (0)

// debug_enabled returns 1 if the DEBUG macro is defined at compile time.
int debug_enabled(void) {
    // TODO
    return 0;
}

// platform_id returns 1 (Linux), 2 (macOS), or 0 (unknown).
int platform_id(void) {
    // TODO
    return 0;
}

int main(void) {
    printf("CLAMP(15, 0, 10) = %d\n", CLAMP(15, 0, 10));
    printf("IS_POWER_OF_TWO(8) = %d\n", IS_POWER_OF_TWO(8));
    int arr[] = {1, 2, 3, 4, 5};
    printf("ARRAY_LEN = %zu\n", ARRAY_LEN(arr));
    printf("debug_enabled = %d\n", debug_enabled());
    printf("platform_id = %d\n", platform_id());
    return 0;
}
