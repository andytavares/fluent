## What you build

You write a generic function, a function with a lifetime annotation and a generic `Stack<T>`. Generics make one piece of code work for many types at no runtime cost. Lifetimes tell the borrow checker how long references stay valid across function boundaries. This lesson builds on **Traits**.

## Key concepts

### A generic function takes a type parameter

Put the type parameter in angle brackets after the function name. A trait bound limits which types it accepts.

```rust
fn largest<T: PartialOrd>(list: &[T])
    -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

### A generic struct holds values of a type parameter

An `impl` block for a generic struct can add trait bounds for its methods.

```rust
struct Pair<T> {
    first: T,
    second: T,
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.first >= self.second {
            println!("first: {}",
                self.first);
        } else {
            println!("second: {}",
                self.second);
        }
    }
}
```

### Monomorphization removes the runtime cost

For `largest(&[1, 2, 3])`, the compiler generates a concrete version of `largest` for `i32`. So `Vec<String>` and `Vec<i32>` are different compiled types. Java erases generic types, so `List<String>` and `List<Integer>` are the same class at runtime.

### A lifetime annotation links an output to its inputs

A function that takes two references and returns one must say which input the output borrows from. The lifetime parameter `'a` states this relationship.

```rust
fn longest<'a>(x: &'a str, y: &'a str)
    -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

The annotation says that the returned reference is valid while both `x` and `y` are valid. It does not set a lifetime. It describes a relationship that already exists.

### Lifetime elision fills in common cases

The compiler infers lifetimes with three rules:

1. Each reference parameter gets its own lifetime.
2. If there is exactly one input lifetime, all outputs get it.
3. If there is a `&self` or `&mut self` parameter, all outputs get its lifetime.

```rust
fn first_word(s: &str) -> &str { }
// The compiler reads it as:
fn first_word<'a>(s: &'a str)
    -> &'a str { }
```

### `'static` lasts for the whole program

String literals have the type `&'static str`.

### A struct that holds a reference needs a lifetime

```rust
struct Excerpt<'a> {
    part: &'a str,
}
```

## Watch out

- `pub struct Stack<T>` does not make `Stack::new` public. Each method in the `impl` block needs its own `pub`.
- Without `pub` on a method, the struct is visible but the method is not.
- Use turbofish (`::<T>`) when the compiler cannot infer `T`. An example is `first_element::<i32>(&[])`.
- An empty slice has no element to infer `T` from.
- You do not choose a lifetime value. A lifetime parameter names a relationship the compiler already sees.
- If the compiler rejects an annotation, change what the function borrows from. Do not only rename the lifetime.

## The task

Write two generic functions and a generic stack.

1. `fn first_element<T: Clone>(slice: &[T]) -> Option<T>` returns a clone of the first element in `Some`. It returns `None` for an empty slice.
2. `fn longer<'a>(a: &'a str, b: &'a str) -> &'a str` returns the longer string slice.
3. If `a` and `b` have equal length, `longer` returns `a`.
4. `struct Stack<T>` is a last-in, first-out (LIFO) stack. Store the items in a `Vec<T>`.
5. `pub fn new() -> Self` returns an empty stack.
6. `pub fn push(&mut self, item: T)` adds `item` to the top.
7. `pub fn pop(&mut self) -> Option<T>` removes and returns the top item. It returns `None` on an empty stack.
8. `pub fn peek(&self) -> Option<&T>` returns a reference to the top item without removing it. It returns `None` on an empty stack.
9. `pub fn is_empty(&self) -> bool` returns `true` when the stack has no items.

```rust
first_element(&[1, 2, 3])    // Some(1)
first_element(&[42])         // Some(42)
first_element::<i32>(&[])    // None
first_element(&["a", "b"])   // Some("a")

longer("hello", "hi")  // "hello"
longer("hi", "hello")  // "hello"
// Equal length: the first wins
longer("abc", "xyz")   // "abc"
longer("", "a")        // "a"

let mut s: Stack<i32> = Stack::new();
s.is_empty()  // true
s.peek()      // None
s.pop()       // None
s.push(10);
s.is_empty()  // false
s.peek()      // Some(&10)
s.push(20);
s.peek()      // Some(&20)
s.pop()       // Some(20)
s.pop()       // Some(10)
s.is_empty()  // true
```
