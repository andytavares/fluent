# Structs & Enums

## What you'll learn

Rust's `struct` and `enum` are the primary tools for creating custom types. Enums in Rust are algebraic data types — each variant can carry different data — which makes them far more expressive than enums in C, Java, or Go.

## Key concepts

**Named struct.** Fields are private by default (within the module). Use `pub` to expose them.

```rust
struct Point {
    x: f64,
    y: f64,
}

let p = Point { x: 1.0, y: 2.5 };
println!("{}", p.x);
```

**Tuple struct.** When names don't add clarity.

```rust
struct Meters(f64);
let d = Meters(3.5);
println!("{}", d.0);
```

**Unit struct.** No fields — useful as marker types or with traits.

```rust
struct Sentinel;
```

**`impl` blocks** attach methods. `self` (consumed), `&self` (read), `&mut self` (mutate). Associated functions (no `self`) act as constructors — conventionally named `new`.

```rust
impl Point {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    pub fn distance_from_origin(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }
}
```

**Enum with data.** Each variant is its own type. Variants can hold named fields, tuple fields, or nothing.

```rust
enum Shape {
    Circle(f64),             // radius
    Rectangle(f64, f64),    // width, height
    Triangle { base: f64, height: f64 },
}
```

**`Option<T>`.** The standard way to represent an optional value. There is no `null` in Rust.

```rust
fn divide(a: f64, b: f64) -> Option<f64> {
    if b == 0.0 { None } else { Some(a / b) }
}
```

**`Result<T, E>`.** The standard way to represent a fallible operation.

```rust
fn parse_positive(s: &str) -> Result<u32, String> {
    s.parse::<u32>().map_err(|e| e.to_string())
}
```

## vs other languages

| | Rust | Go | C++ | Java |
|---|---|---|---|---|
| Null safety | **`Option<T>`** — no null | nil (runtime panic) | nullptr (UB risk) | null (NPE) |
| Enum variants with data | yes (ADT) | no | tagged union (C++17) | no (sealed classes in Kotlin) |
| Methods on types | `impl` block | methods on struct | member functions | instance methods |
| Error type | `Result<T, E>` | `(T, error)` | exceptions / error codes | exceptions |

Go's nil and Java's null are runtime phenomena. Rust's `Option` is a compile-time type — you cannot accidentally dereference `None` without the compiler forcing you to handle it.

## The task

Implement a `Rectangle` struct and a `Shape` enum:

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    // Constructor
    fn new(width: f64, height: f64) -> Self

    // Return width * height
    fn area(&self) -> f64

    // Return true if width == height
    fn is_square(&self) -> bool
}

enum Shape {
    Circle(f64),          // radius
    Rect(Rectangle),
}

// Return the area of any Shape.
fn shape_area(shape: &Shape) -> f64
```
