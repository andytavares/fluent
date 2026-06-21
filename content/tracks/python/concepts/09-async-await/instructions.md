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

## The task

Implement three async functions:

- `async def delay_echo(message: str, delay: float) -> str` — waits `delay` seconds (using `asyncio.sleep`), then returns `message`
- `async def gather_echoes(messages: list[str], delay: float) -> list[str]` — runs `delay_echo` concurrently for each message using `asyncio.gather`; returns results in input order
- `async def first_success(coros: list) -> object` — runs all coroutines concurrently; returns the result of whichever completes first. Use `asyncio.wait` with `FIRST_COMPLETED`. Cancel remaining tasks after getting the first result.
