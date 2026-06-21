# Ownership

## What you'll learn

Rust's ownership system is what makes memory safety without a garbage collector possible. It is the single most important concept in the language — understanding it unlocks everything else.

## Key concepts

**The three rules of ownership:**
1. Every value has exactly one owner.
2. When the owner goes out of scope, the value is dropped (memory freed).
3. There can only be one owner at a time.

**Stack vs heap.** Scalar types (`i32`, `bool`, `f64`, `char`) and fixed-size composites live on the stack. They implement the `Copy` trait — assignments copy the value. Heap-allocated types like `String` and `Vec<T>` do not implement `Copy` by default.

```rust
let x: i32 = 5;
let y = x;       // copy: x and y are independent
println!("{}", x); // fine
```

**Move semantics.** When you assign a heap type, ownership moves to the new variable. The original binding is invalidated.

```rust
let s1 = String::from("hello");
let s2 = s1;              // s1 is moved into s2
println!("{}", s1);       // error[E0382]: borrow of moved value: `s1`
```

This is not a shallow copy — it is a move. The allocation is not duplicated; only the pointer/length/capacity metadata on the stack is transferred.

**`Clone` for an explicit deep copy.** When you actually need a duplicate heap allocation, call `.clone()`.

```rust
let s1 = String::from("hello");
let s2 = s1.clone();
println!("{} {}", s1, s2); // both valid
```

**Drop.** When a value's owner goes out of scope, Rust calls `drop` automatically (the destructor). No `free`, no `delete`, no GC pause.

```rust
{
    let s = String::from("owned");
} // s is dropped here, heap memory freed
```

**`String` vs `&str`.** `String` is an owned, heap-allocated, growable buffer. `&str` is a borrowed reference to a string slice — it does not own the data. String literals are `&'static str` baked into the binary.

```rust
let owned: String = String::from("hello");
let borrowed: &str = "world";            // static slice
let slice: &str = &owned[0..3];         // slice of owned String
```

## vs other languages

| | Rust | C++ | Go | Java/TS |
|---|---|---|---|---|
| Heap lifecycle | **compiler-enforced drop** | manual `delete` / RAII | GC | GC |
| Copying heap data | explicit `.clone()` | implicit copy ctor | struct copy (all values) | reference semantics |
| Double-free | **impossible** | classic bug | impossible (GC) | impossible (GC) |
| Use-after-free | **impossible** | classic bug | impossible (GC) | impossible (GC) |

C++ RAII gets you automatic destructors, but nothing prevents you from using a moved-from object. Rust makes that a compile error.

## The task

Implement three functions that exercise ownership and cloning:

```rust
// Takes ownership of a String and returns its length.
fn string_length(s: String) -> usize

// Takes ownership of a String, appends " world", and returns the new String.
fn append_world(s: String) -> String

// Clones the input string and returns the clone with "!" appended.
// The original must still be usable by the caller — do NOT consume it.
fn exclaim(s: &String) -> String
```
