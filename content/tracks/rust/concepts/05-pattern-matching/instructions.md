# Pattern Matching

## What you'll learn

`match` in Rust is exhaustive — the compiler rejects any match that doesn't cover all possible cases. Combined with Rust's expressive enum variants, pattern matching replaces entire categories of code that other languages handle with if-else chains or virtual dispatch.

## Key concepts

**Basic `match`.** Every arm is `pattern => expression`. The value of the matched arm is the value of the whole `match` expression.

```rust
let x: i32 = 3;
let label = match x {
    1 => "one",
    2 | 3 => "two or three",
    4..=9 => "four to nine",
    _ => "other",   // catch-all, required unless all cases are covered
};
```

**Matching enums.** The compiler ensures all variants are handled.

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(String), // variant with data
}

fn value(c: Coin) -> u32 {
    match c {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("Quarter from {}", state);
            25
        }
    }
}
```

**Destructuring structs and tuples** inside patterns:

```rust
struct Point { x: i32, y: i32 }

let p = Point { x: 3, y: -2 };
match p {
    Point { x: 0, y } => println!("on y-axis at {}", y),
    Point { x, y: 0 } => println!("on x-axis at {}", x),
    Point { x, y }    => println!("({}, {})", x, y),
}
```

**Guards** add boolean conditions to a pattern:

```rust
let num = 4;
match num {
    n if n < 0 => println!("negative"),
    n if n % 2 == 0 => println!("positive even: {}", n),
    n => println!("positive odd: {}", n),
}
```

**`@` bindings** capture the matched value while also testing it:

```rust
match x {
    n @ 1..=9 => println!("single digit: {}", n),
    _ => println!("other"),
}
```

**`if let`** — shorthand when you care about one variant only:

```rust
if let Some(val) = some_option {
    println!("got {}", val);
}
```

**`while let`** — loop while a pattern continues to match:

```rust
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {
    println!("{}", top);
}
```

## vs other languages

| | Rust | Go | TypeScript | Java (switch) |
|---|---|---|---|---|
| Exhaustiveness | **compile error** if incomplete | no | no (TS `never` trick) | no (Java 21 sealed classes: yes) |
| Binding in arms | yes | no | no | Java 21 patterns: yes |
| Value expression | yes — `match` is an expression | no | no | no |
| Struct destructure | yes | no | yes | no |

Go's `switch` does not bind, does not destructure, and has no exhaustiveness check. You simulate pattern matching there with a chain of type assertions.

## Watch out

- Adding a variant to an enum later will make every `match` on it fail to compile until you handle the new variant (unless there's a `_` catch-all) — this is a feature: the compiler finds every call site that needs updating.
- A `_` catch-all silences exhaustiveness checking for *future* variants too. Prefer listing every variant explicitly when the set is closed and small (like `Command` here); reserve `_` for truly open-ended ranges (like an integer range's default case).
- `match cmd { ... }` on `&Command` binds by reference inside the arms automatically (via match ergonomics) — you get `x: &i32`-like bindings without writing `ref` yourself, which trips up people coming from older Rust tutorials or languages with explicit ref/deref patterns.

## The task

Implement three functions:

```rust
enum Command {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
}

// Describe the command as a String:
//   Quit                    -> "quit"
//   Move { x, y }           -> "move to (x, y)"
//   Write(text)             -> "write: <text>"
//   ChangeColor(r, g, b)    -> "color: (#RRGGBB)" — uppercase hex, 2 digits each
fn describe_command(cmd: &Command) -> String

// Return Some(n) if n is in 1..=100 inclusive, None otherwise.
fn clamp_option(n: i32) -> Option<i32>

// Given Option<i32>, return the value doubled, or -1 if None.
fn double_or_minus_one(opt: Option<i32>) -> i32
```

```rust
describe_command(&Command::Quit);                          // "quit"
describe_command(&Command::Move { x: 3, y: -1 });           // "move to (3, -1)"
describe_command(&Command::Write(String::from("hi")));      // "write: hi"
describe_command(&Command::ChangeColor(255, 128, 0));       // "color: (#FF8000)"

clamp_option(50);   // Some(50)
clamp_option(0);    // None — below the range
clamp_option(101);  // None — above the range

double_or_minus_one(Some(7)); // 14
double_or_minus_one(None);    // -1
```
