## What you build

You write two functions that run work on threads: one shares a counter, and one sends results through a channel. Ownership and the type system extend to concurrency. The compiler uses the marker traits `Send` and `Sync` to prevent data races at compile time. This lesson builds on **Closures & Iterators**.

## Key concepts

### `thread::spawn` starts an OS thread

`thread::spawn` takes a `move` closure, so the closure owns everything it uses. `Send` enforces this rule.

```rust
use std::thread;

let handle = thread::spawn(move || {
    println!("hello from a thread");
});
// Wait for the thread to finish
handle.join().unwrap();
```

### `Send` and `Sync` mark thread-safe types

- `Send`: you can move ownership of the value to another thread.
- `Sync`: you can share a reference `&T` across threads. `T` is `Sync` exactly when `&T` is `Send`.

The compiler implements both traits automatically for most types. Types with interior mutability that is not thread-safe opt out. `Rc<T>` is neither `Send` nor `Sync`, and `Cell<T>` is not `Sync`. The compiler rejects code that moves or shares them across threads.

Go finds data races at runtime with its race detector, but in Rust you cannot express a data race at all.

### `Arc<T>` shares ownership across threads

`Arc` means Atomic Reference Counted. It is the thread-safe version of `Rc<T>`. A clone of an `Arc` points to the same heap allocation. Rust frees the allocation when the last `Arc` drops. Each clone and drop costs an atomic operation.

```rust
use std::sync::Arc;

let data = Arc::new(vec![1, 2, 3]);
let data2 = Arc::clone(&data);

thread::spawn(move || {
    println!("{:?}", data2)
}).join().unwrap();
// Still accessible
println!("{:?}", data);
```

### `Mutex<T>` lets one thread at a time use a value

`lock()` returns a `MutexGuard`. The guard releases the lock when it drops (RAII).

```rust
use std::sync::{Arc, Mutex};

let counter = Arc::new(Mutex::new(0u32));
let c = Arc::clone(&counter);

let handle = thread::spawn(move || {
    let mut num = c.lock().unwrap();
    *num += 1;
});
handle.join().unwrap();
// 1
println!("{}", *counter.lock().unwrap());
```

### `mpsc` channels pass messages

`mpsc` means multiple producer, single consumer. It is the standard tool for message passing. The sender `tx` is `Send`, so you can clone it and move each clone to a thread.

```rust
use std::sync::mpsc;

let (tx, rx) = mpsc::channel();
let tx2 = tx.clone();

thread::spawn(move || {
    tx.send(1).unwrap()
});
thread::spawn(move || {
    tx2.send(2).unwrap()
});

let a = rx.recv().unwrap();
let b = rx.recv().unwrap();
// 3: the order of a and b can change
println!("{}", a + b);
```

### A panic in a spawned thread stays in that thread

If a spawned thread panics, `handle.join()` returns `Err`. The parent thread continues.

### Rust threads are OS threads

The standard library uses OS threads. The `tokio` and `rayon` crates add lightweight tasks and data parallelism.

## Watch out

- Before the 2024 edition, `*counter.lock().unwrap()` as the last expression of a function does not compile. The sandbox compiles with the 2015 edition, so this applies to your code.
- The temporary `MutexGuard` drops after `counter`, at the end of the block. The borrow checker rejects that order.
- Bind the value to a local first, then return the local:

  ```rust
  let result = *counter.lock().unwrap();
  result
  ```

- The same expression inside a statement, such as `println!`, is fine. The guard drops at the end of that statement.
- An `mpsc` channel closes only when every `Sender` drops.
- If you clone `tx` for each thread but keep the original, `rx.iter()` and `recv()` block forever.
- A thread that panics while it holds a lock poisons the `Mutex`. Every later `.lock()` returns `Err`.
- `.unwrap()` on a poisoned lock spreads the panic to every thread that uses the `Mutex`.
- That is acceptable in this task. It is not acceptable in production code that must stay available.

## The task

Write two functions that use threads, `Arc`, `Mutex` and `mpsc`.

1. `fn parallel_sum(n: u32) -> i32` spawns `n` threads, with the indexes 0 to `n - 1`.
2. Each thread adds its index to a shared counter. Use `Arc<Mutex<i32>>`.
3. `parallel_sum` returns the final counter value.
4. `fn parallel_double(items: Vec<i32>) -> Vec<i32>` spawns one thread for each value in `items`.
5. Each thread sends its value times 2 through an `mpsc` channel.
6. `parallel_double` collects and returns all the results. The order of the results can differ from the input.

With `n = 0`, no thread starts and the sum is 0. With `n = 1`, only index 0 counts, so the sum is 0. An empty `items` returns an empty `Vec`.

```rust
// 0+1+2+3+4
parallel_sum(5)   // 10
parallel_sum(0)   // 0
parallel_sum(1)   // 0
parallel_sum(10)  // 45

// The tests sort the results first
parallel_double(vec![1, 2, 3, 4])
// [2, 4, 6, 8]
parallel_double(vec![0, -1, 5])
// [-2, 0, 10]
parallel_double(vec![100])  // [200]
parallel_double(vec![])     // []
```
