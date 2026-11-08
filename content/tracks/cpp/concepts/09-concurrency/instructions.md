## What you build

You write a thread-safe `Counter`, a `parallel_sum` that splits work across threads, and an `async_square` that returns a future. C++11 added a portable threading model to the standard library. This lesson builds on **Exception Handling**.

## Key concepts

### `std::thread` starts an OS thread

The thread starts at once. `join()` waits for it to finish. `detach()` lets it run on its own, which is rarely correct.

```cpp
#include <thread>

void worker(int id) { /* ... */ }

std::thread t(worker, 42);
t.join();
```

### `std::mutex` protects shared state

`std::lock_guard` locks the mutex in its constructor. Its destructor unlocks the mutex. This is RAII.

```cpp
#include <mutex>

std::mutex mtx;
int counter = 0;

void increment() {
    std::lock_guard<std::mutex> lock(mtx);
    counter++;
}
```

### `std::async` runs a task and returns a `std::future`

`std::async` returns a `std::future<T>`. Call `.get()` once to get the result. If the task threw an exception, `.get()` throws it again.

```cpp
#include <future>

auto fut = std::async(
    std::launch::async,
    []() { return 42; });
// Blocks until the task finishes
int result = fut.get();
```

### `std::atomic` makes one variable thread-safe without a lock

Loads, stores and simple updates on a `std::atomic` are thread-safe. Use it for one variable that threads share. For anything more complex, use a mutex.

```cpp
#include <atomic>

std::atomic<int> count(0);
// Atomic increment: no mutex
count++;
count.load();     // atomic read
count.store(10);  // atomic write
```

### C++ threads map directly to OS threads

You get full performance, and no runtime stops a data race. Go multiplexes goroutines onto OS threads and uses channels for most sharing. Java has `synchronized`, `volatile` and `java.util.concurrent`. JavaScript is single-threaded, apart from Web Workers. Python's GIL stops threads from running CPU-bound work in parallel.

```cpp
// One OS thread per std::thread
std::vector<std::thread> pool;
for (int i = 0; i < 4; ++i)
    pool.emplace_back(worker, i);
for (auto& t : pool) t.join();
```

## Watch out

- Two threads that use one unprotected variable cause a data race. That is undefined behavior, not only wrong output.
- `counter++` from many threads can lose updates or tear values. Use `std::atomic` or a `std::mutex`.
- A thread lambda that captures `[&]` dangles if the thread outlives the scope. The thread can also race with the destruction.
- `join()` the thread, or synchronize, before the captured variables go out of scope.
- `std::future::get()` consumes the result. A second call is undefined behavior; many libraries throw `std::future_error`.
- A `std::thread` destroyed without `join()` or `detach()` calls `std::terminate()`. In Go, an unjoined goroutine is normal.

## The task

Write a counter and two functions in `stub.cpp`. The tests call them from real threads, so they must be thread-safe.

1. `class Counter` wraps a `std::atomic<int>` that starts at 0.
2. `void increment()` adds 1 atomically. `void decrement()` subtracts 1 atomically.
3. `int value() const` reads the current value atomically.
4. Calls from many threads at the same time lose no updates.
5. `int parallel_sum(const std::vector<int>& data, int num_threads)` returns the sum of all elements of `data`.
6. It splits `data` into at most `num_threads` contiguous chunks. It sums each chunk in its own `std::thread`.
7. Combine the chunk sums with a `std::mutex`, a `std::atomic<int>` or one partial sum per thread.
8. If `data` has fewer elements than `num_threads`, start only as many threads as you need.
9. `std::future<int> async_square(int n)` computes `n * n` with `std::async(std::launch::async, ...)`. It returns the `std::future<int>`.

`parallel_sum` returns `0` for an empty `data`. The caller of `async_square` gets the value with `.get()`.

```cpp
Counter c;
c.value();  // 0
c.increment();
c.increment();
c.value();  // 2
c.decrement();
c.value();  // 1

// 100 threads each call increment()
// once: value() is 100.
// 50 threads increment, 30 decrement:
// value() is 20.

std::vector<int> data =
    {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
parallel_sum(data, 1);   // 55
parallel_sum(data, 2);   // 55
parallel_sum(data, 4);   // 55
parallel_sum(data, 20);  // 55
parallel_sum({}, 4);     // 0
parallel_sum({42}, 2);   // 42

async_square(5).get();   // 25
async_square(0).get();   // 0
async_square(-3).get();  // 9
```
