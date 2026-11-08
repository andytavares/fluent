## What you build

You write three coroutine functions: `delay_echo`, `gather_echoes` and `first_success`. They go from one delayed value to concurrent execution. This lesson builds on **Error Handling**.

## Key concepts

### `async def` defines a coroutine function

A call to `fetch("x")` does not run the body. It returns a coroutine object. You must `await` it, or run it with `asyncio.run`.

```python
import asyncio

async def fetch(url: str) -> str:
    # Stands in for an I/O wait
    await asyncio.sleep(0.1)
    return f"data from {url}"
```

### `asyncio.run` is the entry point

`asyncio.run` starts an event loop, runs the coroutine to the end, then closes the loop.

```python
async def main():
    result = await fetch("https://a.io")
    print(result)

asyncio.run(main())
```

### `asyncio.gather` runs coroutines concurrently

`gather` returns a list of results in argument order, not in completion order. JavaScript `Promise.all` does the same job.

```python
async def main():
    results = await asyncio.gather(
        fetch("url1"),
        fetch("url2"),
        fetch("url3"),
    )
    # All three run concurrently
    print(results)
```

### `return_exceptions=True` collects errors as values

With this flag, an exception becomes an item in the result list. `gather` then waits for every coroutine.

```python
results = await asyncio.gather(
    coro1(), coro2(), coro3(),
    return_exceptions=True,
)
for r in results:
    if isinstance(r, Exception):
        print(f"failed: {r}")
```

### `asyncio.create_task` schedules a coroutine now

`create_task` wraps a coroutine in a task and schedules it at once. The task runs while your code waits at an `await`. You can await the task later.

```python
async def main():
    task = asyncio.create_task(
        fetch("url")
    )
    # Do other work here
    result = await task
```

### `asyncio.wait` returns finished and pending tasks

`asyncio.wait(tasks, return_when=...)` returns two sets: `done` and `pending`. With `asyncio.FIRST_COMPLETED`, it returns when the first task ends. It takes tasks, not bare coroutines.

```python
tasks = {asyncio.create_task(c)
         for c in coros}
done, pending = await asyncio.wait(
    tasks,
    return_when=asyncio.FIRST_COMPLETED,
)
```

### `async with` and `async for` await inside the protocol

`async with` awaits on entry and exit. `async for` awaits each item.

```python
async with aiohttp.ClientSession() as s:
    async with s.get(url) as resp:
        data = await resp.text()

async for record in async_db_cursor():
    process(record)
```

### Coroutines give up control only at `await`

`asyncio` is cooperative multitasking on one thread. A CPU-bound operation with no `await` blocks every other coroutine. For CPU-bound work, use `concurrent.futures.ProcessPoolExecutor` or `loop.run_in_executor()`.

```python
async def bad():
    # Blocks the whole loop for 1 s
    time.sleep(1)

async def good():
    await asyncio.sleep(1)
```

### Use `asyncio` for I/O and processes for CPU work

`threading` gives real OS threads, but the GIL limits CPU work. `asyncio` uses one thread, so it has no GIL contention, but it helps only with I/O-bound work. Many concurrent I/O connections suit `asyncio`, and CPU-bound work suits `multiprocessing`.

```python
# Many network calls: asyncio
# Heavy math: multiprocessing
```

## Watch out

- A call to an `async def` function without `await` only creates a coroutine object. The body never runs.
- Python then warns `RuntimeWarning: coroutine '...' was never awaited`. This is the most common `asyncio` bug.
- A blocking call in a coroutine stalls every task. Blocking calls include `time.sleep`, synchronous I/O and heavy CPU work.
- Use `asyncio.sleep`, not `time.sleep`. Move real blocking work to `loop.run_in_executor()`.
- You cannot call `asyncio.run()` from code that runs in an event loop. It raises `RuntimeError`.
- That error says `asyncio.run() cannot be called from a running event loop`.
- Without `return_exceptions=True`, `gather` raises the first exception at once. The other coroutines keep running, and you lose their results.

## The task

Write three coroutine functions in `stub.py`. They go from one delayed value to concurrent execution.

1. `async def delay_echo(message: str, delay: float) -> str` waits with `await asyncio.sleep(delay)`. Then it returns `message` unchanged.
2. `async def gather_echoes(messages: list[str], delay: float) -> list[str]` runs `delay_echo(m, delay)` for each `m` in `messages`.
3. `gather_echoes` runs the calls concurrently with `asyncio.gather`. It returns the results in input order, not completion order.
4. Three messages with `delay=0.05` take about 0.05 s in total, not 0.15 s.
5. `async def first_success(coros: list) -> object` runs every coroutine in `coros` concurrently.
6. `first_success` returns the result of the coroutine that finishes first.
7. Wrap each coroutine in a task. Use `asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)`.
8. After the first result, cancel the pending tasks. Do not leave them running.

An empty `messages` list gives `[]`. One coroutine in `coros` is the first by default.

```python
# Run each call with asyncio.run(...)
await delay_echo("hello", 0)  # "hello"
await delay_echo("", 0)       # ""
# Returns "x" after about 0.05 s
await delay_echo("x", 0.05)

await gather_echoes(["a", "b", "c"], 0)
# ["a", "b", "c"]
await gather_echoes(["z", "a", "m"], 0)
# ["z", "a", "m"]
await gather_echoes([], 0)  # []
# About 0.05 s in total
await gather_echoes(["a", "b", "c"], 0.05)

await first_success([
    delay_echo("slow", 0.1),
    delay_echo("fast", 0.01),
])  # "fast"
await first_success(
    [delay_echo("only", 0)]
)  # "only"
```
