## What you build

You write three functions that read and change data through references, without ownership. The borrow checker checks the reference rules at compile time, and these rules prevent data races. This lesson builds on **Ownership**.

## Key concepts

### A shared reference `&T` borrows a value to read it

You can have any number of read-only references to a value. The borrow checker makes sure the value lives at least as long as each reference.

```rust
fn print_len(s: &String) {
    // s is borrowed, not moved
    println!("{}", s.len());
}

let owned = String::from("hello");
print_len(&owned);
println!("{}", owned); // still valid
```

### A mutable reference `&mut T` borrows a value to change it

You can have only one mutable reference to a value at a time. While it exists, no shared reference can be active.

```rust
fn shout(s: &mut String) {
    s.push('!');
}

let mut msg = String::from("hello");
shout(&mut msg);
println!("{}", msg); // "hello!"
```

### The borrow checker has two rules

1. At any moment, you have either one `&mut T` or any number of `&T`, never both.
2. A reference must not outlive its value, so no reference can dangle.

C++ lets you hold a `const&` and a non-const reference to the same data together. Rust forbids this, and so it removes iterator invalidation bugs.

```rust
let r;
{
    let x = 5;
    r = &x;
} // Rust drops x here
// error[E0597]: `x` does not live
// long enough
println!("{}", r);
```

### A slice `&[T]` borrows a contiguous sequence

A slice is a fat pointer: a pointer and a length. It does not own its data. A `&str` is a slice of UTF-8 bytes.

```rust
let v = vec![1, 2, 3, 4, 5];
// [2, 3, 4]
let middle: &[i32] = &v[1..4];
println!("{:?}", middle);
```

### Take `&str` as a parameter, not `&String`

A `&str` parameter accepts a borrowed `String` and a string literal. A `&String` parameter accepts only a borrowed `String`.

```rust
fn first_word(s: &str) -> &str {
    match s.find(' ') {
        Some(i) => &s[..i],
        None => s,
    }
}
```

## Watch out

- A `&String` parameter rejects string literals. A `&str` parameter accepts both, through deref coercion.
- A `&mut T` and a `&T` to the same data cannot have overlapping live ranges. That code does not compile.
- A reference lives until its last use, not until the end of its block.
- An out-of-bounds index on a slice panics at runtime. The compiler does not check it.
- Use `.get(i)` when the index can be out of range. It returns `Option<&T>`.

## The task

Write three functions that use references and slices.

1. `fn first(slice: &[i32]) -> i32` returns the first element of `slice`.
2. If `slice` is empty, `first` returns `0`.
3. `fn append(s: &mut String, suffix: &str)` adds `suffix` to the end of `s` in place. It returns nothing.
4. `fn str_len(s: &str) -> usize` returns the length of `s` in bytes. It does not take ownership.

`append` with an empty suffix leaves `s` unchanged. `str_len` also accepts a borrowed `String`.

```rust
first(&[10, 20, 30])  // 10
first(&[5])           // 5
first(&[-7, 1, 2])    // -7
first(&[])            // 0

let mut s = String::from("hello");
append(&mut s, " world");
s  // "hello world"

let mut e = String::from("");
append(&mut e, "start");
e  // "start"

let mut f = String::from("foo");
append(&mut f, "");
f  // "foo"

str_len("Rust")  // 4
str_len("")      // 0
let owned = String::from("hello");
str_len(&owned)  // 5
```
