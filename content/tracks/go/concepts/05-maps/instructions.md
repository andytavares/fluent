# Maps

## What you'll learn

Maps are Go's built-in hash map, giving O(1) average lookup, insert, and delete. Building on slices from the last lesson, maps are the other collection type you'll reach for constantly — and Go's "missing key returns the zero value" behavior (rather than throwing or returning `undefined`) shapes a lot of idiomatic Go code.

## Key concepts

**Creating:**

```go
m := map[string]int{"a": 1, "b": 2}   // literal
m := make(map[string]int)              // empty, ready to write
var m map[string]int                   // nil map — readable, panics on write
```

**Get / set / delete:**

```go
m["key"] = 42
val := m["key"]
delete(m, "key")   // no-op if key doesn't exist, never panics
```

**Missing keys return the zero value** — there's no exception or `nil` for a missing `int` key:

```go
m := map[string]int{}
m["missing"]   // 0 — not an error, not nil, just the zero value for int
```

This is exactly why the counting idiom `counts[word]++` works even the first time a word is seen: reading a missing key gives `0`, and `0 + 1 == 1`.

**Check existence explicitly** with the "comma-ok" idiom, when you need to distinguish "key absent" from "key present with the zero value":

```go
val, ok := m["key"]
if !ok {
    // key not present at all
}
```

**Iterate** — order is deliberately randomized by the runtime, so never depend on it:

```go
for k, v := range m {
    fmt.Println(k, v)
}
```

## Watch out

- **Writing to a `nil` map panics.** `var m map[string]int; m["x"] = 1` compiles fine and panics at runtime. Reading from a nil map is safe and returns zero values — only writes panic. Always initialize with `make` or a literal before writing.
- **Iteration order is randomized on every run**, on purpose, to stop you from accidentally depending on it. If you need sorted output, collect the keys into a slice and `sort.Strings` them.
- Map values obtained by indexing are **not addressable** — `m["key"].Field = 1` is a compile error if the value type is a struct. You must read the struct out, mutate the copy, and write it back, or store pointers in the map instead.
- Struct and array keys work (they're comparable), but slice, map, and function keys don't — the compiler rejects `map[[]int]string`.

## The task

Implement `WordCount(s string) map[string]int` that counts how many times each word appears in `s`. Words are separated by one or more spaces; treat the input as already lowercase (do not transform case yourself).

```go
WordCount("the cat sat on the mat")
// map[string]int{"the": 2, "cat": 1, "sat": 1, "on": 1, "mat": 1}

WordCount("")
// map[string]int{} — empty input, empty (but non-nil) map, len == 0

WordCount("hello")
// map[string]int{"hello": 1}

WordCount("a  a   a")
// map[string]int{"a": 3} — repeated/extra spaces between words don't create empty "words"
```

Splitting naively on a single space (`strings.Split(s, " ")`) produces empty-string elements when there are consecutive spaces — make sure your implementation doesn't count `""` as a word.
