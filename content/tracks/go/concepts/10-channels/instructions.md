# Channels

## What you'll learn

Building on goroutines from the last lesson: channels are Go's typed pipes for passing values *between* goroutines, replacing shared-memory synchronization with communication ("don't communicate by sharing memory; share memory by communicating" is Go's own slogan). This lesson covers creating, sending, receiving, closing, and the direction-typed channel signatures idiomatic Go code uses at API boundaries.

## Key concepts

**Create:**

```go
ch := make(chan int)        // unbuffered — send blocks until a receiver is ready
ch := make(chan int, 10)    // buffered — send blocks only once 10 values are queued
```

**Send / receive:**

```go
ch <- 42      // send
val := <-ch   // receive, blocks until a value is available
```

**Close and range** — closing signals "no more values are coming":

```go
close(ch)               // producer signals it's done sending
for v := range ch { }   // consumer receives until the channel is closed and drained
```

**Direction-typed channels** restrict a function to only sending or only receiving, enforced at compile time:

```go
func producer() <-chan int { ... }   // returns a receive-only channel to callers
func consumer(ch <-chan int)         // only receives, never sends
```

**The generator pattern** — a function launches a goroutine to produce values and returns a channel immediately, so callers can range over results as they arrive:

```go
func Generate(nums ...int) <-chan int {
    ch := make(chan int)
    go func() {
        for _, n := range nums {
            ch <- n
        }
        close(ch)
    }()
    return ch   // returns before the goroutine finishes sending
}
```

## Watch out

- **Sending on a closed channel panics.** Only the sender should ever call `close`; a receiver must never close a channel it's reading from.
- **Closing an already-closed channel panics.** If multiple goroutines might finish producing, coordinate so `close` is called exactly once (e.g. only the last producer closes, or use a dedicated closer goroutine with a `WaitGroup`).
- **Receiving from a closed, drained channel doesn't block or panic** — it immediately returns the zero value. Use the two-value form `v, ok := <-ch` to distinguish "received a real (possibly zero) value" (`ok == true`) from "channel is closed and empty" (`ok == false`).
- **An unbuffered send with no receiver deadlocks forever** — `ch := make(chan int); ch <- 1` on the same goroutine with no other goroutine to receive hangs the program (Go's runtime detects *some* whole-program deadlocks and panics, but a leaked goroutine blocked on a channel is a silent, permanent leak, not a crash).
- Forgetting to launch the sender in its own goroutine turns a generator into a blocking call — the whole point of `Generate` returning a channel *before* all values are sent is that the goroutine does the sending concurrently.

## The task

Implement `Generate(nums ...int) <-chan int`, a generator that streams a variadic list of ints through a channel.

- Create an unbuffered `chan int`.
- Launch a goroutine that sends each value from `nums`, in order, into the channel, then closes the channel once all values are sent.
- Return the channel immediately — the function must not block waiting for the goroutine to finish.
- The return type is `<-chan int` (receive-only from the caller's perspective).

```go
for v := range Generate(1, 2, 3, 4, 5) {
    fmt.Println(v)   // prints 1, 2, 3, 4, 5 in order
}

for v := range Generate() {
    fmt.Println(v)   // never runs — no values sent, channel closes immediately
}

for v := range Generate(42) {
    fmt.Println(v)   // prints 42
}
```
