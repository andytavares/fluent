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

## Watch out

- `Point a, Point b` passed by value means the **whole struct is copied** into the function's stack frame on every call. For a two-`double` struct this is cheap; for a struct with a large array member, prefer a `const Point *` parameter to avoid the copy.
- `return (Point){...};` — the compound literal syntax — only works in C99 and later. It builds a temporary struct value and returns it by value; there's no reference or pointer involved, so returning a local struct this way is always safe (unlike returning a pointer to a local).
- `Point p3 = {0};` zero-initializes *all* fields, not just the first — a common shorthand, not a partial initialization.
- There's no struct equality operator (`==` doesn't work on structs in C) — comparing two `Point`s means comparing `.x` and `.y` individually.

## The task

Given this typedef (already in the stub):
```c
typedef struct { double x; double y; } Point;
```

Implement three functions. All three take `Point` arguments and return `Point` (or `double`) *by value* — there's no allocation and no pointer ownership to track.

- `double point_distance(Point a, Point b)` — the Euclidean distance between two points: `sqrt((b.x - a.x)^2 + (b.y - a.y)^2)`
- `Point point_midpoint(Point a, Point b)` — the point halfway between `a` and `b`: `((a.x + b.x) / 2, (a.y + b.y) / 2)`
- `Point point_translate(Point p, double dx, double dy)` — `p` shifted by `(dx, dy)`: `(p.x + dx, p.y + dy)`

```c
Point origin = {0.0, 0.0};
Point p      = {3.0, 4.0};

point_distance(origin, p);       // 5.0  — classic 3-4-5 triangle
point_distance(origin, origin);  // 0.0  — distance to self

point_midpoint(origin, p);       // {1.5, 2.0}
point_midpoint(p, p);            // {3.0, 4.0} — midpoint of a point with itself is itself

point_translate(p, 1.0, -1.0);   // {4.0, 3.0}
point_translate(origin, -5.0, 2.5); // {-5.0, 2.5}
```
