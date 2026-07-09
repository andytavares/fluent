# Error Handling

## What you'll learn

Rust has no exceptions. Errors are values — specifically `Result<T, E>` — and the `?` operator makes propagating them nearly as ergonomic as `try/catch`, without the hidden control flow.

## Key concepts

**`Result<T, E>`.** The type that represents either success (`Ok(T)`) or failure (`Err(E)`). You already saw this with `Option` — `Result` adds an error payload.

```rust
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("division by zero"))
    } else {
        Ok(a / b)
    }
}
```

**The `?` operator.** Inside a function that returns `Result`, `?` unwraps `Ok` or returns early with `Err`. It replaces `match`-on-every-call drudgery.

```rust
fn read_and_parse(s: &str) -> Result<i32, std::num::ParseIntError> {
    let n: i32 = s.trim().parse()?;  // returns early if parse fails
    Ok(n * 2)
}
```

**`From` / `Into` for error conversion.** `?` automatically calls `From::from` on the error type, so you can write functions with a single error type that collect errors from multiple sources.

```rust
#[derive(Debug)]
enum AppError {
    Parse(std::num::ParseIntError),
    Logic(String),
}

impl From<std::num::ParseIntError> for AppError {
    fn from(e: std::num::ParseIntError) -> Self {
        AppError::Parse(e)
    }
}

fn process(s: &str) -> Result<i32, AppError> {
    let n: i32 = s.parse()?;          // ParseIntError -> AppError via From
    if n < 0 {
        return Err(AppError::Logic("must be positive".into()));
    }
    Ok(n)
}
```

**Combinators** — avoid manual `match` for simple transformations:

```rust
result.map(|v| v * 2)              // transform Ok value
result.map_err(|e| format!("{}", e)) // transform Err value
result.unwrap_or(0)                // Ok or default
result.unwrap_or_else(|e| { log(e); 0 })
result.and_then(|v| next_step(v))  // chain fallible operations
```

**`unwrap` and `expect`.** Panic if `Err`. Use in tests and prototypes only — never in production paths.

```rust
let n: i32 = "42".parse().unwrap();               // panics if Err
let n: i32 = "42".parse().expect("bad input");    // panics with message
```

**`Box<dyn std::error::Error>`.** The idiomatic escape hatch when you want to return any error type from a function without defining a custom error enum — common in `main` and small CLI tools.

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let n: i32 = "42".parse()?;
    println!("{}", n);
    Ok(())
}
```

## vs other languages

| | Rust | Go | Java | TypeScript |
|---|---|---|---|---|
| Error mechanism | `Result<T, E>` value | `(T, error)` tuple | exceptions | throw / Promise rejection |
| Forced handling | **compiler warning** if Result ignored | no | no (checked exceptions: yes) | no |
| Propagation | `?` operator | `if err != nil { return }` | `throw` / `throws` | `throw` / `await` |
| Stack unwinding | no (unless panic) | no | yes | yes |

Go's `if err != nil` is repetitive but explicit. Rust's `?` is equally explicit — it's visible at every call site — but far more concise. Neither language silently swallows errors the way unchecked Java exceptions can.

## Watch out

- `?` only works inside a function whose return type is `Result` (or `Option`) — you cannot use it in a function returning something else, including `main` unless `main` itself returns `Result`.
- `.unwrap()` panics and unwinds the current thread; it is not a substitute for handling the `Err` case in real code paths. Reserve it for cases you've proven can't fail, or tests.
- `filter_map(|s| parse_score(s).ok())` silently drops errors — that's the documented, intended behavior of `sum_scores` here, but in production code silently discarding errors is usually the wrong default; log or surface them instead.

## The task

Implement a custom error enum, a `Display` impl for it, and two functions that use `Result` and `?`. No external crates.

```rust
#[derive(Debug, PartialEq)]
enum ParseError {
    Empty,
    InvalidNumber(String),
    OutOfRange(i32),
}

// Any human-readable message per variant is fine — tests only check the
// message is non-empty and mentions the relevant value (see Watch out).
impl std::fmt::Display for ParseError { ... }

// Parse a string to i32, trimming whitespace first. Return:
//   Err(ParseError::Empty) if s is empty after trimming
//   Err(ParseError::InvalidNumber(s)) if the trimmed string fails to parse as i32
//   Err(ParseError::OutOfRange(n)) if the parsed n < 0 or n > 1000
//   Ok(n) otherwise
fn parse_score(s: &str) -> Result<i32, ParseError>

// Call parse_score on each string in the slice.
// Return the sum of all Ok values; ignore (do not propagate) Err values.
fn sum_scores(inputs: &[&str]) -> i32
```

```rust
parse_score("42");     // Ok(42)
parse_score("  7  ");  // Ok(7)   — whitespace trimmed first
parse_score("");       // Err(ParseError::Empty)
parse_score("   ");    // Err(ParseError::Empty)
parse_score("abc");    // Err(ParseError::InvalidNumber("abc".to_string()))
parse_score("-1");     // Err(ParseError::OutOfRange(-1))
parse_score("1001");   // Err(ParseError::OutOfRange(1001))

sum_scores(&["10", "bad", "30", "", "60"]); // 100 — only "10"+"30"+"60"
sum_scores(&[]);                             // 0
```
