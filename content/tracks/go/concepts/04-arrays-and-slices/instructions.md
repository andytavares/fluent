# Arrays & Slices

## What you'll learn

Go has two sequence types: fixed-size **arrays** (rarely used directly) and **slices** — a dynamically-sized view backed by an array, which is what you'll actually use everywhere. Understanding that a slice is a lightweight header (pointer, length, capacity) pointing at shared backing storage explains both `append`'s growth behavior and a family of aliasing bugs unique to Go.

## Key concepts

**Creating slices:**

```go
nums := []int{1, 2, 3}          // slice literal
s    := make([]int, 0, 10)      // length 0, capacity 10
var zero []int                   // nil slice — zero value, len(zero) == 0
```

**Appending** — grows the slice, possibly reallocating:

```go
s = append(s, 4, 5)   // always reassign the result of append
```

**Ranging** gives you index and value:

```go
for i, v := range nums {
    fmt.Println(i, v)
}
```

**Slicing a slice** — `s[low:high]` selects `[low, high)`, and the result **shares the same backing array** as `s`:

```go
nums[1:3]   // elements at index 1, 2 (index 3 excluded)
nums[:2]    // first two elements
nums[2:]    // from index 2 to the end
```

**`len` vs `cap`** — length is how many elements are in view; capacity is how much backing storage exists before a reallocation is needed:

```go
s := make([]int, 3, 10)
len(s)  // 3
cap(s)  // 10
```

## Watch out

- **Slicing aliases the original array.** `sub := nums[1:3]; sub[0] = 99` also changes `nums[1]` — they share memory. Use `copy()` if you need an independent slice.
- **`append` sometimes mutates the original, sometimes doesn't**, depending on whether capacity is exceeded. If `cap(s) > len(s)`, appending writes into the shared backing array (visible through other slices of it); if capacity is exceeded, `append` allocates a new array and the two slices diverge. Never rely on either behavior — always use the value `append` returns.
- A **nil slice** and an **empty (non-nil) slice** both have `len() == 0` and behave identically in loops and `append`, but they are *not* equal under `reflect.DeepEqual` and marshal differently to JSON (`null` vs `[]`). Prefer `var s []T` (nil) unless you specifically need an empty-but-non-nil value.
- Comparing two slices with `==` is a **compile error** — slices are not comparable (unlike arrays, which are, element by element, when their element type is comparable). Use `reflect.DeepEqual` or a loop.

## The task

Implement two functions over `[]int`.

**`Sum(nums []int) int`** — returns the sum of all elements. The sum of an empty slice is `0`.

```go
Sum([]int{1, 2, 3, 4, 5})   // 15
Sum([]int{})                // 0
Sum([]int{-1, -2, 3})       // 0
Sum([]int{10})              // 10
Sum(nil)                    // 0 — a nil slice has zero elements, same as empty
```

**`Filter(nums []int, threshold int) []int`** — returns a new slice containing only the elements of `nums` that are **strictly greater than** `threshold`, preserving order. If no elements qualify, return a slice with length 0 (not `nil` — return `[]int{}` or equivalent).

```go
Filter([]int{1, 5, 3, 8, 2, 9}, 4)   // []int{5, 8, 9}
Filter([]int{1, 2, 3}, 10)           // []int{} — nothing qualifies
Filter([]int{}, 0)                   // []int{}
Filter([]int{5, 5, 5}, 5)            // []int{} — threshold is exclusive, not inclusive
```
