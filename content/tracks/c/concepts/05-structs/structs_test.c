/*
 * Build: gcc -o test stub.c structs_test.c -lm && ./test
 */
#include <stdio.h>
#include <math.h>

typedef struct { double x; double y; } Point;

double point_distance(Point a, Point b);
Point  point_midpoint(Point a, Point b);
Point  point_translate(Point p, double dx, double dy);

static int passed = 0, failed = 0;

#define CHECK_DOUBLE(name, expected, actual, eps) \
    do { \
        double _e = (expected), _a = (actual); \
        if (fabs(_e - _a) < (eps)) { printf("  PASS: %s\n", name); passed++; } \
        else { printf("  FAIL: %s — expected %.4f, got %.4f\n", name, _e, _a); failed++; } \
    } while (0)

int main(void) {
    Point origin = {0.0, 0.0};
    Point p      = {3.0, 4.0};
    Point q      = {6.0, 8.0};

    CHECK_DOUBLE("distance 3-4-5",   5.0,  point_distance(origin, p), 1e-9);
    CHECK_DOUBLE("distance 0",       0.0,  point_distance(origin, origin), 1e-9);
    CHECK_DOUBLE("distance symmetric",5.0, point_distance(p, origin), 1e-9);
    CHECK_DOUBLE("distance 6-8-10",  10.0, point_distance(origin, q), 1e-9);

    Point mid = point_midpoint(origin, p);
    CHECK_DOUBLE("midpoint x", 1.5, mid.x, 1e-9);
    CHECK_DOUBLE("midpoint y", 2.0, mid.y, 1e-9);

    Point same_mid = point_midpoint(p, p);
    CHECK_DOUBLE("midpoint same x", 3.0, same_mid.x, 1e-9);
    CHECK_DOUBLE("midpoint same y", 4.0, same_mid.y, 1e-9);

    Point t = point_translate(p, 1.0, -1.0);
    CHECK_DOUBLE("translate x", 4.0, t.x, 1e-9);
    CHECK_DOUBLE("translate y", 3.0, t.y, 1e-9);

    Point t2 = point_translate(origin, -5.0, 2.5);
    CHECK_DOUBLE("translate neg x", -5.0, t2.x, 1e-9);
    CHECK_DOUBLE("translate pos y",  2.5, t2.y, 1e-9);

    printf("\n%d passed, %d failed\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
