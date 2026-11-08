## What you build

You write `WordCount`, which counts each word in a string with a map. A Go map is a built-in hash map with O(1) average lookup, insert and delete. This lesson builds on **Arrays & Slices**.

## Key concepts

### Three ways to create a map

A `nil` map is the zero value. You can read from it, but a write panics.

```go
// literal
m := map[string]int{"a": 1, "b": 2}
// empty, ready to write
m := make(map[string]int)
// nil map
var m map[string]int
```

### Get, set and delete use the key

`delete` on a missing key does nothing. It never panics.

```go
m["key"] = 42
val := m["key"]
delete(m, "key")
```

### A missing key returns the zero value

There is no error and no `nil` for a missing `int` key. So `counts[word]++` works the first time: it reads `0` and stores `1`.

```go
m := map[string]int{}
m["missing"] // 0
```

### The comma-ok form tells absent from zero

Use it when a stored zero value and a missing key must give different results.

```go
val, ok := m["key"]
if !ok {
    // the key is not in the map
}
```

### Iteration order is random

The runtime changes the order on purpose, so your code cannot depend on it.

```go
for k, v := range m {
    fmt.Println(k, v)
}
```

## Watch out

- A write to a `nil` map compiles and then panics at runtime. Initialize with `make` or a literal first.
- For sorted output, collect the keys into a slice and call `sort.Strings`.
- `m["key"].Field = 1` is a compile error for a struct value. Copy it out, change it, write it back, or store pointers.
- Struct and array keys work because they are comparable. The compiler rejects slice, map and function keys.
- `strings.Split(s, " ")` returns `""` elements for consecutive spaces. Do not count `""` as a word.

## The task

Write `WordCount(s string) map[string]int`. It returns how many times each word appears in `s`.

1. One or more spaces separate the words.
2. The input is already lowercase. Do not change the case.
3. Extra spaces between words do not create empty words.
4. An empty string returns a map of length 0.

```go
// map[cat:1 mat:1 on:1 sat:1 the:2]
WordCount("the cat sat on the mat")
WordCount("")         // map[]
WordCount("hello")    // map[hello:1]
WordCount("a  a   a") // map[a:3]
```
