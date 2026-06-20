#include <stdio.h>
#include <math.h>

typedef struct {
    double x;
    double y;
} Point;

/* point_distance returns the Euclidean distance between a and b. */
double point_distance(Point a, Point b) {
    /* TODO */
    return 0.0;
}

/* point_midpoint returns the point halfway between a and b. */
Point point_midpoint(Point a, Point b) {
    /* TODO */
    return (Point){0.0, 0.0};
}

/* point_translate returns p shifted by (dx, dy). */
Point point_translate(Point p, double dx, double dy) {
    /* TODO */
    return p;
}

int main(void) {
    Point origin = {0.0, 0.0};
    Point p      = {3.0, 4.0};
    printf("distance: %.1f\n", point_distance(origin, p));  /* 5.0 */
    Point mid = point_midpoint(origin, p);
    printf("midpoint: (%.1f, %.1f)\n", mid.x, mid.y);       /* (1.5, 2.0) */
    Point translated = point_translate(p, 1.0, -1.0);
    printf("translated: (%.1f, %.1f)\n", translated.x, translated.y); /* (4.0, 3.0) */
    return 0;
}
