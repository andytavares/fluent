# Channels

## What you'll learn

Channels are Go's typed communication pipes between goroutines. They let goroutines safely pass values without shared memory.

## Key concepts

**Create:**

```go
ch := make(chan int)        // unbuffered
ch := make(chan int, 10)    // buffered (capacity 10)
```

**Send / receive:**

```go
ch <- 42      // send (blocks if unbuffered and no receiver)
val := <-ch   // receive (blocks until value available)
```

**Close and range:**

```go
close(ch)                // signal no more values
for v := range ch { }   // receive until closed
```

**Direction-typed channels** (good for function signatures):

```go
func producer() <-chan int { ... }  // returns receive-only channel
func consumer(ch <-chan int)        // receives only
```

## The task

Implement `Generate(nums ...int) <-chan int` that sends each number from `nums` into a channel and returns that channel. Close the channel after all values are sent. Launch a goroutine to do the sending so the function returns immediately.
