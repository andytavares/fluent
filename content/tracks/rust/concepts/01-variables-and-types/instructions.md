# Variables & Types

## What you'll learn

How Rust declares variables, why immutability is the default, the scalar type system, and the two aggregate types you'll use constantly: tuples and fixed-size arrays.

## Key concepts

**Immutable by default.** Every binding is immutable unless you write `mut`. This isn't a style preference — the compiler enforces it.

```rust
let x = 5;
x = 6; // error[E0384]: cannot assign twice to immutable variable

let mut y = 5;
y = 6; // fine
```

**Shadowing** lets you rebind a name to a new value (even a new type) with another `let`. This is different from mutation — a new slot is created each time.

```rust
let x = 5;
let x = x + 1;       // shadows the first x
let x = x.to_string(); // now x is a String, not i32
```

**Scalar types.** Rust makes integer width explicit: `i8`/`i16`/`i32`/`i64`/`i128`/`isize` for signed, `u8`..`u128`/`usize` for unsigned. The default integer literal is `i32`. Floats default to `f64`. Use `f32` only when you have a measured reason.

```rust
let count: i32 = -42;
let big: u64 = 18_446_744_073_709_551_615;
let pi: f64 = 3.141_592_653;
let flag: bool = true;
let letter: char = 'R'; // Unicode scalar, 4 bytes
```

**`const` and `static`.** `const` is inlined at every use site (like `#define` but typed). `static` has a single address for the lifetime of the program. Both require explicit types.

```rust
const MAX_POINTS: u32 = 100_000;
static GREETING: &str = "hello";
```

**Tuples** group heterogeneous values. Access by index with `.0`, `.1`, etc. Fixed size, fixed types.

```rust
let pair: (i32, bool) = (42, true);
let (n, b) = pair;       // destructure
println!("{}", pair.0);  // 42
```

**Arrays** are fixed-length, stack-allocated, homogeneous. Type is `[T; N]` — the length is part of the type.

```rust
let primes: [i32; 5] = [2, 3, 5, 7, 11];
let zeros = [0u8; 256]; // 256 zeros
println!("{}", primes[2]); // 5
```

## vs other languages

| | Rust | Go | C++ | TypeScript |
|---|---|---|---|---|
| Default mutability | **immutable** | mutable | mutable | `const` opt-in |
| Integer width | explicit (`i32`, `u64`) | platform (`int`) | explicit but UB-prone | `number` (f64) |
| Shadowing | yes, new binding | no | limited (scope blocks) | yes (`let`) |
| Fixed array type | `[T; N]` | `[N]T` | `std::array<T,N>` | `readonly T[]` |
| Uninitialized vars | **not allowed** | zero-initialized | UB | `undefined` |

Rust does not allow uninitialized variables. The compiler tracks initialization through all branches and rejects code that might read before write — no runtime cost, no undefined behavior.

## Watch out

- Integer overflow panics in debug builds and silently wraps in release builds (`--release`). Don't rely on either behavior; use `checked_add`/`wrapping_add`/`saturating_add` when overflow is a real possibility.
- Array length is part of the type: `[i32; 5]` and `[i32; 6]` are different, incompatible types. A function taking `[i32; 5]` cannot be called with a 6-element array — you'd need a slice (`&[i32]`) for variable length.
- `let x = 5; let x = "hello";` compiles — shadowing lets a name change type entirely. This is easy to confuse with mutation, but every shadowed `x` is a distinct binding; a closure captured before the shadow still sees the old one.

## The task

Implement three functions:

```rust
// Return the sum of all elements in a fixed-size array of 5 i32 values.
fn sum_array(arr: [i32; 5]) -> i32

// Return a tuple of (min, max) from two i32 values.
fn min_max(a: i32, b: i32) -> (i32, i32)

// Return the area of a rectangle given width and height as f64.
fn rectangle_area(width: f64, height: f64) -> f64
```

Also declare a `const` named `LANGUAGE` with value `"Rust"`.

```rust
sum_array([1, 2, 3, 4, 5]);   // 15
sum_array([0, 0, 0, 0, 0]);   // 0
sum_array([-1, -2, -3, -4, -5]); // -15

min_max(3, 7);   // (3, 7)
min_max(9, 2);   // (2, 9)
min_max(5, 5);   // (5, 5)

rectangle_area(4.0, 5.5);  // 22.0
rectangle_area(0.0, 10.0); // 0.0

LANGUAGE; // "Rust"
```
