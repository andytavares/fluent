/*
 * Test runner — compiled together with the learner's stub.c (minus its main).
 * Build: gcc -o test stub.c variables_and_types_test.c -lm && ./test
 */
#include <stdio.h>
#include <math.h>

/* Forward declarations of learner-implemented functions. */
int add(int a, int b);
int clamp(int value, int min_val, int max_val);
double celsius_to_fahrenheit(double c);

static int passed = 0, failed = 0;

#define CHECK_INT(name, expected, actual) \
    do { \
        int _e = (expected), _a = (actual); \
        if (_e == _a) { printf("  PASS: %s\n", name); passed++; } \
        else { printf("  FAIL: %s — expected %d, got %d\n", name, _e, _a); failed++; } \
    } while (0)

#define CHECK_DOUBLE(name, expected, actual, eps) \
    do { \
        double _e = (expected), _a = (actual); \
        if (fabs(_e - _a) < (eps)) { printf("  PASS: %s\n", name); passed++; } \
        else { printf("  FAIL: %s — expected %.4f, got %.4f\n", name, _e, _a); failed++; } \
    } while (0)

int main(void) {
    CHECK_INT("add(2,3)",    5,  add(2, 3));
    CHECK_INT("add(0,0)",    0,  add(0, 0));
    CHECK_INT("add(-1,1)",   0,  add(-1, 1));
    CHECK_INT("add(-5,-3)", -8,  add(-5, -3));

    CHECK_INT("clamp: below min",   0,  clamp(-5, 0, 10));
    CHECK_INT("clamp: above max",  10,  clamp(15, 0, 10));
    CHECK_INT("clamp: within",      5,  clamp(5,  0, 10));
    CHECK_INT("clamp: at min",      0,  clamp(0,  0, 10));
    CHECK_INT("clamp: at max",     10,  clamp(10, 0, 10));

    CHECK_DOUBLE("0 C → 32 F",   32.0, celsius_to_fahrenheit(0.0),   0.001);
    CHECK_DOUBLE("100 C → 212 F",212.0, celsius_to_fahrenheit(100.0), 0.001);
    CHECK_DOUBLE("-40 C → -40 F",-40.0, celsius_to_fahrenheit(-40.0), 0.001);
    CHECK_DOUBLE("37 C → 98.6 F", 98.6, celsius_to_fahrenheit(37.0),  0.01);

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
