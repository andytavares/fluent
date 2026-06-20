# Goroutines

## What you'll learn

Goroutines are Go's lightweight concurrency primitive — like threads, but managed by the Go runtime and very cheap (a few KB each).

## Key concepts

**Launch a goroutine** with the `go` keyword:

```go
go func() {
    fmt.Println("runs concurrently")
}()
```

**sync.WaitGroup** lets you wait for goroutines to finish:

```go
var wg sync.WaitGroup
for i := 0; i < 3; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()
        doWork(n)
    }(i)
}
wg.Wait()  // blocks until all 3 goroutines call Done()
```

**sync.Mutex** protects shared state:

```go
var mu sync.Mutex
mu.Lock()
sharedVar++
mu.Unlock()
```

## The task

Implement `ConcurrentDouble(nums []int) []int` that returns a new slice where each element is doubled. Use one goroutine per element. Use `sync.WaitGroup` to wait for all goroutines. Preserve the original order (use index-based assignment, not append).
