#include <stdio.h>
#include <math.h>

typedef struct {
    double x;
    double y;
} Point;

double point_distance(Point a, Point b) {
    double dx = b.x - a.x;
    double dy = b.y - a.y;
    return sqrt(dx * dx + dy * dy);
}

Point point_midpoint(Point a, Point b) {
    return (Point){(a.x + b.x) / 2.0, (a.y + b.y) / 2.0};
}

Point point_translate(Point p, double dx, double dy) {
    return (Point){p.x + dx, p.y + dy};
}

int main(void) {
    Point origin = {0.0, 0.0};
    Point p      = {3.0, 4.0};
    printf("distance: %.1f\n", point_distance(origin, p));
    Point mid = point_midpoint(origin, p);
    printf("midpoint: (%.1f, %.1f)\n", mid.x, mid.y);
    Point translated = point_translate(p, 1.0, -1.0);
    printf("translated: (%.1f, %.1f)\n", translated.x, translated.y);
    return 0;
}
