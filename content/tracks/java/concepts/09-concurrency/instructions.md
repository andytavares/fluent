# Concurrency

## What you'll learn

Java concurrency is built on `Thread` and `Runnable`, but modern code uses `ExecutorService` and `CompletableFuture` instead of managing threads directly. `synchronized` provides mutual exclusion. `volatile` ensures visibility across threads. The `java.util.concurrent` package has higher-level tools for most real-world patterns.

## Key concepts

**`ExecutorService`:**
```java
import java.util.concurrent.*;

ExecutorService exec = Executors.newFixedThreadPool(4);

Future<Integer> future = exec.submit(() -> {
    return 42;  // runs in a thread pool thread
});

int result = future.get();  // blocks until done, throws on exception
exec.shutdown();
```

**`CompletableFuture`:**
```java
CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(() -> compute())
    .thenApply(n -> n * 2)
    .exceptionally(e -> -1);

cf.join();  // like get() but throws unchecked
```

**`synchronized`:**
```java
class Counter {
    private int count = 0;

    public synchronized void increment() { count++; }
    public synchronized int value()      { return count; }
}
```

**`volatile`:**
```java
private volatile boolean running = true;

// a write in one thread is immediately visible to reads in other threads
// does NOT make compound operations atomic — use Atomic* for that
```

**`AtomicInteger`:**
```java
import java.util.concurrent.atomic.*;

AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();    // atomic ++
counter.compareAndSet(1, 2);  // CAS
```

**vs other languages:** Go's goroutines are lighter-weight than Java threads (default stack ~2 KB vs ~256 KB); channels replace most mutex patterns. C++ exposes thread and mutex directly with less abstraction. JavaScript is single-threaded, so no shared-memory concurrency. Python's GIL prevents true CPU-bound thread parallelism; `multiprocessing` is the workaround.

## The task

Implement the following in `Solution.java`:

- `class AtomicCounter` — thread-safe counter using `AtomicInteger`; methods `void increment()`, `void decrement()`, `int value()`
- `List<Integer> parallelMap(List<Integer> items, java.util.function.Function<Integer,Integer> fn, int threads)` — apply `fn` to every element in parallel using a fixed-thread-pool `ExecutorService`; return results in the original order
- `CompletableFuture<Integer> asyncSquare(int n)` — return a `CompletableFuture` that resolves to `n * n` asynchronously
