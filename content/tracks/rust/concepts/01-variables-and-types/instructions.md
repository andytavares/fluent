## What you build

You write three small functions and one constant. They use a fixed-size array, a tuple and floating-point numbers.

## Key concepts

### Bindings are immutable by default

A binding is immutable unless you write `mut`. The compiler enforces this rule. Go, C++ and TypeScript make variables mutable by default.

```rust
let x = 5;
// error[E0384]: cannot assign twice
x = 6;

let mut y = 5;
y = 6; // fine
```

### Shadowing makes a new binding

Another `let` with the same name shadows the old binding. The new binding can have a new type. Shadowing is not mutation: each `let` makes a new slot.

```rust
let x = 5;
// Shadows the first x
let x = x + 1;
// Now x is a String, not an i32
let x = x.to_string();
```

### Integer width is part of the type

Signed integers are `i8`, `i16`, `i32`, `i64`, `i128` and `isize`. Unsigned integers are `u8` to `u128` and `usize`. An integer literal is `i32` by default, and a float literal is `f64`. Use `f32` only when you have a measured reason.

```rust
let count: i32 = -42;
let big: u64 =
    18_446_744_073_709_551_615;
let pi: f64 = 3.141_592_653;
let flag: bool = true;
// A Unicode scalar value, 4 bytes
let letter: char = 'R';
```

### `const` and `static` need explicit types

The compiler copies a `const` value into each place that uses it, like a typed `#define`. A `static` has one fixed address for the full run of the program.

```rust
const MAX_POINTS: u32 = 100_000;
static GREETING: &str = "hello";
```

### Tuples group values of different types

A tuple has a fixed size and fixed types. You read an element by index with `.0`, `.1` and so on. You can also destructure it with `let`.

```rust
let pair: (i32, bool) = (42, true);
let (n, b) = pair;
println!("{}", pair.0); // 42
```

### The array length is part of the type

An array has a fixed length, lives on the stack and holds one type. Its type is `[T; N]`.

```rust
let primes: [i32; 5] = [2, 3, 5, 7, 11];
// 256 zeros
let zeros = [0u8; 256];
println!("{}", primes[2]); // 5
```

### Rust has no uninitialized variables

The compiler tracks initialization through all branches. It rejects code that can read a variable before it writes it. This check has no runtime cost.

## Watch out

- Integer overflow panics in debug builds. It wraps silently in release builds (`--release`).
- Do not rely on either overflow behavior. Use `checked_add`, `wrapping_add` or `saturating_add` when overflow can occur.
- `[i32; 5]` and `[i32; 6]` are different types. A function that takes `[i32; 5]` rejects a 6-element array.
- For a variable length, take a slice (`&[i32]`) instead of an array.
- `let x = 5; let x = "hello";` compiles. Shadowing lets a name change type completely.
- Each shadowed `x` is a different binding. A closure that captures `x` before the shadow still sees the old value.

## The task

Write three functions and one constant. They practice arrays, tuples and floats.

1. `fn sum_array(arr: [i32; 5]) -> i32` returns the sum of the five elements.
2. `fn min_max(a: i32, b: i32) -> (i32, i32)` returns the smaller value first and the larger value second.
3. `fn rectangle_area(width: f64, height: f64) -> f64` returns `width` times `height`.
4. Declare `const LANGUAGE: &str` with the value `"Rust"`.

When `a` and `b` are equal, `min_max` returns both in either order. Negative numbers follow the same rules. A zero side gives an area of `0.0`.

```rust
sum_array([1, 2, 3, 4, 5])    // 15
sum_array([0, 0, 0, 0, 0])    // 0
sum_array([-1, -2, -3, -4, -5])
// -15
sum_array([10, -3, 0, 7, 1])  // 15

min_max(3, 7)      // (3, 7)
min_max(9, 2)      // (2, 9)
min_max(5, 5)      // (5, 5)
min_max(-4, -10)   // (-10, -4)

rectangle_area(4.0, 5.5)   // 22.0
rectangle_area(0.0, 10.0)  // 0.0
rectangle_area(3.0, 3.0)   // 9.0

LANGUAGE  // "Rust"
```
