## What you build

You write `Sum` and `Filter` over `[]int`. Go has fixed-size arrays, which you rarely use, and slices, which you use everywhere. This lesson builds on **Control Flow**.

## Key concepts

### A slice is a view of an array

A slice is a small header: a pointer, a length and a capacity. It points at a backing array that other slices can share.

```go
// slice literal
nums := []int{1, 2, 3}
// length 0, capacity 10
s := make([]int, 0, 10)
// nil slice: the zero value, length 0
var zero []int
```

### `append` returns the slice to keep

`append` grows the slice and can allocate a new backing array. Always assign the result.

```go
s = append(s, 4, 5)
```

### `range` gives the index and the value

```go
for i, v := range nums {
    fmt.Println(i, v)
}
```

### `s[low:high]` shares the backing array

The result holds indexes `low` up to `high - 1`. It uses the same memory as `s`.

```go
nums[1:3] // indexes 1 and 2
nums[:2]  // first two elements
nums[2:]  // index 2 to the end
```

### Length and capacity differ

The length is the number of elements in view. The capacity is the storage that exists before `append` must allocate.

```go
s := make([]int, 3, 10)
len(s) // 3
cap(s) // 10
```

## Watch out

- A sub-slice shares memory. After `sub := nums[1:3]`, `sub[0] = 99` also changes `nums[1]`. Use `copy` for an independent slice.
- If `cap(s) > len(s)`, `append` writes into the shared array. Other slices of that array see the change.
- If `append` exceeds the capacity, it allocates a new array. The two slices then diverge. Always use the returned value.
- A nil slice and an empty slice both have length 0. They work the same in loops and `append`.
- They differ under `reflect.DeepEqual`. JSON encodes nil as `null` and empty as `[]`. Prefer `var s []T`.
- `==` on two slices is a compile error. Arrays of comparable elements support `==`. Use `reflect.DeepEqual` or a loop.

## The task

Write two functions over `[]int`.

1. `Sum(nums []int) int` returns the sum of all elements.
2. The sum of an empty slice or a `nil` slice is `0`.
3. `Filter(nums []int, threshold int) []int` returns a new slice in the original order.
4. It keeps only the elements strictly greater than `threshold`.
5. If no element is greater, it returns a slice of length 0, such as `[]int{}`.

An element equal to `threshold` is not kept.

```go
Sum([]int{1, 2, 3, 4, 5}) // 15
Sum([]int{})              // 0
Sum([]int{-1, -2, 3})     // 0
Sum([]int{10})            // 10
Sum(nil)                  // 0

// []int{5, 8, 9}
Filter([]int{1, 5, 3, 8, 2, 9}, 4)
Filter([]int{1, 2, 3}, 10) // []int{}
Filter([]int{}, 0)         // []int{}
Filter([]int{5, 5, 5}, 5)  // []int{}
```
