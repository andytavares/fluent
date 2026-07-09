# Async JavaScript

## What you'll learn

JavaScript is single-threaded. Asynchrony works through the event loop: the call stack runs synchronous code to completion, then the event loop picks the next task from the queue. Promises and async/await are the standard mechanism for working with deferred values. This lesson reuses two earlier patterns in async form: the function-wrapping factories from lesson 4 (closures) and the `retry` loop from lesson 5 (error handling) — `retryAsync` below is exactly `retry` with `await`.

## Key concepts

**The event loop in one sentence:** synchronous code runs first, microtasks (Promise callbacks) run next, then macrotasks (`setTimeout`, I/O).

**Promises:**
```js
fetch("/api/user")
  .then(res => res.json())
  .then(user => console.log(user.name))
  .catch(err => console.error(err))
  .finally(() => setLoading(false));
```
A Promise is in one of three states: pending, fulfilled, or rejected. `.then` always returns a new Promise, so chains are flat — not nested. `.catch` handles a rejection anywhere upstream and lets you recover by returning a new value (or Promise).

**Creating a Promise** — wrap a callback API once, use Promises everywhere else:
```js
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**async / await — syntactic sugar over Promises:**
```js
async function loadUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    throw new Error(`Failed to load user: ${e.message}`);
  }
}
```
An `async` function always returns a Promise. `await` pauses execution of that function until the awaited Promise settles — the event loop remains unblocked. A rejected Promise becomes a thrown exception at the `await`, so `try/catch` works exactly like lesson 5.

**Running Promises concurrently:**
```js
// Sequential — slower: waits for a, then b
const a = await fetchA();
const b = await fetchB();

// Concurrent — faster: both in-flight at once
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// Race — first to settle wins
const result = await Promise.race([fetchA(), timeout(5000)]);
```
`Promise.all` resolves with results **in input order** regardless of which finishes first, and rejects as soon as any input rejects.

**vs other languages:** Python's `asyncio` / `async def` / `await` is structurally identical but uses an explicit event loop you run with `asyncio.run()`. Java uses `CompletableFuture` — more verbose, no `await` syntax. Go uses goroutines and channels rather than a Promise model. JavaScript's single-threaded model means you never need a mutex around shared data — but it also means a synchronous loop can block the entire process.

## Watch out

- Forgetting `await` doesn't error — you just get a pending Promise where you expected a value, and errors from it become unhandled rejections.
- `await` inside a plain `for` loop runs tasks sequentially. Start all the Promises first (e.g. via `map`), then `Promise.all` them, for concurrency.
- `array.forEach(async ...)` does not await anything — `forEach` ignores returned Promises.
- `Promise.all` is fail-fast: one rejection rejects the whole thing (use `Promise.allSettled` when you need every outcome).

## The task

You're building four async utilities: a timer, a fallback wrapper, a concurrent runner, and a retry helper. **Each must return a Promise — the test runner `await`s them.**

**`delay(ms)`** — returns a Promise that resolves with `undefined` after approximately `ms` milliseconds (wrap `setTimeout` in a `new Promise`).

```js
const start = Date.now();
await delay(50);
Date.now() - start;  // ≈ 50 (never noticeably less)
delay(0) instanceof Promise;  // true
```

**`fetchWithFallback(primaryFn, fallbackFn)`** — both arguments are zero-argument functions returning Promises. Call `primaryFn()`; if it fulfills, resolve with its value — `fallbackFn` must **not** be called. If `primaryFn()` rejects, resolve with the result of `fallbackFn()` instead. If the fallback also rejects, reject with the **fallback's** error.

```js
await fetchWithFallback(() => Promise.resolve("primary"),
                        () => Promise.resolve("fallback"));   // "primary"

await fetchWithFallback(() => Promise.reject(new Error("boom")),
                        () => Promise.resolve("fallback"));   // "fallback"

await fetchWithFallback(() => Promise.reject(new Error("primary fail")),
                        () => Promise.reject(new Error("fallback fail")));
// rejects with Error("fallback fail")
```

**`runAll(tasks)`** — given an array of zero-argument async functions, starts them **all concurrently** (don't await one before starting the next) and resolves with an array of their resolved values **in the same order as the input array**, even if they finish out of order. Resolves with `[]` for an empty array. If any task rejects, the returned Promise rejects. (`tasks.map(t => t())` + `Promise.all` is the idiom.)

```js
await runAll([]);  // []

await runAll([
  async () => "a",
  async () => "b",
]);  // ["a", "b"]

// A slow first task still lands first in the results:
await runAll([
  () => delay(30).then(() => "slow"),
  () => delay(1).then(() => "fast"),
]);  // ["slow", "fast"] — input order, not completion order

await runAll([() => Promise.resolve("ok"),
              () => Promise.reject(new Error("task failed"))]);
// rejects with Error("task failed")
```

**`retryAsync(fn, times)`** — calls the zero-argument async function `fn()` up to `times` attempts, awaiting each. Resolves with the first fulfilled value; stops retrying on success (a first-try success means exactly one call). If all `times` attempts reject, rejects with the error from the **last** attempt. Assume `times >= 1`.

```js
await retryAsync(() => Promise.resolve(42), 3);  // 42 — one call, no retries

let calls = 0;
await retryAsync(() => {
  calls++;
  return calls < 3 ? Promise.reject(new Error("not yet"))
                   : Promise.resolve("done");
}, 5);  // "done", calls === 3

await retryAsync(() => Promise.reject(new Error("always")), 3);
// rejects with Error("always") after exactly 3 attempts
```
