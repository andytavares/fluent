# Maps

## What you'll learn

Maps are Go's built-in hash map. They associate keys with values and provide O(1) average lookup.

## Key concepts

**Creating:**

```go
m := map[string]int{"a": 1, "b": 2}
m := make(map[string]int)
```

**Get/set/delete:**

```go
m["key"] = 42
val := m["key"]
delete(m, "key")
```

**Check existence** (the "comma-ok" idiom):

```go
val, ok := m["key"]
if !ok {
    // key not present
}
```

**Iterate:**

```go
for k, v := range m {
    fmt.Println(k, v)
}
```

## The task

Implement `WordCount(s string) map[string]int` that counts how many times each word appears in the string `s`. Words are separated by spaces. Treat the input as already lowercase — do not change case.

Example: `WordCount("the cat sat on the mat")` → `{"the": 2, "cat": 1, "sat": 1, "on": 1, "mat": 1}`
