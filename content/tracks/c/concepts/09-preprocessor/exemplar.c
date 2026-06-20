#include <stdio.h>

#define CLAMP(x, lo, hi) ((x) < (lo) ? (lo) : ((x) > (hi) ? (hi) : (x)))

#define IS_POWER_OF_TWO(n) ((n) > 0 && ((n) & ((n) - 1)) == 0)

#define ARRAY_LEN(arr) (sizeof(arr) / sizeof((arr)[0]))

int debug_enabled(void) {
#ifdef DEBUG
    return 1;
#else
    return 0;
#endif
}

int platform_id(void) {
#if defined(__linux__)
    return 1;
#elif defined(__APPLE__)
    return 2;
#else
    return 0;
#endif
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
