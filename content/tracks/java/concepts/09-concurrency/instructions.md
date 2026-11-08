## What you build

You write a thread-safe counter, a parallel `map` over a thread pool and an asynchronous square function. Streams already use lambdas such as `n -> n * 2`, and thread pools run lambdas too. This lesson builds on **Streams API**.

## Key concepts

### Use a thread pool, not raw threads

Java concurrency rests on `Thread` and `Runnable`. Modern code uses `ExecutorService` and `CompletableFuture` instead, and `java.util.concurrent` has tools for most common patterns.

```java
import java.util.concurrent.*;

ExecutorService exec =
    Executors.newFixedThreadPool(4);

// Runs on a pool thread
Future<Integer> future =
    exec.submit(() -> 42);

// Blocks until done; throws on exception
int result = future.get();
exec.shutdown();
```

### Threads cost memory

Go goroutines start with about 2 KB of stack, against about 1 MB per Java thread. JavaScript and CPython with its GIL run no CPU-parallel threads.

```java
// One OS thread, with its own stack
Thread t = new Thread(task);
t.start();
t.join();
```

### `CompletableFuture` chains async steps

`supplyAsync` runs a task on another thread. `thenApply` transforms the result, and `exceptionally` gives a fallback on failure.

```java
CompletableFuture<Integer> cf =
    CompletableFuture
        .supplyAsync(() -> compute())
        .thenApply(n -> n * 2)
        .exceptionally(e -> -1);

// Like get(), but throws unchecked
cf.join();
```

### `synchronized` gives mutual exclusion

Only one thread at a time can run a `synchronized` method on the same object.

```java
class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int value() {
        return count;
    }
}
```

### `volatile` gives visibility

A write to a `volatile` field in one thread is visible at once to reads in other threads. It does not make compound operations atomic.

```java
private volatile boolean running = true;
```

### Atomic classes update without locks

`AtomicInteger` makes increments and compare-and-set (CAS) operations atomic.

```java
import java.util.concurrent.atomic.*;

AtomicInteger counter =
    new AtomicInteger(0);
// Atomic ++
counter.incrementAndGet();
// Set to 2 only if the value is 1
counter.compareAndSet(1, 2);
```

## Watch out

- `count++` is not atomic. It is a read, an increment and a write.
- Two threads that change a plain `int` field can lose updates.
- Use `AtomicInteger.incrementAndGet()` or a `synchronized` method for shared counters.
- `ExecutorService.submit()` returns at once. The work is not always started, and not always finished.
- Call `get()` on every `Future` you need. Otherwise the caller can continue before the work is done.
- Without `exec.shutdown()`, the pool threads stay alive. In a real program, they can stop the JVM from exiting.

## The task

Build small concurrency tools on top of `java.util.concurrent`. Write these in the class `Solution`.

1. `class AtomicCounter` is a thread-safe counter that uses an `AtomicInteger`.
2. It has `void increment()`, `void decrement()` and `int value()`. A new counter has the value 0.
3. The count stays correct when many threads call `increment()` and `decrement()` at the same time.
4. `static List<Integer> parallelMap(List<Integer> items, Function<Integer,Integer> fn, int threads)` applies `fn` to each item.
5. `parallelMap` uses a fixed thread pool `ExecutorService` with `threads` threads.
6. `parallelMap` returns the results in input order, whichever thread finishes first.
7. `static CompletableFuture<Integer> asyncSquare(int n)` returns a future that completes asynchronously with `n * n`.

An empty input list gives an empty result.

```java
AtomicCounter c = new AtomicCounter();
c.value();      // 0
c.increment();
c.increment();
c.value();      // 2
c.decrement();
c.value();      // 1

// 1000 threads that each call
// increment() once give exactly 1000

// [2, 4, 6, 8, 10]
parallelMap(List.of(1, 2, 3, 4, 5),
    n -> n * 2, 2);
// []
parallelMap(List.of(), n -> n, 4);
// [49]
parallelMap(List.of(7), n -> n * n, 2);

asyncSquare(5).get();   // 25
asyncSquare(0).get();   // 0
asyncSquare(-3).get();  // 9
```
