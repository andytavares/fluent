# Goroutines

## What you'll learn

Goroutines are Go's lightweight concurrency primitive — conceptually like threads, but scheduled by the Go runtime rather than the OS, and cheap enough (a few KB of stack, growing as needed) to spawn thousands of them. This lesson covers launching goroutines and the two `sync` primitives you need to coordinate them safely: `WaitGroup` and `Mutex`.

## Key concepts

**Launch a goroutine** with the `go` keyword — the call returns immediately, running concurrently:

```go
go func() {
    fmt.Println("runs concurrently")
}()
```

**`sync.WaitGroup`** blocks until a set of goroutines finish:

```go
var wg sync.WaitGroup
for i := 0; i < 3; i++ {
    wg.Add(1)              // increment the counter before launching
    go func(n int) {
        defer wg.Done()     // decrement when this goroutine finishes
        doWork(n)
    }(i)
}
wg.Wait()                  // blocks until the counter reaches 0
```

**`sync.Mutex`** protects shared state from concurrent writes:

```go
var mu sync.Mutex
mu.Lock()
sharedVar++
mu.Unlock()
```

Without the mutex, concurrent increments to `sharedVar` from multiple goroutines is a data race — the read-modify-write isn't atomic, and updates can be lost.

## Watch out

- **The classic loop-variable capture bug.** On Go **1.21 and earlier** (the version this track runs), a `for` loop reuses a single variable across iterations. If a goroutine closes over the loop variable directly instead of receiving it as a parameter, every goroutine can see the *same*, final value of the loop variable by the time it actually runs:
  ```go
  for i := 0; i < 3; i++ {
      go func() {
          fmt.Println(i)   // BUG on Go <1.22: likely prints 3, 3, 3 — not 0, 1, 2
      }()
  }
  ```
  Fix it by passing the loop variable as an argument (`go func(n int) { ... }(i)`) or by shadowing it inside the loop body (`i := i`). (Go 1.22+ changed the language so each iteration gets its own variable, but don't assume that here.)
- **Goroutine leaks**: a goroutine blocked forever (e.g. sending on a channel nobody reads from) never gets garbage collected — it's a real, permanent leak. Always ensure there's a receiver, a `context` cancellation, or some other way for every goroutine to eventually return.
- **`go test -race`** (the race detector) catches most data races in CI; a data race that "seems to work" in testing can still corrupt data in production under different timing. Never treat "the test passed" as proof a concurrent function is race-free without running with `-race`.
- Forgetting `wg.Add(1)` before (not after) launching the goroutine is a race in itself — if the goroutine finishes and calls `Done()` before the main goroutine reaches `Add(1)`, the counter goes negative and `Wait()` panics.

## The task

Implement `ConcurrentDouble(nums []int) []int` that returns a new slice where each element is the corresponding element of `nums` doubled, computed using one goroutine per element.

- Launch exactly one goroutine per index in `nums`.
- Each goroutine computes `nums[i] * 2` and writes it to `result[i]` — write by index into a pre-sized result slice, not `append` (appending concurrently from multiple goroutines is itself a data race).
- Use `sync.WaitGroup` to wait for every goroutine to finish before returning.
- The result must preserve the original order — `result[i]` corresponds to `nums[i]`.

```go
ConcurrentDouble([]int{1, 2, 3, 4, 5})   // []int{2, 4, 6, 8, 10}
ConcurrentDouble([]int{0})                // []int{0}
ConcurrentDouble([]int{})                 // []int{}
ConcurrentDouble([]int{-1, 0, 1})         // []int{-2, 0, 2}
```
