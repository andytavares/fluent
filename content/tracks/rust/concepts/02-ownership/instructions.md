## What you build

You write three functions that take, return and clone a `String`. Ownership gives Rust memory safety without a garbage collector, and the rest of the language depends on it. This lesson builds on **Variables & Types**.

## Key concepts

### Ownership has three rules

1. Every value has exactly one owner.
2. When the owner goes out of scope, Rust drops the value and frees its memory.
3. A value has only one owner at a time.

### `Copy` types copy on assignment

Scalar types (`i32`, `bool`, `f64`, `char`) live on the stack and implement the `Copy` trait. Tuples and arrays of `Copy` types are `Copy` too. Heap types such as `String` and `Vec<T>` do not implement `Copy`.

```rust
let x: i32 = 5;
// Copy: x and y are independent
let y = x;
println!("{}", x); // fine
```

### Assignment moves a heap value

When you assign a `String`, ownership moves to the new variable. The old binding becomes invalid. Rust does not copy the heap data. It copies only the pointer, length and capacity on the stack.

```rust
let s1 = String::from("hello");
// s1 moves into s2
let s2 = s1;
// error[E0382]: borrow of moved value
println!("{}", s1);
```

### `.clone()` makes a deep copy

When you need a second heap allocation, call `.clone()`. Both values stay valid.

```rust
let s1 = String::from("hello");
let s2 = s1.clone();
// Both are valid
println!("{} {}", s1, s2);
```

### Rust drops a value at the end of its scope

When the owner goes out of scope, Rust calls `drop`, the destructor. You write no `free` or `delete`, and no garbage collector pauses the program.

```rust
{
    let s = String::from("owned");
} // Rust drops s and frees its memory
```

### `String` owns its text and `&str` borrows it

A `String` is an owned, growable buffer on the heap. A `&str` is a reference to a string slice and owns no data. String literals are `&'static str` values stored in the binary.

```rust
let owned = String::from("hello");
// A static slice
let borrowed: &str = "world";
// A slice of the owned String
let slice: &str = &owned[0..3];
```

### The compiler prevents double-free and use-after-free

C++ RAII also runs destructors automatically, but C++ lets you use a moved-from object. In Rust, that use is a compile error.

## Watch out

- Passing a `String` by value moves it. The caller loses it unless the function returns it.
- The same move happens for every type that is not `Copy`.
- To only read a value, take a reference such as `&str`. Do not take ownership.
- `.clone()` allocates heap memory. Use it only when you need an independent copy.
- Do not add `.clone()` only to silence the borrow checker. First find out why it complains.
- Returning a value moves it to the caller. So `append_world` can return a new `String` without `.clone()`.

## The task

Write three functions that use ownership and cloning.

1. `fn string_length(s: String) -> usize` takes ownership of `s`. It returns the length in bytes.
2. `fn append_world(s: String) -> String` takes ownership of `s`. It returns `s` with `" world"` added at the end.
3. `fn exclaim(s: &String) -> String` returns a clone of `s` with `"!"` added at the end.
4. `exclaim` must not consume `s`. The caller can still use the original after the call.

An empty string has length 0. `append_world` on an empty string returns `" world"`. `exclaim` on an empty string returns `"!"`.

```rust
string_length(String::from("hello")) // 5
string_length(String::from(""))      // 0
string_length(String::from("Rust"))  // 4

append_world(String::from("hello"))
// "hello world"
append_world(String::from(""))
// " world"

let original = String::from("hey");
exclaim(&original)  // "hey!"
original            // still "hey"

let empty = String::from("");
exclaim(&empty)     // "!"
empty               // still ""
```
