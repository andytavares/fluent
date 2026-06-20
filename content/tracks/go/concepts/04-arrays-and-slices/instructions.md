# Arrays & Slices

## What you'll learn

Slices are Go's primary sequence type — dynamic, backed by an array. You'll use them constantly.

## Key concepts

**Creating slices:**

```go
nums := []int{1, 2, 3}          // literal
s    := make([]int, 0, 10)       // empty, capacity 10
```

**Appending:**

```go
s = append(s, 4, 5)
```

**Ranging:**

```go
for i, v := range nums {
    fmt.Println(i, v)
}
```

**Slicing a slice:**

```go
nums[1:3]   // elements at index 1, 2 (not 3)
nums[:2]    // first two
nums[2:]    // from index 2 to end
```

## The task

Implement two functions:

1. `Sum(nums []int) int` — returns the sum of all elements
2. `Filter(nums []int, threshold int) []int` — returns a new slice containing only elements **greater than** `threshold`
