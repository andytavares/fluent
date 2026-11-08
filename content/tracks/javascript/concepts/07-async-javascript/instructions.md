## What you build

You write four async functions: a timer, a fallback wrapper, a concurrent runner and a retry helper. `retryAsync` is the `retry` loop from Error Handling, with `await`. This lesson builds on **Control Flow** and **Error Handling**.

## Key concepts

### One thread and an event loop

JavaScript is single-threaded. The call stack runs synchronous code to completion, then the event loop takes the next task from the queue. Synchronous code runs first, then microtasks (Promise callbacks), then macrotasks (`setTimeout`, I/O).

### A Promise holds a future value

A Promise is pending, fulfilled or rejected. `.then` always returns a new Promise, so chains stay flat. `.catch` handles a rejection from any earlier step and can recover with a new value or Promise.

```js
fetch("/api/user")
  .then(res => res.json())
  .then(user => console.log(user.name))
  .catch(err => console.error(err))
  .finally(() => setLoading(false));
```

### Wrap a callback API once

Make a Promise with `new Promise`, then use Promises everywhere else.

```js
function delay(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms));
}
```

### `async` and `await` are syntax over Promises

An `async` function always returns a Promise. `await` pauses that function until the Promise settles, and the event loop keeps running. A rejection becomes a thrown exception at the `await`, so `try`/`catch` works as in Error Handling.

```js
async function loadUser(id) {
  try {
    const res =
      await fetch(`/api/users/${id}`);
    if (!res.ok) {
      throw new Error(
        `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    throw new Error(
      `Failed to load user: ${e.message}`);
  }
}
```

### Start Promises together to run them concurrently

Two `await` lines in a row run one after the other. `Promise.all` runs them at the same time. It resolves with the results in input order, whatever finishes first. It rejects as soon as one input rejects.

```js
// Sequential: waits for a, then b
const a = await fetchA();
const b = await fetchB();

// Concurrent: both in flight at once
const [a, b] = await Promise.all(
  [fetchA(), fetchB()]);

// Race: the first to settle wins
const result = await Promise.race(
  [fetchA(), timeout(5000)]);
```

### Other languages use other models

Python's `asyncio` has the same shape, but you start its event loop with `asyncio.run()`. Java uses the more verbose `CompletableFuture`, with no `await`, and Go uses goroutines and channels. One thread means you never need a mutex around shared data. It also means a synchronous loop blocks the whole process.

## Watch out

- A missing `await` gives no error. You get a pending Promise, and its errors become unhandled rejections.
- `await` inside a plain `for` loop runs tasks one at a time. Start all Promises first, for example with `map`, then use `Promise.all`.
- `array.forEach(async ...)` awaits nothing. `forEach` ignores the returned Promises.
- `Promise.all` stops at the first rejection. Use `Promise.allSettled` when you need every outcome.

## The task

Write four async functions in `stub.js`. Each must return a Promise, because the tests `await` them.

1. `delay(ms)` returns a Promise that resolves with `undefined` after about `ms` milliseconds.
2. `fetchWithFallback(primaryFn, fallbackFn)` takes two functions with no arguments that return Promises.
3. It calls `primaryFn()`. If that fulfills, it resolves with its value and does not call `fallbackFn`.
4. If `primaryFn()` rejects, it resolves with the result of `fallbackFn()`.
5. If the fallback also rejects, it rejects with the fallback's error.
6. `runAll(tasks)` takes an array of async functions with no arguments.
7. `runAll` starts all tasks at the same time and resolves with their values.
8. `runAll` rejects if any task rejects.
9. `retryAsync(fn, times)` calls the async function `fn()` up to `times` times and awaits each call.
10. `retryAsync` resolves with the first fulfilled value.
11. If all calls reject, `retryAsync` rejects with the error from the last call.

`delay` never resolves noticeably early. Wrap `setTimeout` in a `new Promise`.

`runAll` must not await one task before it starts the next. The values follow the input order, not the order of completion. An empty array gives `[]`. The idiom is `Promise.all(tasks.map(t => t()))`.

`retryAsync` stops at the first success. A success on the first try means exactly one call. You can assume `times >= 1`.

```js
await delay(50)
// about 50 ms later: undefined
delay(0) instanceof Promise // true

await fetchWithFallback(
  () => Promise.resolve("primary"),
  () => Promise.resolve("fallback"))
// "primary"
await fetchWithFallback(
  () => Promise.reject(new Error("boom")),
  () => Promise.resolve("fallback"))
// "fallback"
await fetchWithFallback(
  () => Promise.reject(
    new Error("primary fail")),
  () => Promise.reject(
    new Error("fallback fail")))
// rejects: Error("fallback fail")

await runAll([]) // []
await runAll([
  async () => "a",
  async () => "b",
  async () => "c",
]) // ["a", "b", "c"]
// The slow task still comes first
await runAll([
  () => delay(30).then(() => "slow"),
  () => delay(1).then(() => "fast"),
]) // ["slow", "fast"]
await runAll([
  () => Promise.resolve("ok"),
  () => Promise.reject(
    new Error("task failed")),
]) // rejects: Error("task failed")

// One call, no retries
await retryAsync(
  () => Promise.resolve(42), 3) // 42

let calls = 0;
await retryAsync(() => {
  calls++;
  return calls < 3
    ? Promise.reject(new Error("not yet"))
    : Promise.resolve("done");
}, 5) // "done", and calls is 3

// Rejects after exactly 3 calls
await retryAsync(() =>
  Promise.reject(new Error("always")), 3)
// rejects: Error("always")
```
