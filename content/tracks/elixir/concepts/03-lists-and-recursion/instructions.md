# Lists & Recursion

## What you'll learn

Elixir lists are singly-linked lists, not arrays. This shapes every idiom: prepending is O(1), appending is O(n), and recursive algorithms naturally follow the head/tail structure. The `Enum` module handles most day-to-day list work, but understanding the recursive model is what makes Elixir click.

## Key concepts

**Linked list structure:**

```elixir
[1 | [2 | [3 | []]]]   # same as [1, 2, 3]
```

Prepend with `[new_head | existing_list]` — always O(1). Append with `list ++ [elem]` — O(n) because it copies the entire left list.

**The recursive template:**

Most list algorithms in Elixir follow this two-clause pattern:

```elixir
def my_length([]), do: 0
def my_length([_ | tail]), do: 1 + my_length(tail)
```

Base case: empty list. Recursive case: do something with `head`, recurse on `tail`.

**Accumulator pattern for tail-call optimization:**

The naive recursion above is not tail-recursive. With an accumulator it is:

```elixir
def my_length(list), do: do_length(list, 0)

defp do_length([], acc), do: acc
defp do_length([_ | tail], acc), do: do_length(tail, acc + 1)
```

Elixir (via BEAM) performs tail-call optimization when the recursive call is the last operation in the function. The accumulator pattern makes this possible.

**Building a reversed list** (the idiomatic intermediate step):

```elixir
defp do_reverse([], acc), do: acc
defp do_reverse([h | t], acc), do: do_reverse(t, [h | acc])
```

Prepending to `acc` is O(1) each step. When the input is exhausted `acc` is the reversed list. This is how `Enum.reverse/1` works internally.

**`Enum` basics:**

```elixir
Enum.map([1, 2, 3], fn x -> x * 2 end)    # => [2, 4, 6]
Enum.filter([1, 2, 3, 4], &rem(&1, 2) == 0)  # => [2, 4]
Enum.reduce([1, 2, 3], 0, &+/2)           # => 6
Enum.sum([1, 2, 3])                        # => 6
```

`Enum` works on any `Enumerable` — lists, maps, ranges, streams.

## vs other languages

| | Elixir | Python | JavaScript | Go |
|---|---|---|---|---|
| Underlying structure | Linked list | Dynamic array | Dynamic array | Slice (array-backed) |
| Prepend cost | O(1) | O(n) amortized | O(n) | O(1) with copy-on-grow |
| Append cost | O(n) | O(1) amortized | O(1) amortized | O(1) amortized |
| Mutation | Immutable | Mutable | Mutable | Mutable |
| Looping idiom | Recursion + `Enum` | `for` / comprehension | `for` / `.map` | `for range` |

The immutability is the critical point. `list = [0 | list]` does not modify `list` — it creates a new list that shares the tail with the old one. No copies of `tail` are made. This is why prepend is cheap and append is not.

## The task

Implement these functions in the `ListUtils` module without using `Enum` (except where noted):

1. `my_length(list)` — returns the number of elements using tail-recursive accumulator.
2. `my_sum(list)` — returns the sum of all elements, tail-recursive.
3. `my_reverse(list)` — reverses a list without `Enum.reverse`, tail-recursive.
4. `my_map(list, fun)` — applies `fun` to every element, returns new list. Hint: build the result in reverse then reverse it once, or use the naive head-recursive version (both are acceptable here).
5. `flatten(list)` — flattens one level of nesting: `[[1,2],[3,4]]` → `[1,2,3,4]`. You may use `Enum.concat/1` or `++`.
