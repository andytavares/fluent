## What you build

You write an `Area` trait with a default method and implement it for two shapes. A trait defines shared behavior, like an interface in Go or Java. This lesson builds on **Pattern Matching**.

## Key concepts

### A trait declares methods and can give defaults

A trait lists method signatures. A method can have a default body that an implementation can override.

```rust
trait Summary {
    fn summarize_author(&self) -> String;

    // Default: an impl can override it
    fn summarize(&self) -> String {
        format!("(Read more from {}...)",
            self.summarize_author())
    }
}
```

### `impl Trait for Type` implements a trait

You implement a trait explicitly. Go interfaces are structural, so a type can implement one by accident. In Rust, an accidental implementation cannot occur.

```rust
struct Article {
    author: String,
    content: String,
}

impl Summary for Article {
    fn summarize_author(&self) -> String {
        self.author.clone()
    }

    fn summarize(&self) -> String {
        let n = 50.min(self.content.len());
        let text = &self.content[..n];
        format!("{}: {}...",
            self.author, text)
    }
}
```

### A trait bound limits a generic parameter

`impl Trait` in a parameter and `<T: Trait>` mean the same thing. Use `+` for more than one bound.

```rust
// impl Trait syntax
fn notify(item: &impl Summary) { }
// Trait bound syntax
fn notify<T: Summary>(item: &T) { }
// Two bounds
fn notify<T: Summary + Display>(
    item: &T) { }
```

### `dyn Trait` uses dynamic dispatch

Use `dyn Trait` when the concrete type is unknown at compile time, for example in a collection of mixed types. Each call costs a vtable lookup.

```rust
fn largest_summary(
    items: &[Box<dyn Summary>],
) -> String {
    items.iter()
        .map(|i| i.summarize())
        .max()
        .unwrap_or_default()
}
```

### The standard library defines common traits

- `Display` (`fmt::Display`) controls `{}` formatting.
- `Debug` (`fmt::Debug`) controls `{:?}` formatting. You usually derive it.
- `Clone` gives an explicit `.clone()` deep copy.
- `PartialEq` and `Eq` give the `==` operator.
- `PartialOrd` and `Ord` give comparison and sorting.
- `Iterator` gives the full chain of iterator adapters.
- Operator traits such as `Add` and `Mul` overload operators.

### `#[derive]` implements standard traits for you

`#[derive]` works when all fields implement the trait.

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point { x: f64, y: f64 }
```

### Coherence allows one impl per trait and type

Only one implementation can exist for each pair of trait and type. This rule prevents conflicting implementations across crates.

## Watch out

- You can call a trait method only when the trait is in scope. Bring it in with `use`.
- A trait that is not in scope gives a "method not found" error. The impl exists, but the scope is wrong.
- A trait is private to its module by default. Declare it `pub` to use it outside the module.
- You write a default method such as `describe` once. Its `self.area()` call runs the `area` of each type.

## The task

Write a trait `Area` and implement it for a circle and a triangle.

1. `pub trait Area` has the required method `fn area(&self) -> f64`.
2. `Area` has the default method `fn describe(&self) -> String`. It returns `"shape with area X.XX"`, with the area rounded to two decimal places.
3. `struct Circle { pub radius: f64 }` implements `Area`. Its area is π × r². Use `std::f64::consts::PI`.
4. `struct Triangle { pub base: f64, pub height: f64 }` implements `Area`. Its area is 0.5 × `base` × `height`.
5. `fn print_area(shape: &impl Area) -> String` returns `shape.describe()`.

A zero radius or a zero base gives an area of `0.0`.

```rust
Circle { radius: 1.0 }.area()
// π, about 3.14159
Circle { radius: 0.0 }.area()  // 0.0
Circle { radius: 2.0 }.area()
// 4π, about 12.566

let t = Triangle {
    base: 6.0, height: 4.0 };
t.area()  // 12.0
let t0 = Triangle {
    base: 0.0, height: 10.0 };
t0.area()  // 0.0

let c = Circle { radius: 3.0 };
print_area(&c)
// "shape with area 28.27"
let t2 = Triangle {
    base: 10.0, height: 2.0 };
print_area(&t2)
// "shape with area 10.00"
```
