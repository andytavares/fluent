## What you build

You write `ConcurrentDouble`, which doubles each element in its own goroutine. A goroutine is like a thread, but the Go runtime schedules it, not the OS. This lesson builds on **Error Handling**.

## Key concepts

### `go` starts a goroutine

A goroutine starts with a stack of a few KB that grows as needed. You can start thousands of them. The `go` statement returns at once.

```go
go func() {
    fmt.Println("runs concurrently")
}()
```

### `sync.WaitGroup` waits for goroutines

`Add` increments a counter, `Done` decrements it, and `Wait` blocks until it reaches 0.

```go
var wg sync.WaitGroup
for i := 0; i < 3; i++ {
    // increment before you launch
    wg.Add(1)
    go func(n int) {
        // decrement when this one ends
        defer wg.Done()
        doWork(n)
    }(i)
}
// blocks until the counter is 0
wg.Wait()
```

### `sync.Mutex` protects shared state

A read-modify-write such as `sharedVar++` is not atomic. Without the mutex, two goroutines that increment at once cause a data race, and updates are lost.

```go
var mu sync.Mutex
mu.Lock()
sharedVar++
mu.Unlock()
```

## Watch out

- This track runs Go 1.21. There, a `for` loop reuses one variable for all iterations.
- A goroutine that reads the loop variable directly can see its final value.
- Pass the variable as an argument, `go func(n int) {...}(i)`, or shadow it with `i := i`.
- Go 1.22 gives each iteration its own variable. Do not depend on that here.
- A goroutine that blocks forever is never garbage collected. Give each goroutine a way to return.
- Run `go test -race` to find data races. A passing test does not prove that code is race-free.
- Call `wg.Add(1)` before you launch the goroutine. If `Done` runs first, the counter goes negative and panics.

```go
for i := 0; i < 3; i++ {
    go func() {
        // Go 1.21 bug: can print 3, 3, 3
        fmt.Println(i)
    }()
}
```

## The task

Write `ConcurrentDouble(nums []int) []int`. It returns a new slice that holds each element of `nums` times 2.

1. Launch exactly one goroutine per index of `nums`.
2. Each goroutine writes `nums[i] * 2` to `result[i]` in a pre-sized result slice.
3. Do not use `append` from goroutines. Concurrent `append` is a data race.
4. Use `sync.WaitGroup` to wait for every goroutine before you return.
5. `result[i]` matches `nums[i]`, so the order stays the same.

An empty input returns an empty slice.

```go
// []int{2, 4, 6, 8, 10}
ConcurrentDouble([]int{1, 2, 3, 4, 5})
ConcurrentDouble([]int{0})  // []int{0}
ConcurrentDouble([]int{})   // []int{}
// []int{-2, 0, 2}
ConcurrentDouble([]int{-1, 0, 1})
```
