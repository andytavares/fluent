## What you build

You write a `Rectangle` struct with methods and a `Shape` enum, then compute the area of any shape. Each Rust enum variant can carry its own data, unlike enums in C, Java or Go. This lesson builds on **Borrowing & References**.

## Key concepts

### A named struct groups fields

Fields are private to the module by default. Use `pub` to expose them.

```rust
struct Point {
    x: f64,
    y: f64,
}

let p = Point { x: 1.0, y: 2.5 };
println!("{}", p.x);
```

### A tuple struct has fields without names

Use a tuple struct when names add no clarity.

```rust
struct Meters(f64);
let d = Meters(3.5);
println!("{}", d.0);
```

### A unit struct has no fields

Use a unit struct as a marker type or as a type for a trait.

```rust
struct Sentinel;
```

### An `impl` block adds methods

A method takes `self` to consume the value, `&self` to read it or `&mut self` to change it. A function with no `self` is an associated function. By convention, the constructor is an associated function named `new`.

```rust
impl Point {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    pub fn dist(&self) -> f64 {
        let sq = self.x * self.x
            + self.y * self.y;
        sq.sqrt()
    }
}
```

### Each enum variant can hold different data

A variant can hold tuple fields, named fields or no data.

```rust
enum Shape {
    // radius
    Circle(f64),
    // width, height
    Rectangle(f64, f64),
    Triangle { base: f64, height: f64 },
}
```

### `Option<T>` replaces null

Rust has no `null`. `Option<T>` is a compile-time type, so you cannot use a `None` value by accident. Go's `nil` and Java's `null` fail only at runtime.

```rust
fn divide(a: f64, b: f64)
    -> Option<f64> {
    if b == 0.0 { None }
    else { Some(a / b) }
}
```

### `Result<T, E>` holds a success or an error

A function that can fail returns `Result<T, E>`.

```rust
fn parse_positive(s: &str)
    -> Result<u32, String> {
    s.parse::<u32>()
        .map_err(|e| e.to_string())
}
```

## Watch out

- `pub struct Rectangle` does not make `Rectangle::new` public. Each method needs its own `pub`.
- Struct-literal syntax such as `Rectangle { width, height }` works only where the fields are visible.
- Keep fields private and offer a public `new` function. This is the usual encapsulation boundary in Rust.
- Tuple variants such as `Circle(f64)` hold data by position. Struct variants such as `Triangle { base, height }` hold data by name.
- A `match` pattern must use the same form as the variant declaration.

## The task

Write a `Rectangle` struct, a `Shape` enum and a function that returns the area of a shape.

1. `struct Rectangle` has the fields `width: f64` and `height: f64`.
2. `pub fn new(width: f64, height: f64) -> Self` builds a `Rectangle`.
3. `pub fn area(&self) -> f64` returns `width` times `height`.
4. `pub fn is_square(&self) -> bool` returns `true` if `width` equals `height`.
5. `enum Shape` has two variants: `Circle(f64)`, which holds the radius, and `Rect(Rectangle)`.
6. `fn shape_area(shape: &Shape) -> f64` returns the area of `shape`.
7. A circle has the area π × r². Use `std::f64::consts::PI`.
8. For `Rect`, `shape_area` returns `Rectangle::area` of the rectangle.

A zero side or a zero radius gives an area of `0.0`.

```rust
let r = Rectangle::new(4.0, 5.0);
r.area()       // 20.0
Rectangle::new(0.0, 10.0).area()
// 0.0

Rectangle::new(3.0, 3.0).is_square()
// true
Rectangle::new(3.0, 4.0).is_square()
// false

shape_area(&Shape::Circle(1.0))
// π, about 3.14159
shape_area(&Shape::Circle(0.0))
// 0.0

let rect = Rectangle::new(3.0, 4.0);
shape_area(&Shape::Rect(rect))
// 12.0
```
