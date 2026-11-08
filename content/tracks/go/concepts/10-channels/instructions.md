## What you build

You write `Generate`, a function that streams values through a channel. A channel is a typed pipe that passes values between goroutines. Go's slogan: "share memory by communicating". This lesson builds on **Goroutines**.

## Key concepts

### `make` creates a channel

On an unbuffered channel, a send blocks until a receiver is ready. On a buffered channel, a send blocks only when the buffer is full.

```go
// unbuffered
ch := make(chan int)
// buffered: holds 10 values
ch := make(chan int, 10)
```

### `<-` sends and receives

A receive blocks until a value is available.

```go
ch <- 42    // send
val := <-ch // receive
```

### `close` says no more values come

`range` receives until the sender closes the channel and no values are left.

```go
// the producer is done
close(ch)
for v := range ch {
}
```

### Direction types limit a channel

The compiler stops a function from sending on a receive-only channel. APIs use direction types at their boundaries.

```go
// callers can only receive
func producer() <-chan int
// only receives, never sends
func consumer(ch <-chan int)
```

### A generator returns its channel at once

The function starts a goroutine that sends the values. It returns the channel before the goroutine finishes, so callers range over values as they arrive.

```go
func Generate(nums ...int) <-chan int {
    ch := make(chan int)
    go func() {
        for _, n := range nums {
            ch <- n
        }
        close(ch)
    }()
    return ch
}
```

## Watch out

- A send on a closed channel panics. Only the sender closes a channel, never the receiver.
- A second `close` panics. With many producers, let one closer goroutine with a `WaitGroup` close it.
- A receive on a closed, empty channel returns the zero value at once. It does not block or panic.
- Use `v, ok := <-ch`. `ok` is `false` after the sender closes the channel and no values are left.
- An unbuffered send with no receiver blocks forever. `ch <- 1` alone in one goroutine hangs.
- The runtime detects some whole-program deadlocks and panics. A blocked goroutine elsewhere is a silent, permanent leak.
- Send from a new goroutine. Otherwise the generator blocks and never returns the channel.

## The task

Write `Generate(nums ...int) <-chan int`. It streams a variadic list of integers through a channel.

1. Create an unbuffered `chan int`.
2. Launch a goroutine that sends each value of `nums` in order.
3. The goroutine closes the channel after the last value.
4. Return the channel at once. Do not wait for the goroutine.
5. The return type is `<-chan int`, so callers can only receive.

With no arguments, the channel closes with no values. After the last value, `v, ok := <-ch` gives `ok == false`.

```go
// receives 1, 2, 3, 4, 5 in order
for v := range Generate(1, 2, 3, 4, 5) {
    fmt.Println(v)
}

// no values: the loop body never runs
for v := range Generate() {
    fmt.Println(v)
}

// receives 42
for v := range Generate(42) {
    fmt.Println(v)
}
```
