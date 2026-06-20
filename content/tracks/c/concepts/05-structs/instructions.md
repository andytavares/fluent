# Structs

## What you'll learn

A `struct` is C's way of grouping related data into a single named type. Where a class bundles data and methods in OOP languages, a C `struct` holds only data — functions that operate on it are separate.

## Key concepts

**Defining a struct:**
```c
struct Point {
    double x;
    double y;
};
```

**typedef** removes the need to write `struct` everywhere:
```c
typedef struct {
    double x;
    double y;
} Point;

Point p = {3.0, 4.0};  /* no `struct` keyword needed */
```

**Initialization:**
```c
Point p1 = {1.0, 2.0};               /* positional */
Point p2 = {.x = 1.0, .y = 2.0};    /* designated (C99+, preferred) */
Point p3 = {0};                       /* zero-initialize all fields */
```

**Accessing fields:**
```c
p.x;             /* direct member access */
Point *ptr = &p;
ptr->x;          /* pointer member access — equivalent to (*ptr).x */
```

**Passing structs:** Structs are passed by value (copied). For large structs, pass a pointer:
```c
double distance(const Point *a, const Point *b) {
    double dx = b->x - a->x;
    double dy = b->y - a->y;
    return sqrt(dx*dx + dy*dy);
}
```

**vs other languages:** C structs have no methods, no constructors, no destructors, and no access control. All fields are public. Use opaque pointer patterns and naming conventions to simulate encapsulation when needed.

## The task

Given this typedef (already in the stub):
```c
typedef struct { double x; double y; } Point;
```

Implement three functions:

- `double point_distance(Point a, Point b)` — Euclidean distance between two points
- `Point point_midpoint(Point a, Point b)` — point halfway between a and b
- `Point point_translate(Point p, double dx, double dy)` — return p shifted by (dx, dy)
