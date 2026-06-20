# Interfaces

## What you'll learn

Go interfaces are implicit — a type satisfies an interface just by implementing its methods. No `implements` keyword needed.

## Key concepts

**Define an interface:**

```go
type Shape interface {
    Area() float64
    Perimeter() float64
}
```

**Any type implementing those methods satisfies the interface automatically:**

```go
type Circle struct { Radius float64 }
func (c Circle) Area() float64      { return math.Pi * c.Radius * c.Radius }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.Radius }
// Circle now satisfies Shape — no declaration needed
```

**Use the interface:**

```go
func printShape(s Shape) {
    fmt.Printf("area=%.2f perimeter=%.2f\n", s.Area(), s.Perimeter())
}
```

## The task

The `Shape` interface is already defined. Implement a `Circle` struct with field `Radius float64` and methods `Area() float64` and `Perimeter() float64`.

Use `math.Pi` from the `math` package. Area = π r², Perimeter = 2πr.
