# Concurrency

## What you'll learn

Building on streams (concept 4), which already relies on lambdas like `n -> n * 2` for `filter`/`map`: Java concurrency is built on `Thread` and `Runnable`, but modern code uses `ExecutorService` and `CompletableFuture` instead of managing threads directly. `synchronized` provides mutual exclusion. `volatile` ensures visibility across threads. The `java.util.concurrent` package has higher-level tools for most real-world patterns.

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

**vs other languages:** Go's goroutines are lighter-weight than Java threads (default stack ~2 KB vs ~1 MB); channels replace most mutex patterns. C++ exposes thread and mutex directly with less abstraction. JavaScript is single-threaded, so no shared-memory concurrency. Python's GIL prevents true CPU-bound thread parallelism; `multiprocessing` is the workaround.

## Watch out

- **`count++` is not atomic** — it's a read, an increment, and a write. Two threads racing on a plain `int` field can lose updates. `AtomicInteger.incrementAndGet()` (or a `synchronized` method) is required for correctness under concurrent access.
- **`ExecutorService.submit()` returns immediately** — the work hasn't necessarily started, let alone finished. You must call `.get()` (blocking) on every `Future` you care about, or the caller may proceed before the work is done.
- **Forgetting `exec.shutdown()`** leaves the thread pool's threads alive indefinitely, which can prevent the JVM from exiting in a real (non-test) program.

## The task

You're building small concurrency primitives on top of `java.util.concurrent`. Implement the following in `Solution.java`:

**`class AtomicCounter`** — a thread-safe counter backed by `AtomicInteger`. Methods: `void increment()`, `void decrement()`, `int value()`. Must give correct results even when many threads call `increment()`/`decrement()` concurrently.

**`static List<Integer> parallelMap(List<Integer> items, Function<Integer,Integer> fn, int threads)`** — applies `fn` to every element of `items` in parallel using a fixed-thread-pool `ExecutorService` sized to `threads`; returns the results in the **same order** as the input list, regardless of which thread finishes first.

**`static CompletableFuture<Integer> asyncSquare(int n)`** — returns a `CompletableFuture<Integer>` that resolves asynchronously to `n * n`.

```java
AtomicCounter c = new AtomicCounter();
c.value();       // 0
c.increment(); c.increment(); c.decrement();
c.value();       // 1

// 1000 threads calling c.increment() concurrently still yields exactly 1000 —
// that's the whole point of AtomicInteger over a plain int field.

parallelMap(List.of(1, 2, 3, 4, 5), n -> n * 2, 2);  // [2, 4, 6, 8, 10] — order preserved
parallelMap(List.of(), n -> n, 4);                    // []
parallelMap(List.of(7), n -> n * n, 2);               // [49]

asyncSquare(5).get();   // 25
asyncSquare(0).get();   // 0
asyncSquare(-3).get();  // 9
```
