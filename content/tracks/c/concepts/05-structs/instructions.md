## What you build

You write three functions on a `Point` struct: distance, midpoint and translate. A `struct` groups related data into one named type. This lesson builds on **Pointers**.

## Key concepts

### A struct holds only data

A class in an OOP language bundles data and methods. A C `struct` holds only data, and the functions that use it are separate.

```c
struct Point {
    double x;
    double y;
};
```

### `typedef` removes the `struct` keyword

With a `typedef`, you write `Point` instead of `struct Point`.

```c
typedef struct {
    double x;
    double y;
} Point;

Point p = {3.0, 4.0};
```

### Three ways to initialize

Designated initializers need C99 or later. They are the preferred form. `{0}` sets every field to zero, not only the first.

```c
// Positional
Point p1 = {1.0, 2.0};
// Designated (C99+, preferred)
Point p2 = {.x = 1.0, .y = 2.0};
// Zero-initialize all fields
Point p3 = {0};
```

### `.` for a value, `->` for a pointer

`ptr->x` is the same as `(*ptr).x`.

```c
p.x;
Point *ptr = &p;
ptr->x;
```

### C passes structs by value

A struct argument is a copy. For a large struct, pass a pointer instead.

```c
double distance(const Point *a,
                const Point *b) {
    double dx = b->x - a->x;
    double dy = b->y - a->y;
    return sqrt(dx*dx + dy*dy);
}
```

### A compound literal builds a struct value

`return (Point){...};` builds a temporary struct and returns it by value. It needs C99 or later. It returns no pointer, so it is always safe, unlike a pointer to a local.

```c
return (Point){p.x + dx, p.y + dy};
```

### No methods and no access control

C structs have no methods, constructors, destructors or access control. All fields are public. To simulate encapsulation, use opaque pointers and naming conventions.

## Watch out

- A struct parameter copies the whole struct on each call. For a large array member, use `const Point *`.
- `{0}` sets all fields to zero. It is a full initialization, not a partial one.
- `==` does not work on structs. Compare `.x` and `.y` one by one.

## The task

The stub already has this `typedef`:

```c
typedef struct {
    double x;
    double y;
} Point;
```

Write three functions. Each one takes `Point` values and returns its result by value. You allocate nothing.

1. `double point_distance(Point a, Point b)` returns the Euclidean distance between `a` and `b`.
2. The distance is `sqrt((b.x - a.x)^2 + (b.y - a.y)^2)`.
3. `Point point_midpoint(Point a, Point b)` returns the point halfway between `a` and `b`.
4. The midpoint is `((a.x + b.x) / 2, (a.y + b.y) / 2)`.
5. `Point point_translate(Point p, double dx, double dy)` returns `(p.x + dx, p.y + dy)`.

The distance from a point to itself is `0.0`. The distance is the same in both directions. The midpoint of a point with itself is that point.

```c
Point o = {0.0, 0.0};
Point p = {3.0, 4.0};
Point q = {6.0, 8.0};

point_distance(o, p);   // 5.0
point_distance(p, o);   // 5.0
point_distance(o, o);   // 0.0
point_distance(o, q);   // 10.0

point_midpoint(o, p);   // {1.5, 2.0}
point_midpoint(p, p);   // {3.0, 4.0}

// {4.0, 3.0}
point_translate(p, 1.0, -1.0);
// {-5.0, 2.5}
point_translate(o, -5.0, 2.5);
```
