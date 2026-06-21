# Traits

## What you'll learn

Traits are Rust's mechanism for shared behavior — analogous to interfaces in Go and Java, but with default method implementations, blanket impls, and a coherence rule that prevents conflicting implementations across crates.

## Key concepts

**Defining a trait.** A trait declares method signatures, optionally with default implementations.

```rust
trait Summary {
    fn summarize_author(&self) -> String;

    // default implementation — can be overridden
    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}
```

**Implementing a trait.**

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
        format!("{}: {}...", self.author, &self.content[..50.min(self.content.len())])
    }
}
```

**Trait bounds** constrain generic parameters. Both syntaxes are equivalent:

```rust
fn notify(item: &impl Summary) { ... }               // impl Trait syntax
fn notify<T: Summary>(item: &T) { ... }              // trait bound syntax
fn notify<T: Summary + Display>(item: &T) { ... }    // multiple bounds
```

**`dyn Trait`** — dynamic dispatch. Use when the concrete type is not known at compile time (e.g., a heterogeneous collection). Costs a vtable lookup per call.

```rust
fn largest_summary(items: &[Box<dyn Summary>]) -> String {
    items.iter().map(|i| i.summarize()).max().unwrap_or_default()
}
```

**Common standard library traits.**

- `Display` (`fmt::Display`) — controls `{}` formatting
- `Debug` (`fmt::Debug`) — controls `{:?}` formatting; usually `#[derive(Debug)]`
- `Clone` — explicit `.clone()` deep copy
- `PartialEq` / `Eq` — `==` operator
- `PartialOrd` / `Ord` — comparison and sorting
- `Iterator` — unlocks the entire iterator adapter chain

**`#[derive]`** auto-implements standard traits when all fields support them:

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point { x: f64, y: f64 }
```

## vs other languages

| | Rust traits | Go interfaces | Java interfaces | TypeScript interfaces |
|---|---|---|---|---|
| Default methods | yes | no | yes (Java 8+) | no |
| Implemented by | explicit `impl Trait for Type` | implicit (structural) | explicit `implements` | structural |
| Operator overload | via traits (`Add`, `Mul`, etc.) | no | no | no |
| Coherence | one impl per (trait, type) pair | N/A | N/A | N/A |
| Dynamic dispatch | `dyn Trait` (explicit) | always (interface value) | always (vtable) | always (structural) |

Go's structural interfaces are convenient but mean any type satisfying the method set accidentally implements the interface. Rust requires an explicit `impl Trait for Type` — accidental implementation is impossible.

## The task

Define a trait `Area` and implement it for two types:

```rust
trait Area {
    fn area(&self) -> f64;
    // Default: return a description string "shape with area X.XX"
    fn describe(&self) -> String { ... }
}

struct Circle { pub radius: f64 }
struct Triangle { pub base: f64, pub height: f64 }

// Implement Area for Circle  (π * r²)
// Implement Area for Triangle  (0.5 * base * height)

// Accept any type implementing Area and return its describe() string.
fn print_area(shape: &impl Area) -> String
```
