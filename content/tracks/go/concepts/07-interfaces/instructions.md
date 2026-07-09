# Interfaces

## What you'll learn

Building on structs and methods from the last lesson: Go interfaces are **implicit**. A type satisfies an interface simply by implementing its methods — there's no `implements` keyword, and a type can satisfy an interface that was defined after the type itself, even in a package that doesn't know the type exists. This is Go's answer to polymorphism, and it's structurally very different from Java/C#/TypeScript interfaces.

## Key concepts

**Define an interface** as a set of method signatures:

```go
type Shape interface {
    Area() float64
    Perimeter() float64
}
```

**Any type implementing those methods satisfies the interface automatically** — no declaration, no annotation:

```go
type Circle struct { Radius float64 }
func (c Circle) Area() float64      { return math.Pi * c.Radius * c.Radius }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.Radius }
// Circle now satisfies Shape — nothing else needed
```

**Use the interface** as a parameter type — any satisfying type can be passed:

```go
func printShape(s Shape) {
    fmt.Printf("area=%.2f perimeter=%.2f\n", s.Area(), s.Perimeter())
}
```

**Type assertions and type switches** recover the concrete type behind an interface value:

```go
if circle, ok := s.(Circle); ok {
    fmt.Println("radius:", circle.Radius)
}

switch v := s.(type) {
case Circle:
    fmt.Println("circle, radius", v.Radius)
default:
    fmt.Println("some other shape")
}
```

**The empty interface `any`** (alias for `interface{}`) is satisfied by every type — it's Go's escape hatch for "any value", used sparingly (e.g. in generic-style containers before generics, or JSON decoding).

## Watch out

- **The nil-interface gotcha**: an interface value holding a `nil` pointer of a concrete type is **not itself `nil`**. `var c *Circle; var s Shape = c; s == nil` is `false` — `s` has a type (`*Circle`) even though its value is nil. This trips up almost everyone the first time they compare a returned interface to `nil`.
- Whether a method has a **value or pointer receiver** determines whether the *pointer* type, the *value* type, or both satisfy the interface. A type with only pointer-receiver methods is satisfied by `*T`, not `T` — assigning a plain `T` to an interface variable in that case is a compile error.
- Interface satisfaction is checked at **compile time** for direct assignments, but type assertions (`s.(Circle)`) are a **runtime check** — a failed assertion without the `, ok` form panics.
- Small, single-method interfaces (`Reader`, `Writer`, `Stringer`) are idiomatic Go — prefer several narrow interfaces over one large one ("accept interfaces, return structs").

## The task

The `Shape` interface is already defined with two methods, `Area() float64` and `Perimeter() float64`. Implement a `Circle` struct with one field, `Radius float64`, and both methods, so that `Circle` satisfies `Shape`.

**`Area() float64`** — returns `math.Pi * Radius * Radius` (import `"math"` for `math.Pi`).

**`Perimeter() float64`** — returns `2 * math.Pi * Radius`.

```go
c := Circle{Radius: 1}
c.Area()        // math.Pi          ≈ 3.14159...
c.Perimeter()   // 2 * math.Pi      ≈ 6.28318...

c2 := Circle{Radius: 5}
c2.Area()       // 25 * math.Pi     ≈ 78.5398...
c2.Perimeter()  // 10 * math.Pi     ≈ 31.4159...

zero := Circle{Radius: 0}
zero.Area()       // 0
zero.Perimeter()  // 0

// Circle must satisfy Shape without any extra declaration:
var s Shape = Circle{Radius: 2}
```
