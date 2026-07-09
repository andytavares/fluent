# Structs

## What you'll learn

Go has no classes and no inheritance. Instead you define `struct` types to group data, and attach behavior with **methods** — functions with an extra receiver parameter. Building on functions from lesson 2, this lesson is about choosing between value and pointer receivers, which is the first genuinely Go-specific design decision you'll make in every type you write from here on.

## Key concepts

**Define a struct** — just a named collection of fields:

```go
type Rectangle struct {
    Width  float64
    Height float64
}
```

**Instantiate** with field names (order-independent) or positionally (order-dependent, fragile — avoid it):

```go
r := Rectangle{Width: 4, Height: 3}   // preferred
r := Rectangle{4, 3}                   // works, but breaks if fields are reordered
```

**Methods with a value receiver** — the method gets a **copy** of the struct; can't mutate the original, use for reads:

```go
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}
```

**Methods with a pointer receiver** — the method gets a pointer to the original; can mutate it, and avoids copying for large structs:

```go
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}
```

**Structs are value types** — assigning or passing one copies every field, unlike passing an object reference in Java, Python, or JavaScript:

```go
a := Rectangle{Width: 4, Height: 3}
b := a          // b is an independent copy
b.Width = 100
// a.Width is still 4
```

## Watch out

- **Mixing receiver types on the same struct is legal but confusing** — pick value receivers if the struct is small and methods never mutate, pointer receivers if any method mutates or the struct is large. Go convention: be consistent across all methods of a type.
- Calling a pointer-receiver method on an **addressable** value auto-takes the address (`r.Scale(2)` works even if `r` is a plain `Rectangle`, not `*Rectangle`) — but it does **not** work on a value that isn't addressable, like a map value (`myMap["r"].Scale(2)` is a compile error).
- Struct equality with `==` compares every field and only compiles if all fields are themselves comparable (no slices, maps, or funcs as fields). Two structs with identical field values are `==` even though they're different variables — unlike reference types in other languages.
- Passing a large struct by value to a function copies the whole thing on every call. This is rarely a real bottleneck, but it's why APIs over large structs typically take a pointer.

## The task

Define a `Rectangle` struct with two `float64` fields, `Width` and `Height`, and implement two value-receiver methods on it.

**`Area() float64`** — returns `Width * Height`.

**`Perimeter() float64`** — returns `2 * (Width + Height)`.

```go
r := Rectangle{Width: 4, Height: 3}
r.Area()        // 12
r.Perimeter()   // 14

square := Rectangle{Width: 5, Height: 5}
square.Area()       // 25
square.Perimeter()  // 20

flat := Rectangle{Width: 0, Height: 10}
flat.Area()       // 0
flat.Perimeter()  // 20
```
