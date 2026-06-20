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

**vs other languages:** Go goroutines are lightweight user-space threads multiplexed onto OS threads; channels replace mutexes for most use cases. Java threads are heavier but have `synchronized`, `volatile`, and `java.util.concurrent`. JavaScript is single-threaded (Web Workers aside). Python's GIL means threads don't run CPU-bound work in parallel. C++ threads map directly to OS threads — maximum performance, maximum responsibility.

## The task

Implement the following in `stub.cpp`. Tests run functions with real threads, so implementations must be thread-safe:

- `class Counter` — wraps a `std::atomic<int>`; methods: `void increment()`, `void decrement()`, `int value() const`
- `int parallel_sum(const std::vector<int>& data, int num_threads)` — split data into `num_threads` chunks, sum each chunk in a separate `std::thread`, return the total (use a `std::mutex`-protected accumulator)
- `std::future<int> async_square(int n)` — return a `std::future` that resolves to `n * n`, launched asynchronously
