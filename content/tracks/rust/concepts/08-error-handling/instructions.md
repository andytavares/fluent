## What you build

You write a custom error enum, a `Display` impl for it and two functions that use `Result` and `?`. Rust has no exceptions: errors are values. The `?` operator propagates them with almost as little code as `try`/`catch`, and the control flow stays visible. This lesson builds on **Generics & Lifetimes**.

## Key concepts

### `Result<T, E>` holds success or failure

A `Result` is either `Ok(T)` or `Err(E)`. It is like `Option`, but the failure case carries an error value. The compiler warns when you ignore a `Result`.

```rust
fn divide(a: f64, b: f64)
    -> Result<f64, String> {
    if b == 0.0 {
        Err("division by zero".into())
    } else {
        Ok(a / b)
    }
}
```

### `?` unwraps `Ok` or returns `Err` early

Inside a function that returns `Result`, `?` gives the `Ok` value or returns the `Err` at once. You do not write a `match` after every call. Go repeats `if err != nil` at each call, and `?` is as visible but shorter.

```rust
use std::num::ParseIntError;

fn read_and_parse(s: &str)
    -> Result<i32, ParseIntError> {
    // Returns early if parse fails
    let n: i32 = s.trim().parse()?;
    Ok(n * 2)
}
```

### `?` converts errors with `From`

`?` calls `From::from` on the error. So one function can return one error type and collect errors from many sources.

```rust
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    Parse(ParseIntError),
    Logic(String),
}

impl From<ParseIntError> for AppError {
    fn from(e: ParseIntError) -> Self {
        AppError::Parse(e)
    }
}

fn process(s: &str)
    -> Result<i32, AppError> {
    // ParseIntError becomes AppError
    let n: i32 = s.parse()?;
    if n < 0 {
        let msg = "must be positive";
        return Err(AppError::Logic(
            msg.into()));
    }
    Ok(n)
}
```

### Combinators replace a `match` for small changes

```rust
// Change the Ok value
result.map(|v| v * 2)
// Change the Err value
result.map_err(|e| format!("{}", e))
// The Ok value or a default
result.unwrap_or(0)
result.unwrap_or_else(|e| { log(e); 0 })
// Chain operations that can fail
result.and_then(|v| next_step(v))
```

### `unwrap` and `expect` panic on `Err`

Use them only in tests and prototypes, never in production code paths.

```rust
// Panics if Err
let n: i32 = "42".parse().unwrap();
// Panics with a message
let n: i32 =
    "42".parse().expect("bad input");
```

### `Box<dyn Error>` returns any error type

`Box<dyn std::error::Error>` lets a function return any error type without a custom error enum. `main` and small CLI tools often use it.

```rust
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let n: i32 = "42".parse()?;
    println!("{}", n);
    Ok(())
}
```

## Watch out

- `?` works only in a function that returns `Result` or `Option`.
- In `main`, `?` works only when `main` returns `Result`.
- `.unwrap()` panics and unwinds the current thread. It does not handle the `Err` case.
- Use `.unwrap()` only in tests, or where you proved that the call cannot fail.
- `filter_map(|s| parse_score(s).ok())` drops errors silently. `sum_scores` needs exactly that.
- In production code, dropping errors silently is usually wrong. Log them or return them.

## The task

Write a custom error enum, a `Display` impl for it and two functions that use `Result`. Use no external crates.

1. Declare the enum with `#[derive(Debug, PartialEq)]` and three variants: `Empty`, `InvalidNumber(String)` and `OutOfRange(i32)`. Name it `ParseError`.
2. Implement `std::fmt::Display` for `ParseError`. Each variant gives a message that is not empty.
3. The `InvalidNumber` and `OutOfRange` messages include the value they hold.
4. `fn parse_score(s: &str) -> Result<i32, ParseError>` trims whitespace from `s` first.
5. If the trimmed string is empty, `parse_score` returns `Err(ParseError::Empty)`.
6. If the trimmed string does not parse as `i32`, it returns `Err(ParseError::InvalidNumber(s))`, with the trimmed string.
7. If the number `n` is below 0 or above 1000, it returns `Err(ParseError::OutOfRange(n))`.
8. Otherwise, it returns `Ok(n)`.
9. `fn sum_scores(inputs: &[&str]) -> i32` calls `parse_score` on each string. It returns the sum of the `Ok` values.
10. `sum_scores` ignores `Err` values. It does not propagate them.

The range includes 0 and 1000. A decimal such as `"1.5"` is not a valid `i32`. An empty slice sums to 0.

```rust
use ParseError::*;

parse_score("42")     // Ok(42)
parse_score("0")      // Ok(0)
parse_score("1000")   // Ok(1000)
parse_score("  7  ")  // Ok(7)
parse_score("")       // Err(Empty)
parse_score("   ")    // Err(Empty)
parse_score("abc")
// Err(InvalidNumber("abc".to_string()))
parse_score("1.5")
// Err(InvalidNumber("1.5".to_string()))
parse_score("-1")
// Err(OutOfRange(-1))
parse_score("1001")
// Err(OutOfRange(1001))

// Each message names its value
format!("{}", InvalidNumber("bad".into()))
// contains "bad"
format!("{}", OutOfRange(-5))
// contains "-5"

sum_scores(&["10", "bad", "30", "", "60"])
// 100
sum_scores(&[])                   // 0
sum_scores(&["bad", "", "-1"])    // 0
sum_scores(&["5", "10"])          // 15
```
