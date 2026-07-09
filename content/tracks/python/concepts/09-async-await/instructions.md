# Async & Await

## What you'll learn

Python's `asyncio` — coroutines, the event loop, concurrent execution with `asyncio.gather`, and the differences between async I/O and threading.

## Key concepts

**`async def` defines a coroutine function:**
```python
import asyncio

async def fetch(url: str) -> str:
    await asyncio.sleep(0.1)   # simulates I/O wait
    return f"data from {url}"
```

Calling `fetch("x")` does NOT execute the body — it returns a coroutine object. You must `await` it or schedule it with `asyncio.run`.

**`asyncio.run` — entry point:**
```python
async def main():
    result = await fetch("https://example.com")
    print(result)

asyncio.run(main())  # starts the event loop, runs main(), tears down
```

**`asyncio.gather` — concurrent execution:**
```python
async def main():
    results = await asyncio.gather(
        fetch("url1"),
        fetch("url2"),
        fetch("url3"),
    )
    # all three run concurrently; results is a list in argument order
    print(results)
```

`gather` returns results in the same order as the coroutines were passed, regardless of completion order.

**`asyncio.gather` with error handling:**
```python
results = await asyncio.gather(
    coro1(), coro2(), coro3(),
    return_exceptions=True,   # exceptions become values in the result list
)
for r in results:
    if isinstance(r, Exception):
        print(f"failed: {r}")
```

**`asyncio.create_task` — fire and forget, or await later:**
```python
async def main():
    task = asyncio.create_task(fetch("url"))
    # do other work here...
    result = await task
```

Tasks run concurrently as soon as they're created (vs `gather` which starts them together).

**`async for` and `async with`:**
```python
async with aiohttp.ClientSession() as session:
    async with session.get(url) as resp:
        data = await resp.text()

async for record in async_db_cursor():
    process(record)
```

## vs other languages

| Feature | Python | JavaScript | Java | Go |
|---|---|---|---|---|
| Concurrency model | Single-threaded event loop | Single-threaded event loop | Threads / virtual threads | Goroutines (M:N scheduled) |
| Async function | `async def` | `async function` | `CompletableFuture` / virtual threads | goroutine |
| Await | `await` | `await` | `.get()` / `.join()` | channel receive |
| Run concurrent tasks | `asyncio.gather` | `Promise.all` | `CompletableFuture.allOf` | `sync.WaitGroup` |
| Blocking call risk | Blocks the event loop | Blocks the event loop | Blocks the thread | Blocks the goroutine |

Python's `asyncio` is cooperative multitasking — coroutines voluntarily yield control at `await` points. A single CPU-bound operation without any `await` will block all other coroutines. For CPU-bound work, use `concurrent.futures.ProcessPoolExecutor` or `asyncio.run_in_executor`.

**Threading vs asyncio:** `threading` gives true OS threads but has the GIL for CPU work. `asyncio` has no GIL contention (single thread) but only helps with I/O-bound tasks. The rule of thumb: I/O-bound + many concurrent connections → asyncio; CPU-bound → multiprocessing.

## Watch out

- Calling an `async def` function without `await` (or scheduling it) does nothing but create a coroutine object — Python emits a `RuntimeWarning: coroutine '...' was never awaited` and the body never runs. This is the single most common `asyncio` bug.
- A blocking call (`time.sleep`, synchronous I/O, CPU-heavy work) inside a coroutine blocks the **entire event loop**, stalling every other concurrent task — use `asyncio.sleep` instead of `time.sleep`, and offload real blocking work to `run_in_executor`.
- `asyncio.run()` creates and tears down a new event loop; you can't call it from inside code that's already running in an event loop (e.g. inside a running coroutine) — you'll get `RuntimeError: asyncio.run() cannot be called from a running event loop`.
- `asyncio.gather` without `return_exceptions=True` cancels sibling tasks and re-raises on the **first** exception — you may lose results from tasks that had already completed successfully.

## The task

Implement three coroutine functions that build up from a single delayed value to concurrent execution.

**`async def delay_echo(message: str, delay: float) -> str`** — waits `delay` seconds using `await asyncio.sleep(delay)`, then returns `message` unchanged.

```python
await delay_echo("hello", 0.05)   # "hello", after ~0.05s
await delay_echo("", 0)           # ""
```

**`async def gather_echoes(messages: list[str], delay: float) -> list[str]`** — runs `delay_echo(m, delay)` **concurrently** for every `m` in `messages` using `asyncio.gather`, and returns the results as a list in the same order as the input (not completion order). Because the calls run concurrently, gathering 3 messages with `delay=0.05` takes roughly 0.05s total, not 0.15s.

```python
await gather_echoes(["a", "b", "c"], 0.05)   # ["a", "b", "c"], takes ~0.05s total (concurrent)
await gather_echoes([], 0.05)                 # []
```

**`async def first_success(coros: list) -> object`** — runs every coroutine in `coros` concurrently and returns the result of whichever finishes **first**. Use `asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)`, and cancel the still-pending tasks once you have the first result (don't leave them running).

```python
result = await first_success([
    delay_echo("slow", 0.1),
    delay_echo("fast", 0.01),
])
result   # "fast" — the coroutine with the shorter delay wins

await first_success([delay_echo("only", 0)])   # "only" — single coroutine, trivially "first"
```
