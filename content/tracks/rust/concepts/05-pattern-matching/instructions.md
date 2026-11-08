## What you build

You write three functions with `match`: one describes a `Command` enum, and two work with `Option<i32>`. With Rust enums, `match` replaces long `if`/`else` chains and virtual dispatch. This lesson builds on **Structs & Enums**.

## Key concepts

### `match` is an exhaustive expression

Each arm is `pattern => expression`. The value of the arm that matches is the value of the whole `match`. The compiler rejects a `match` that does not cover every case. Go's `switch` does not bind, does not destructure and has no exhaustiveness check.

```rust
let x: i32 = 3;
let label = match x {
    1 => "one",
    2 | 3 => "two or three",
    4..=9 => "four to nine",
    // Catch-all: required unless
    // the arms cover all cases
    _ => "other",
};
```

### A `match` on an enum handles every variant

An arm can bind the data that a variant holds.

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    // A variant with data
    Quarter(String),
}

fn value(c: Coin) -> u32 {
    match c {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("From {}", state);
            25
        }
    }
}
```

### Patterns destructure structs and tuples

A pattern can fix some fields to values and bind the other fields to names.

```rust
struct Point { x: i32, y: i32 }

let p = Point { x: 3, y: -2 };
match p {
    Point { x: 0, y } =>
        println!("on y-axis at {}", y),
    Point { x, y: 0 } =>
        println!("on x-axis at {}", x),
    Point { x, y } =>
        println!("({}, {})", x, y),
}
```

### A guard adds a condition to a pattern

Write `if` and a boolean condition after the pattern.

```rust
let num = 4;
match num {
    n if n < 0 => println!("negative"),
    n if n % 2 == 0 =>
        println!("positive even: {}", n),
    n => println!("positive odd: {}", n),
}
```

### An `@` binding names a value that a pattern tests

```rust
match x {
    n @ 1..=9 =>
        println!("single digit: {}", n),
    _ => println!("other"),
}
```

### `if let` matches one variant

Use `if let` when only one variant matters to you.

```rust
if let Some(val) = some_option {
    println!("got {}", val);
}
```

### `while let` loops while a pattern matches

```rust
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {
    println!("{}", top);
}
```

## Watch out

- A new enum variant breaks every `match` on that enum without `_`. The compiler finds each place to update.
- A `_` catch-all also hides future variants from the exhaustiveness check.
- For a small, closed set such as `Command`, list every variant. Keep `_` for open sets such as integer ranges.
- A `match` on `&Command` binds by reference in the arms. You do not write `ref`.
- Older tutorials use explicit `ref` patterns. Match ergonomics makes them unnecessary.

## The task

Write a `Command` enum and three functions that use `match`.

1. `enum Command` has four variants: `Quit`, `Move { x: i32, y: i32 }`, `Write(String)` and `ChangeColor(u8, u8, u8)`.
2. `fn describe_command(cmd: &Command) -> String` returns a description of `cmd`:
   - `Quit` gives `"quit"`.
   - `Move { x, y }` gives `"move to (x, y)"`.
   - `Write(text)` gives `"write: "` followed by `text`.
   - `ChangeColor(r, g, b)` gives `"color: (#RRGGBB)"`. Each part is two uppercase hex digits.
3. `fn clamp_option(n: i32) -> Option<i32>` returns `Some(n)` if `n` is from 1 to 100 inclusive. Otherwise it returns `None`.
4. `fn double_or_minus_one(opt: Option<i32>) -> i32` returns the value times 2. For `None`, it returns `-1`.

`Write` with an empty string gives `"write: "`. A zero color part prints as `00`.

```rust
use Command::*;

describe_command(&Quit)  // "quit"
describe_command(&Move { x: 3, y: -1 })
// "move to (3, -1)"
describe_command(&Move { x: 0, y: 0 })
// "move to (0, 0)"
describe_command(
    &Write(String::from("hi")))
// "write: hi"
describe_command(
    &Write(String::from("")))
// "write: "
describe_command(
    &ChangeColor(255, 128, 0))
// "color: (#FF8000)"
describe_command(&ChangeColor(0, 0, 0))
// "color: (#000000)"

clamp_option(50)   // Some(50)
clamp_option(1)    // Some(1)
clamp_option(100)  // Some(100)
clamp_option(0)    // None
clamp_option(101)  // None
clamp_option(-5)   // None

double_or_minus_one(Some(7))  // 14
double_or_minus_one(Some(0))  // 0
double_or_minus_one(None)     // -1
```
