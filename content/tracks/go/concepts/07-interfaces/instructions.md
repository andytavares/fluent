## What you build

You write a `Circle` type that satisfies the `Shape` interface. Go interfaces are implicit: a type satisfies an interface when it has the methods. This lesson builds on **Structs**.

## Key concepts

### An interface is a set of method signatures

```go
type Shape interface {
    Area() float64
    Perimeter() float64
}
```

### A type satisfies an interface with no declaration

There is no `implements` keyword. A type can satisfy an interface that a different package defines later, without knowing it exists. Java, C# and TypeScript work differently.

```go
type Circle struct{ Radius float64 }

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}
// Circle now satisfies Shape
```

### An interface parameter accepts any satisfying type

```go
func printShape(s Shape) {
    fmt.Printf(
        "area=%.2f perimeter=%.2f\n",
        s.Area(), s.Perimeter())
}
```

### Type assertions recover the concrete type

A type assertion or a type switch gets the concrete value behind an interface value.

```go
if c, ok := s.(Circle); ok {
    fmt.Println("radius:", c.Radius)
}

switch v := s.(type) {
case Circle:
    fmt.Println("circle", v.Radius)
default:
    fmt.Println("other shape")
}
```

### `any` holds a value of any type

`any` is an alias for `interface{}`, and every type satisfies it. Use it rarely, for example in JSON decoding.

```go
var x any = 42
x = "now a string"
```

## Watch out

- An interface that holds a `nil` pointer is not `nil`. It still has a type.
- After `var c *Circle; var s Shape = c`, `s == nil` is `false`.
- If all methods have pointer receivers, only `*T` satisfies the interface. Assigning a `T` is a compile error.
- The compiler checks a direct assignment. A type assertion is a runtime check.
- A failed type assertion without `, ok` panics.
- Prefer small interfaces with one method, such as `Reader`, `Writer` and `Stringer`. Accept interfaces, return structs.

## The task

The `Shape` interface already has two methods, `Area() float64` and `Perimeter() float64`. Write a `Circle` struct that satisfies it.

1. `Circle` has one field, `Radius float64`.
2. `Area() float64` returns `math.Pi * Radius * Radius`. Import `"math"`.
3. `Perimeter() float64` returns `2 * math.Pi * Radius`.
4. `Circle` satisfies `Shape` with no extra declaration.

A radius of `0` gives `0` for both methods.

```go
Circle{Radius: 1}.Area() // math.Pi
Circle{Radius: 2}.Area() // 4 * math.Pi
Circle{Radius: 5}.Area() // 25 * math.Pi
Circle{Radius: 0}.Area() // 0
// 6 * math.Pi
Circle{Radius: 3}.Perimeter()
Circle{Radius: 0}.Perimeter() // 0

// compiles with no extra declaration
var s Shape = Circle{Radius: 1}
```
