// Compile: gcc -o test preprocessor_test.c && ./test
// To test debug_enabled with DEBUG defined: gcc -DDEBUG -o test preprocessor_test.c && ./test
#include <stdio.h>

// pull in the macros and functions from stub
#define CLAMP(x, lo, hi) ((x) < (lo) ? (lo) : ((x) > (hi) ? (hi) : (x)))
#define IS_POWER_OF_TWO(n) ((n) > 0 && ((n) & ((n) - 1)) == 0)
#define ARRAY_LEN(arr) (sizeof(arr) / sizeof((arr)[0]))
int debug_enabled(void);
int platform_id(void);

static int passed = 0, failed = 0;
#define CHECK(name, cond) \
    do { if (cond) { printf("  PASS: %s\n", name); passed++; } \
         else      { printf("  FAIL: %s\n", name); failed++; } } while(0)

int main(void) {
    // CLAMP
    CHECK("CLAMP: below lo returns lo", CLAMP(-5, 0, 10) == 0);
    CHECK("CLAMP: above hi returns hi", CLAMP(15, 0, 10) == 10);
    CHECK("CLAMP: within range unchanged", CLAMP(5, 0, 10) == 5);
    CHECK("CLAMP: equal to lo", CLAMP(0, 0, 10) == 0);
    CHECK("CLAMP: equal to hi", CLAMP(10, 0, 10) == 10);

    // IS_POWER_OF_TWO
    CHECK("IS_POWER_OF_TWO: 1", IS_POWER_OF_TWO(1) == 1);
    CHECK("IS_POWER_OF_TWO: 2", IS_POWER_OF_TWO(2) == 1);
    CHECK("IS_POWER_OF_TWO: 8", IS_POWER_OF_TWO(8) == 1);
    CHECK("IS_POWER_OF_TWO: 1024", IS_POWER_OF_TWO(1024) == 1);
    CHECK("IS_POWER_OF_TWO: 0", IS_POWER_OF_TWO(0) == 0);
    CHECK("IS_POWER_OF_TWO: 3", IS_POWER_OF_TWO(3) == 0);
    CHECK("IS_POWER_OF_TWO: 6", IS_POWER_OF_TWO(6) == 0);

    // ARRAY_LEN
    int arr3[] = {1, 2, 3};
    CHECK("ARRAY_LEN: 3-element array", ARRAY_LEN(arr3) == 3);
    char str[10];
    CHECK("ARRAY_LEN: char[10]", ARRAY_LEN(str) == 10);

    // debug_enabled — compiled without -DDEBUG in this test
    int dbg = debug_enabled();
    CHECK("debug_enabled: returns 0 or 1", dbg == 0 || dbg == 1);

    // platform_id
    int pid = platform_id();
    CHECK("platform_id: returns 0, 1, or 2", pid == 0 || pid == 1 || pid == 2);
#if defined(__linux__)
    CHECK("platform_id: linux = 1", pid == 1);
#elif defined(__APPLE__)
    CHECK("platform_id: macos = 2", pid == 2);
#endif

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
