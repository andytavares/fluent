## What you build

You define a `Rectangle` struct with `Area` and `Perimeter` methods. Go has no classes and no inheritance: structs hold data and methods add behavior. This lesson builds on **Maps**.

## Key concepts

### A struct is a named set of fields

```go
type Rectangle struct {
    Width  float64
    Height float64
}
```

### Use field names when you create a struct

Field names work in any order. A positional literal breaks when someone reorders the fields.

```go
// preferred
r := Rectangle{Width: 4, Height: 3}
// works, but fragile
r := Rectangle{4, 3}
```

### A value receiver gets a copy

A method is a function with a receiver parameter. A value receiver cannot change the original, so use it for reads.

```go
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}
```

### A pointer receiver can change the original

It also avoids a copy of a large struct.

```go
func (r *Rectangle) Scale(f float64) {
    r.Width *= f
    r.Height *= f
}
```

### Structs are value types

Assignment copies every field. Java, Python and JavaScript copy an object reference instead.

```go
a := Rectangle{Width: 4, Height: 3}
b := a
b.Width = 100
// a.Width is still 4
```

## Watch out

- Mixed receiver types are legal but confusing. Use one receiver type for all methods of a type.
- Use value receivers for small structs that no method changes. Use pointer receivers otherwise.
- `r.Scale(2)` on an addressable `Rectangle` takes the address for you.
- A map value is not addressable. `myMap["r"].Scale(2)` is a compile error.
- `==` compares every field. It compiles only if no field is a slice, map or function.
- Two different variables with equal fields are `==`.
- Each call copies a struct that you pass by value. APIs for large structs usually take a pointer.

## The task

Define a `Rectangle` struct with two `float64` fields, `Width` and `Height`. Add two value-receiver methods.

1. `Area() float64` returns `Width * Height`.
2. `Perimeter() float64` returns `2 * (Width + Height)`.

A zero side gives an area of `0`. Fractional sides work the same way.

```go
r := Rectangle{Width: 4, Height: 3}
r.Area()      // 12
r.Perimeter() // 14

sq := Rectangle{Width: 5, Height: 5}
sq.Area()      // 25
sq.Perimeter() // 20

flat := Rectangle{Width: 0, Height: 10}
flat.Area()      // 0
flat.Perimeter() // 20

Rectangle{Width: 2.5, Height: 4}.Area()
// 10
Rectangle{Width: 1, Height: 1}.Perimeter()
// 4
```
