# Coroutines

## What you'll learn

Kotlin coroutines are the language's answer to async programming. They run concurrent code sequentially-looking — no callbacks, no `Promise` chains, no thread pools in your business logic.

## Key concepts

**`suspend` functions**

A `suspend` function can pause execution without blocking a thread. It can only be called from another `suspend` function or from a coroutine builder:

```kotlin
suspend fun fetchUser(id: Int): User {
    delay(100)   // suspends, not blocks
    return User(id, "Ada")
}
```

`delay` is the coroutine equivalent of `Thread.sleep` — it suspends the current coroutine and frees the thread to do other work.

**Coroutine builders**

| Builder | Returns | Use case |
|---------|---------|----------|
| `runBlocking` | T | Bridge between blocking and suspending code (tests, `main`) |
| `launch` | `Job` | Fire-and-forget coroutine |
| `async` | `Deferred<T>` | Concurrent computation, call `.await()` for the result |

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        delay(1000)
        println("done after 1s")
    }
    job.join()   // wait for the launched coroutine
}
```

**`async`/`await` for concurrent work**

```kotlin
fun main() = runBlocking {
    val a = async { fetchA() }   // starts immediately
    val b = async { fetchB() }   // starts immediately, runs concurrently
    println(a.await() + b.await())   // waits for both
}
```

Without `async`, sequential calls would run one after the other. With `async`, they overlap.

**`CoroutineScope` and structured concurrency**

Every coroutine runs inside a scope. Child coroutines are automatically cancelled when their parent scope is cancelled. This prevents coroutine leaks — the structured concurrency guarantee:

```kotlin
coroutineScope {   // creates a scope that waits for all children
    launch { task1() }
    launch { task2() }
}   // resumes only after both tasks complete
```

**Dispatchers**

Dispatchers control which thread(s) a coroutine runs on:

| Dispatcher | Threads | Use for |
|-----------|---------|---------|
| `Dispatchers.Default` | CPU-count threads | CPU-intensive work |
| `Dispatchers.IO` | Elastic pool (64+) | Blocking I/O |
| `Dispatchers.Main` | Main/UI thread | Android UI updates |
| `Dispatchers.Unconfined` | Caller thread | Testing / special cases |

```kotlin
withContext(Dispatchers.IO) {
    readFileFromDisk()   // runs on IO thread pool
}
```

## vs other languages

| Language | Async model | Keyword |
|----------|------------|---------|
| JavaScript | Event loop, `Promise` | `async`/`await` |
| Swift | `async`/`await` (Swift 5.5+) | `async`/`await` |
| Go | Goroutines + channels | `go` keyword |
| Java | `CompletableFuture`, `ExecutorService` | None built-in |

Go's goroutines are conceptually similar but lack structured cancellation. JavaScript's async/await is syntactically closest but single-threaded. Kotlin's `async`/`await` can run on multiple threads and the scope model makes cancellation automatic.

**Note:** Coroutines require the `kotlinx-coroutines-core` library. Add `implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.0")` to your Gradle build.

## The task

The tasks here use `runBlocking` to bridge blocking test code with coroutines. Implement the following in `stub.kt`:

- `suspend fun retry(times: Int, block: suspend () -> String): String` — calls `block` up to `times` times. Returns the first successful result. If `block` throws on every attempt, rethrow the last exception.
- `suspend fun fetchAll(ids: List<Int>, fetch: suspend (Int) -> String): List<String>` — fetches all IDs concurrently using `async` and returns results in the same order as `ids`.
- `suspend fun withTimeout(ms: Long, block: suspend () -> String): String?` — runs `block` and returns its result. Returns `null` if `block` takes longer than `ms` milliseconds. Use `kotlinx.coroutines.withTimeoutOrNull`.
