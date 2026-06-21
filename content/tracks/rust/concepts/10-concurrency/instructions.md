# Concurrency

## What you'll learn

Rust's ownership and type system extend into concurrency. `Send` and `Sync` are marker traits that the compiler uses to prevent data races at compile time. You get threads, message passing, and shared state — all checked.

## Key concepts

**`thread::spawn`.** Creates an OS thread. Takes a `move` closure so the closure owns everything it uses (enforced by `Send`).

```rust
use std::thread;

let handle = thread::spawn(move || {
    println!("hello from a thread");
});
handle.join().unwrap(); // wait for the thread to finish
```

**`Send` and `Sync` marker traits.**
- `Send`: safe to transfer ownership across thread boundaries.
- `Sync`: safe to share a reference (`&T`) across threads — i.e., `T: Sync` iff `&T: Send`.

The compiler automatically derives these for most types. Types with interior mutability that is not thread-safe (like `Rc<T>`, `Cell<T>`) are explicitly `!Send`/`!Sync`, and the compiler rejects code that tries to move them into a thread.

**`Arc<T>` — Atomic Reference Counted.** The thread-safe version of `Rc<T>`. Cloning an `Arc` gives another pointer to the same heap allocation; the allocation is dropped when the last `Arc` is dropped. Costs atomic operations on clone/drop.

```rust
use std::sync::Arc;

let data = Arc::new(vec![1, 2, 3]);
let data2 = Arc::clone(&data);

thread::spawn(move || println!("{:?}", data2)).join().unwrap();
println!("{:?}", data); // still accessible
```

**`Mutex<T>` — mutual exclusion.** Wraps a value so only one thread can access it at a time. `lock()` returns a `MutexGuard` (RAII) that releases the lock when dropped.

```rust
use std::sync::{Arc, Mutex};

let counter = Arc::new(Mutex::new(0u32));
let c = Arc::clone(&counter);

let handle = thread::spawn(move || {
    let mut num = c.lock().unwrap();
    *num += 1;
});
handle.join().unwrap();
println!("{}", *counter.lock().unwrap()); // 1
```

**`mpsc` — multiple producer, single consumer channels.** The standard message-passing primitive. `tx` is `Send`, so cloning it across threads is safe.

```rust
use std::sync::mpsc;

let (tx, rx) = mpsc::channel();
let tx2 = tx.clone();

thread::spawn(move || tx.send(1).unwrap());
thread::spawn(move || tx2.send(2).unwrap());

let a = rx.recv().unwrap();
let b = rx.recv().unwrap();
println!("{}", a + b); // 3 (order not guaranteed)
```

**Panic in a thread.** If a spawned thread panics, `handle.join()` returns `Err`. The parent thread is unaffected.

## vs other languages

| | Rust | Go | Java | TypeScript |
|---|---|---|---|---|
| Data race prevention | **compile-time** (Send/Sync) | race detector (runtime) | `synchronized` (manual) | single-threaded (mostly) |
| Shared state | `Arc<Mutex<T>>` | `sync.Mutex` (implicit ptr) | `synchronized` / `Lock` | `SharedArrayBuffer` (rare) |
| Message passing | `mpsc::channel` | goroutine channels | `BlockingQueue` | Worker `postMessage` |
| Thread join | `JoinHandle::join()` | `sync.WaitGroup` | `Thread.join()` | `Worker.terminate()` |

Go channels are bidirectional and goroutines are cheap (green threads). Rust uses OS threads by default but the `tokio` and `rayon` crates add green threads and data parallelism. The key difference: Go catches data races at runtime with its race detector; Rust prevents them at compile time — you cannot even express the pattern.

## The task

Implement two functions using threads, `Arc`, `Mutex`, and `mpsc`:

```rust
// Spawn `n` threads. Each thread adds its index (0..n) to a shared counter.
// Return the final counter value.
// Use Arc<Mutex<i32>>.
fn parallel_sum(n: u32) -> i32

// Spawn one thread per value in `items`. Each thread sends its value doubled
// back through an mpsc channel. Collect and return all results.
// Order in the returned Vec does not need to be preserved.
fn parallel_double(items: Vec<i32>) -> Vec<i32>
```
