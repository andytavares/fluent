# Closures & Iterators

## What you'll learn

Rust closures capture their environment and are typed by three traits: `Fn`, `FnMut`, and `FnOnce`. The `Iterator` trait provides a rich chain of lazy adapters — `map`, `filter`, `fold`, and more — that compile to tight loops with no allocation overhead.

## Key concepts

**Closures.** Syntax is `|params| body`. The compiler infers parameter and return types from context.

```rust
let add = |x: i32, y: i32| x + y;
let double = |x| x * 2;  // types inferred from use
```

**Capturing the environment.** Closures capture by the least restrictive means needed:
- Borrow (`&T`) by default.
- Borrow mutably (`&mut T`) if the closure mutates a captured variable.
- Move (`T`) if you use the `move` keyword, or if a borrow wouldn't work (e.g., returning or spawning threads).

```rust
let factor = 3;
let scale = |x| x * factor;   // captures factor by &
println!("{}", scale(5));      // 15

let mut count = 0;
let mut inc = || { count += 1; count }; // captures by &mut
```

**The three closure traits:**
- `Fn` — callable any number of times; borrows captured values immutably.
- `FnMut` — callable any number of times; may mutate captured values.
- `FnOnce` — callable exactly once; moves captured values out. Every `FnMut` is also `FnOnce`; every `Fn` is also `FnMut`.

**The `Iterator` trait.** Anything that implements `fn next(&mut self) -> Option<Self::Item>` is an iterator. All the adapters are provided for free.

```rust
let v = vec![1, 2, 3, 4, 5];

let doubled: Vec<i32> = v.iter().map(|x| x * 2).collect();
let evens: Vec<&i32> = v.iter().filter(|&&x| x % 2 == 0).collect();
let sum: i32 = v.iter().sum();
let product: i32 = v.iter().fold(1, |acc, x| acc * x);
```

**Lazy evaluation.** Adapters don't execute until you call a consuming method (`collect`, `sum`, `for_each`, `count`, `any`, `all`, etc.). Chaining adapters builds a zero-cost state machine.

```rust
// Nothing runs until collect():
let result: Vec<i32> = (0..1_000_000)
    .filter(|x| x % 2 == 0)
    .map(|x| x * x)
    .take(5)
    .collect(); // [0, 4, 16, 36, 64]
```

**`chain` and `zip`:**

```rust
let a = [1, 2];
let b = [3, 4];
let chained: Vec<i32> = a.iter().chain(b.iter()).copied().collect(); // [1,2,3,4]
let zipped: Vec<(i32, i32)> = a.iter().zip(b.iter()).map(|(&x, &y)| (x, y)).collect();
```

**`collect` into different types.** `collect` is generic over any type implementing `FromIterator`. Common targets: `Vec`, `String`, `HashMap`, `HashSet`, `Result<Vec<T>, E>`.

## vs other languages

| | Rust | JavaScript | Go | Java streams |
|---|---|---|---|---|
| Closure trait system | `Fn/FnMut/FnOnce` | one `Function` type | function values | `Function<T,R>` interfaces |
| Lazy evaluation | yes — zero cost | no (arrays are eager) | no | yes (streams are lazy) |
| Mutation in closure | explicit `&mut` capture | implicit | implicit | effectively final |
| `collect` | generic, zero alloc | `Array.from` | manual loop | `.collect(Collectors.toList())` |

JavaScript's `Array.prototype.map` creates a new array immediately. Rust's `.map()` creates an iterator — the actual work happens only when consumed. Chaining ten adapters still allocates only the final output.

## The task

Implement four functions using iterators and closures:

```rust
// Return a Vec of squares of all even numbers in the input slice.
fn even_squares(nums: &[i32]) -> Vec<i32>

// Return the product of all elements (fold). Return 1 for empty slice.
fn product(nums: &[i32]) -> i32

// Given a Vec of Strings, return only those whose length > min_len, uppercased.
fn long_words_upper(words: Vec<String>, min_len: usize) -> Vec<String>

// Zip two slices into a Vec of their element-wise sums.
// If slices differ in length, stop at the shorter one.
fn zip_sum(a: &[i32], b: &[i32]) -> Vec<i32>
```
