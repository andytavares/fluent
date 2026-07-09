# Generics & Lifetimes

## What you'll learn

Generics let you write one function or struct that works for many types, with no runtime cost — Rust monomorphizes at compile time. Lifetimes are the mechanism that lets the borrow checker reason about how long references are valid when they span function boundaries.

## Key concepts

**Generic functions.** The type parameter goes in angle brackets after the function name.

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

**Generic structs.**

```rust
struct Pair<T> {
    first: T,
    second: T,
}

impl<T: std::fmt::Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.first >= self.second {
            println!("first: {}", self.first);
        } else {
            println!("second: {}", self.second);
        }
    }
}
```

**Monomorphization.** When you call `largest(&[1, 2, 3])`, the compiler generates a concrete `largest_i32` function. Zero runtime overhead — generics are not like Java generics with type erasure.

**Lifetime annotations.** When a function takes two references and returns one, the compiler needs to know which input the output borrows from. You declare this relationship with a lifetime parameter `'a`.

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

The annotation says: "the returned reference will be valid as long as both `x` and `y` are valid." You're not setting a lifetime — you're describing the relationship that already exists.

**Lifetime elision.** The compiler can infer lifetimes in common cases so you don't have to write them. The rules:
1. Each reference parameter gets its own lifetime.
2. If there is exactly one input reference, its lifetime is assigned to all outputs.
3. If there is a `&self` or `&mut self` parameter, its lifetime is assigned to all outputs.

```rust
fn first_word(s: &str) -> &str { ... } // elided — same as fn first_word<'a>(s: &'a str) -> &'a str
```

**`'static`** — a lifetime that lasts for the entire duration of the program. String literals are `&'static str`.

**Structs with references** require lifetime annotations:

```rust
struct Excerpt<'a> {
    part: &'a str,
}
```

## vs other languages

| | Rust | C++ templates | Go (generics) | Java generics |
|---|---|---|---|---|
| Mechanism | monomorphization | monomorphization | GCShape stenciling | type erasure |
| Runtime overhead | none | none | minimal | boxing overhead possible |
| Dangling reference prevention | lifetime annotations | manual, UB risk | N/A (GC) | N/A (GC) |
| Constraint syntax | `: Trait` bounds | `concept` (C++20) | `interface` constraints | `extends` / `super` |

Java generics erase type info at runtime — `List<String>` and `List<Integer>` are the same class at runtime. Rust monomorphizes: `Vec<String>` and `Vec<i32>` are genuinely different compiled types.

## Watch out

- Methods inside an `impl<T> SomeStruct<T>` block need their own `pub` if callers outside the module should use them — `pub struct Stack<T>` does not make `Stack::new` or any other associated function callable from elsewhere. This trips people up constantly: the struct is visible, the methods silently aren't.
- Turbofish (`::<T>`) disambiguates the type parameter when it can't be inferred, e.g. calling `first_element::<i32>(&[])` on an empty slice — there's no element to infer `T` from.
- A lifetime parameter is not a lifetime *value* you choose; it's a name for a relationship the compiler already sees in your code. If the compiler rejects your annotation, the fix is almost always to change what the function actually borrows from, not to relabel the lifetime.

## The task

Implement three generic utilities:

```rust
// Return the first element of a slice wrapped in Some, or None if empty.
// Works for any type T that implements Clone.
fn first_element<T: Clone>(slice: &[T]) -> Option<T>

// Return the longer of two string slices.
// If equal length, return the first.
// Requires a lifetime annotation.
fn longer<'a>(a: &'a str, b: &'a str) -> &'a str

// A generic LIFO stack backed by a Vec.
struct Stack<T> { ... }

impl<T> Stack<T> {
    pub fn new() -> Self
    pub fn push(&mut self, item: T)
    // Removes and returns the most recently pushed item, or None if empty.
    pub fn pop(&mut self) -> Option<T>
    // Returns a reference to the most recently pushed item without removing it.
    pub fn peek(&self) -> Option<&T>
    pub fn is_empty(&self) -> bool
}
```

```rust
first_element(&[1, 2, 3]);       // Some(1)
first_element::<i32>(&[]);       // None
first_element(&["a", "b"]);      // Some("a")

longer("hello", "hi");           // "hello"
longer("hi", "hello");           // "hello"
longer("abc", "xyz");            // "abc" — equal length, first wins
longer("", "a");                 // "a"

let mut s: Stack<i32> = Stack::new();
s.is_empty();   // true
s.pop();        // None
s.push(10);
s.push(20);
s.peek();       // Some(&20)
s.pop();        // Some(20) — LIFO
s.pop();        // Some(10)
s.is_empty();   // true
```
