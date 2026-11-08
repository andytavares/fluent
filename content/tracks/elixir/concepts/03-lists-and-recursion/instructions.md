## What you build

You write a `ListUtils` module with five list functions, built with recursion instead of `Enum`. An Elixir list is a singly linked list, not an array, and that shapes every list idiom. This lesson builds on **Pattern Matching**.

## Key concepts

### A list is a head and a tail

Each list cell holds one element and a link to the rest of the list. The last link is the empty list `[]`.

```elixir
# Same as [1, 2, 3]
[1 | [2 | [3 | []]]]
```

### Prepend is cheap, append is not

`[new_head | list]` prepends in O(1). `list ++ [elem]` appends in O(n), because it copies the whole left list. In Python, JavaScript and Go, the default sequence is an array, where append is the cheap end.

### Lists are immutable

`list = [0 | list]` does not change the old list. It makes a new cell that shares the old list as its tail, with no copy. This is why prepend is cheap.

### Recursion has a base case and a recursive case

Most list functions have two clauses. The base case handles `[]`. The recursive case uses the head and recurses on the tail.

```elixir
def my_length([]), do: 0

def my_length([_ | tail]),
  do: 1 + my_length(tail)
```

### An accumulator makes a tail call

A tail call is a call that is the last operation in a function. The BEAM runs tail calls without growing the stack. An accumulator argument carries the partial result.

```elixir
def my_length(list),
  do: do_length(list, 0)

defp do_length([], acc), do: acc

defp do_length([_ | tail], acc),
  do: do_length(tail, acc + 1)
```

### Prepending to an accumulator reverses

Each step prepends the head to `acc` in O(1). When the input is empty, `acc` holds the input in reverse order, the same result as `Enum.reverse/1`.

```elixir
defp do_reverse([], acc), do: acc

defp do_reverse([h | t], acc),
  do: do_reverse(t, [h | acc])
```

### `Enum` does most daily list work

`Enum` works on any `Enumerable`: lists, maps, ranges and streams.

```elixir
Enum.map([1, 2, 3], fn x -> x * 2 end)
# => [2, 4, 6]
is_even = &(rem(&1, 2) == 0)
Enum.filter([1, 2, 3, 4], is_even)
# => [2, 4]
Enum.reduce([1, 2, 3], 0, &+/2) # => 6
Enum.sum([1, 2, 3])             # => 6
```

## Watch out

- `list ++ [x]` in a loop copies the left list each time. The loop becomes O(n²). Prepend, then reverse once.
- Recursion without an accumulator, such as `1 + my_length(tail)`, keeps one stack frame per element until the end.
- An accumulator built with `[head | acc]` comes out reversed. Reverse it once at the end.

## The task

Write five functions in the `ListUtils` module. Do not use `Enum`, except where a rule allows it.

1. `my_length(list)` returns the number of elements. Use a tail-recursive accumulator.
2. `my_sum(list)` returns the sum of the elements. Make it tail-recursive.
3. `my_reverse(list)` returns the elements in reverse order. Make it tail-recursive. Do not call `Enum.reverse`.
4. `my_map(list, fun)` applies `fun` to each element. It returns the results in the original order.
5. `flatten(list)` removes one level of nesting from a list of lists. You can use `Enum.concat/1` or `++` here.

For `my_map/2`, you can build the result reversed and reverse it once. Plain head recursion is also accepted.

Every function returns its empty value for `[]`: 0 for `my_length/1` and `my_sum/1`, and `[]` for the others. Empty inner lists add nothing to `flatten/1`.

```elixir
ListUtils.my_length([])          # => 0
ListUtils.my_length([1, 2, 3])   # => 3
ListUtils.my_sum([])             # => 0
ListUtils.my_sum([1, 2, 3, 4])   # => 10
ListUtils.my_sum([5])            # => 5
ListUtils.my_reverse([])         # => []
ListUtils.my_reverse([1, 2, 3])
# => [3, 2, 1]
ListUtils.my_reverse([1])        # => [1]
ListUtils.my_map([], & &1)       # => []

double = fn x -> x * 2 end
ListUtils.my_map([1, 2, 3], double)
# => [2, 4, 6]
ListUtils.my_map([1, 2], &to_string/1)
# => ["1", "2"]

ListUtils.flatten([])            # => []
ListUtils.flatten([[1, 2], [3, 4]])
# => [1, 2, 3, 4]
ListUtils.flatten([[1], [], [2, 3]])
# => [1, 2, 3]
```
