# Structs

## What you'll learn

Go has no classes. Instead, you define `struct` types and attach methods to them.

## Key concepts

**Define a struct:**

```go
type Rectangle struct {
    Width  float64
    Height float64
}
```

**Instantiate:**

```go
r := Rectangle{Width: 4, Height: 3}
```

**Methods — value receiver** (can't mutate, used for reads):

```go
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}
```

**Methods — pointer receiver** (can mutate, prefer when struct is large):

```go
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}
```

## The task

Implement a `Rectangle` struct with fields `Width` and `Height` (both `float64`), and two methods:

1. `Area() float64` — returns `Width * Height`
2. `Perimeter() float64` — returns `2 * (Width + Height)`
