## What you build

You write four functions with iterator chains and closures. Three traits type Rust closures: `Fn`, `FnMut` and `FnOnce`. Iterator adapters such as `map`, `filter` and `fold` are lazy and compile to tight loops. This lesson builds on **Error Handling**.

## Key concepts

### A closure is `|params| body`

The compiler infers the parameter and return types from context.

```rust
let add = |x: i32, y: i32| x + y;
// Types come from how you use it
let double = |x| x * 2;
```

### A closure captures its environment as lightly as it can

1. By default, a closure borrows a captured value (`&T`).
2. If the closure changes the value, it borrows mutably (`&mut T`).
3. With the `move` keyword, or when the body moves the value, the closure takes ownership (`T`).

A closure that you return or pass to a new thread usually needs `move`.

```rust
let factor = 3;
// Captures factor by &
let scale = |x| x * factor;
println!("{}", scale(5)); // 15

let mut count = 0;
// Captures count by &mut
let mut inc = || { count += 1; count };
```

### Three traits describe how a closure uses its captures

- `Fn` can run any number of times. It borrows captured values immutably.
- `FnMut` can run any number of times. It can change captured values.
- `FnOnce` can run exactly once. It moves captured values out.

Every `Fn` is also `FnMut`, and every `FnMut` is also `FnOnce`.

### An iterator implements `next`

A type that implements `fn next(&mut self) -> Option<Self::Item>` is an iterator. The `Iterator` trait gives it all the adapters for free.

```rust
let v = vec![1, 2, 3, 4, 5];

let doubled: Vec<i32> =
    v.iter().map(|x| x * 2).collect();
let evens: Vec<&i32> = v.iter()
    .filter(|&&x| x % 2 == 0)
    .collect();
let sum: i32 = v.iter().sum();
let product: i32 =
    v.iter().fold(1, |acc, x| acc * x);
```

### Adapters are lazy

An adapter does no work until a consuming method runs. Consuming methods include `collect`, `sum`, `for_each`, `count`, `any` and `all`. A chain of ten adapters allocates only the final output. JavaScript's `Array.prototype.map` builds a new array at once.

```rust
// Nothing runs until collect()
let result: Vec<i32> = (0..1_000_000)
    .filter(|x| x % 2 == 0)
    .map(|x| x * x)
    .take(5)
    .collect();
// [0, 4, 16, 36, 64]
```

### `chain` joins iterators and `zip` pairs them

```rust
let a = [1, 2];
let b = [3, 4];
// [1, 2, 3, 4]
let chained: Vec<i32> = a.iter()
    .chain(b.iter())
    .copied()
    .collect();
// [(1, 3), (2, 4)]
let zipped: Vec<(i32, i32)> = a.iter()
    .zip(b.iter())
    .map(|(&x, &y)| (x, y))
    .collect();
```

### `collect` builds many types

`collect` works for any type that implements `FromIterator`. Common targets are `Vec`, `String`, `HashMap`, `HashSet` and `Result<Vec<T>, E>`.

## Watch out

- An adapter chain that you never consume does nothing.
- Adapters such as `map` carry `#[must_use]`, so the compiler warns about most unused chains. Do not forget the final `.collect()`, `.sum()` or `.for_each()`.
- `.iter()` gives borrowed `&T` items. `.into_iter()` on an owned `Vec<T>` gives owned `T` items and consumes the vector.
- Mixing up `.iter()` and `.into_iter()` is the most common iterator compile error for new users.
- `filter` on `.iter()` gets `&&i32` items. Write `filter(|&&n| ...)` to match both references.
- `fold` takes its accumulator type from the initial value. A product must start at `1`. A start of `0` makes every result `0`.

## The task

Write four functions that use iterators and closures.

1. `fn even_squares(nums: &[i32]) -> Vec<i32>` returns the square of each even number, in input order.
2. `fn product(nums: &[i32]) -> i32` returns the product of all elements. Use `fold`.
3. `product` returns `1` for an empty slice.
4. `fn long_words_upper(words: Vec<String>, min_len: usize) -> Vec<String>` keeps each word longer than `min_len`.
5. `long_words_upper` returns the kept words in uppercase, in their original order.
6. `fn zip_sum(a: &[i32], b: &[i32]) -> Vec<i32>` returns the sums of elements at the same index.
7. If the slices differ in length, `zip_sum` stops at the end of the shorter one.

Empty input gives an empty `Vec` for `even_squares`, `long_words_upper` and `zip_sum`.

```rust
even_squares(&[1, 2, 3, 4, 5, 6])
// [4, 16, 36]
even_squares(&[1, 3, 5])  // []
even_squares(&[])         // []
even_squares(&[2])        // [4]

product(&[1, 2, 3, 4, 5])  // 120
product(&[])               // 1
product(&[7])              // 7
product(&[3, 0, 7])        // 0

let words: Vec<String> =
    ["hi", "hello", "rust", "a"]
        .iter().map(|s| s.to_string())
        .collect();
long_words_upper(words, 3)
// ["HELLO", "RUST"]
long_words_upper(vec![], 2)  // []
long_words_upper(
    vec!["hi".to_string()], 10)
// []

zip_sum(&[1, 2, 3], &[10, 20, 30])
// [11, 22, 33]
zip_sum(&[1, 2], &[10, 20, 30])
// [11, 22]
zip_sum(&[1, 2, 3], &[10])  // [11]
zip_sum(&[], &[])           // []
```
