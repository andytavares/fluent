# Async JavaScript

## What you'll learn

JavaScript is single-threaded. Asynchrony works through the event loop: the call stack runs synchronous code to completion, then the event loop picks the next task from the queue. Promises and async/await are the standard mechanism for working with deferred values.

## Key concepts

**The event loop in one sentence:** synchronous code runs first, microtasks (Promise callbacks) run next, then macrotasks (`setTimeout`, I/O).

**Callbacks — the original model (avoid in new code):**
```js
fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) return handleError(err);
  processData(data);  // nested callbacks become "callback hell"
});
```

**Promises:**
```js
fetch("/api/user")
  .then(res => res.json())
  .then(user => console.log(user.name))
  .catch(err => console.error(err))
  .finally(() => setLoading(false));
```
A Promise is one of three states: pending, fulfilled, or rejected. `.then` always returns a new Promise, so chains are flat — not nested.

**Creating a Promise:**
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
An `async` function always returns a Promise. `await` pauses execution of that function until the awaited Promise settles — the event loop remains unblocked.

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

**vs other languages:** Python's `asyncio` / `async def` / `await` is structurally identical but uses an explicit event loop you run with `asyncio.run()`. Java uses `CompletableFuture` — more verbose, no `await` syntax. Go uses goroutines and channels rather than a Promise model. JavaScript's single-threaded model means you never need a mutex around shared data — but it also means a synchronous loop can block the entire process.

## The task

Implement four functions. Each must return a Promise — the test runner `await`s them.

- `delay(ms)` — return a Promise that resolves with `undefined` after `ms` milliseconds
- `fetchWithFallback(primaryFn, fallbackFn)` — call `primaryFn()` (returns a Promise); if it rejects, return the result of `fallbackFn()` instead; if that also rejects, reject with the fallback's error
- `runAll(tasks)` — given an array of zero-argument async functions, run them all concurrently and return an array of their resolved values in the same order (hint: `Promise.all`)
- `retryAsync(fn, times)` — call `fn()` up to `times` times; return the first resolved value; if all attempts reject, reject with the last error
