# Borrowing & References

## What you'll learn

References let you use a value without taking ownership of it. Rust's borrow checker enforces a strict set of rules on references at compile time — the rules that make data races impossible.

## Key concepts

**Shared references `&T`.** You can have as many read-only references to a value as you like. The borrow checker ensures the original value lives at least as long as the reference.

```rust
fn print_len(s: &String) {
    println!("{}", s.len()); // s is borrowed, not moved
}

let owned = String::from("hello");
print_len(&owned);
println!("{}", owned); // still valid
```

**Mutable references `&mut T`.** You can have exactly one mutable reference to a value at a time — and while it exists, no shared references may be active.

```rust
fn shout(s: &mut String) {
    s.push('!');
}

let mut msg = String::from("hello");
shout(&mut msg);
println!("{}", msg); // "hello!"
```

**The borrow checker rules (compile-time):**
- At any given moment: either **one `&mut T`**, or **any number of `&T`** — never both.
- A reference must not outlive the value it refers to (no dangling pointers).

```rust
let r;
{
    let x = 5;
    r = &x;
} // x dropped here
println!("{}", r); // error[E0597]: `x` does not live long enough
```

**Slices `&[T]`.** A slice is a reference to a contiguous sequence — a fat pointer (pointer + length). `&str` is just `&[u8]` with a UTF-8 guarantee. Slices don't own their data.

```rust
let v = vec![1, 2, 3, 4, 5];
let middle: &[i32] = &v[1..4]; // [2, 3, 4]
println!("{:?}", middle);
```

**String slices `&str`.** You almost always want `&str` as a function parameter instead of `&String` — it's more flexible because it accepts both `String` borrows and string literals.

```rust
fn first_word(s: &str) -> &str {
    match s.find(' ') {
        Some(i) => &s[..i],
        None => s,
    }
}
```

## vs other languages

| | Rust | C++ | Go | Java |
|---|---|---|---|---|
| Pointer aliasing | **statically prevented** | unrestricted (UB risk) | unrestricted | unrestricted |
| Dangling pointer | **compile error** | silent UB | impossible (GC) | impossible (GC) |
| Mutable aliasing | **impossible** | common pattern | possible | possible |
| Fat pointers (slice) | `&[T]` — ptr + len | `std::span<T>` (C++20) | slice header | array + separate len |

In C++ you can hold a `const&` and a non-const reference to the same data simultaneously. Rust forbids this entirely. That's the trade-off that eliminates iterator invalidation bugs.

## Watch out

- Prefer `&str` over `&String` in function signatures. `&String` only accepts an actual `String`'s reference; `&str` accepts that too (via deref coercion) *and* string literals, so it's strictly more flexible for a parameter type.
- You cannot hold a `&mut T` and any `&T` to the same data at the same time — not "at the same time" as in simultaneously read, but for any overlapping span in the code, even if you never actually use both. The compiler tracks the reference's last use, not its lexical scope, but two references whose live ranges overlap and where one is mutable will not compile.
- Indexing a slice out of bounds (`slice[10]` on a 3-element slice) panics at runtime — it is not a compile-time check. Use `.get(i)` (returns `Option<&T>`) when the index isn't guaranteed to be in range.

## The task

Implement three functions:

```rust
// Return the first element of a slice, or 0 if empty.
fn first(slice: &[i32]) -> i32

// Append a suffix to the string in place (takes &mut String).
fn append(s: &mut String, suffix: &str)

// Return the length (byte length) of a string slice without taking ownership.
fn str_len(s: &str) -> usize
```

```rust
first(&[10, 20, 30]); // 10
first(&[]);            // 0

let mut greeting = String::from("hello");
append(&mut greeting, " world");
greeting; // "hello world"

str_len("Rust");  // 4
str_len("");      // 0
```
