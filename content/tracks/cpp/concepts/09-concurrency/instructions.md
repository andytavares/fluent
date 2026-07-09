# Concurrency

## What you'll learn

C++11 added a portable threading model to the standard library. `std::thread` creates OS threads. `std::mutex` protects shared state. `std::async` and `std::future` provide task-based parallelism. `std::atomic` makes individual loads and stores thread-safe without locking.

## Key concepts

**`std::thread`:**
```cpp
#include <thread>

void worker(int id) { /* ... */ }

std::thread t(worker, 42);  // starts immediately
t.join();                   // wait for completion
// t.detach() lets it run independently (rarely correct)
```

**`std::mutex` and `std::lock_guard`:**
```cpp
#include <mutex>

std::mutex mtx;
int counter = 0;

void increment() {
    std::lock_guard<std::mutex> lock(mtx);  // RAII — unlocks on destruction
    counter++;
}
```

**`std::async` and `std::future`:**
```cpp
#include <future>

auto fut = std::async(std::launch::async, []() {
    return 42;
});

int result = fut.get();  // blocks until the task finishes
```

`std::async` returns a `std::future<T>`. Call `.get()` once to retrieve the result (or rethrow any exception the task threw).

**`std::atomic`:**
```cpp
#include <atomic>

std::atomic<int> count(0);
count++;           // atomic increment — no mutex needed for simple operations
count.load();      // atomic read
count.store(10);   // atomic write
```

Use `std::atomic` for single variables shared between threads. For anything more complex, use a mutex.

**vs other languages:** Go goroutines are lightweight user-space threads multiplexed onto OS threads; channels replace mutexes for most use cases. Java threads are heavier but have `synchronized`, `volatile`, and `java.util.concurrent`. JavaScript is single-threaded (Web Workers aside). Python's GIL means threads don't run CPU-bound work in parallel. C++ threads map directly to OS threads — maximum performance, maximum responsibility: there is no runtime stopping you from a data race.

## Watch out

- **An unprotected shared variable accessed from multiple threads is a data race** — undefined behavior, not just "possibly wrong output." `int counter; threads each do counter++;` can lose updates, tear values, or (per the standard) do anything at all. Use `std::atomic` for single values or a `std::mutex` for anything more complex.
- **Lambdas that capture by reference `[&]` into a `std::thread`** are a dangling-reference risk if the thread outlives the enclosing scope — the same footgun as lesson 5, now with a race condition added on top if the thread is still running when the referenced variable is destroyed. Always `join()` (or otherwise synchronize) before the captured variables go out of scope.
- **`std::future::get()` can only be called once** — it consumes the result. Calling it a second time throws `std::future_error`.
- **Forgetting to `join()` or `detach()` a `std::thread`** before its destructor runs calls `std::terminate()` and kills the whole program — unlike Go, where an unjoined goroutine is entirely normal.

## The task

Implement the following in `stub.cpp`. Tests run these functions with real threads, so implementations must be thread-safe.

**`class Counter`** — a thread-safe counter wrapping a `std::atomic<int>`:
- `void increment()` — atomically adds 1
- `void decrement()` — atomically subtracts 1
- `int value() const` — atomically reads the current value

```cpp
Counter c;
c.value();      // 0
c.increment();
c.increment();
c.decrement();
c.value();      // 1

// Safe to call from 100 threads concurrently — no lost updates:
// 100 threads each call c.increment() once → c.value() == 100
```

**`int parallel_sum(const std::vector<int>& data, int num_threads)`** — splits `data` into up to `num_threads` contiguous chunks, sums each chunk in its own `std::thread`, and returns the grand total (accumulate results behind a `std::mutex`, or use `std::atomic<int>`/per-thread partial sums). If `data` is empty, returns `0`. If `data` has fewer elements than `num_threads`, spawn only as many threads as needed.

```cpp
parallel_sum({1,2,3,4,5,6,7,8,9,10}, 1);   // 55
parallel_sum({1,2,3,4,5,6,7,8,9,10}, 4);   // 55 — same total regardless of split
parallel_sum({}, 4);                        // 0
parallel_sum({42}, 2);                      // 42
```

**`std::future<int> async_square(int n)`** — launches `n * n` asynchronously (via `std::async(std::launch::async, ...)`) and returns the resulting `std::future<int>`. The caller retrieves the value with `.get()`, which blocks until the task completes.

```cpp
auto f = async_square(5);
f.get();  // 25 — blocks until the async task finishes

async_square(0).get();   // 0
async_square(-3).get();  // 9
```
