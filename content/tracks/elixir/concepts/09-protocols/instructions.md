## What you build

You write a `Serializable` protocol and implement it for integers, floats, strings and lists. A protocol gives polymorphism: one contract, with a separate implementation for each data type. This lesson builds on **Enum & Streams**.

## Key concepts

### `defprotocol` declares a contract

A protocol lists functions with no implementation. Elixir then dispatches each call on the data type of the first argument.

```elixir
defprotocol Describable do
  @doc "Describes a value for people."
  def describe(value)
end
```

### `defimpl` implements it for one type

```elixir
defimpl Describable, for: Integer do
  def describe(n), do: "integer #{n}"
end

defimpl Describable, for: BitString do
  def describe(s), do: "string \"#{s}\""
end

Describable.describe(42)
# => "integer 42"
Describable.describe("hello")
# => "string \"hello\""
```

`for:` accepts `Integer`, `Float`, `BitString`, `List`, `Map`, `Atom`, `Tuple`, `Function`, `PID`, `Any`, or a struct name.

### You can implement a protocol for any type

You can add `Describable` to `Integer` without a change to `Integer`. This works for types from libraries you do not control. In Java, you need a wrapper class or a utility method instead.

### A struct can have its own implementation

```elixir
defmodule Circle do
  defstruct radius: 0
end

defimpl Describable, for: Circle do
  def describe(%Circle{radius: r}),
    do: "circle with radius #{r}"
end
```

### `@derive` uses the `Any` fallback

When a protocol sets `@fallback_to_any true` and has an `Any` implementation, a struct can opt in with `@derive`.

```elixir
defprotocol Printable do
  @fallback_to_any true
  def print(value)
end

defimpl Printable, for: Any do
  def print(v), do: inspect(v)
end

defmodule Point do
  @derive Printable
  defstruct x: 0, y: 0
end
```

### Protocols dispatch on data, behaviours on modules

A protocol is for different data types that respond to the same operation. It needs no process. A behaviour is a contract for modules that plug into a framework, such as `GenServer` or `Supervisor`.

## Watch out

- Every module, including a `defimpl` block, imports `Kernel`. `Kernel` defines `byte_size/1`, `bit_size/1`, `map_size/1`, `tuple_size/1` and `length/1`.
- A protocol function with one of these names clashes with the import. A call to it in a `defimpl` fails to compile.
- The error is `imported Kernel.byte_size/1 conflicts with local function`.
- Pick a name that is not in `Kernel`. This lesson uses `byte_length/1` for that reason.
- To keep the name, add `import Kernel, except: [byte_size: 1]` to the `defimpl` block.
- `for: Integer` matches only integers, not floats. Protocols do not convert numbers.
- A missing `defimpl` raises `Protocol.UndefinedError` at runtime. Any module can add an implementation later, so the compiler cannot check all types.

## The task

Define a `Serializable` protocol for a small logging layer. It has two functions:

- `serialize(value)` returns a string form of `value`.
- `byte_length(value)` returns the byte size of that string form.

Implement both functions for four types:

1. `Integer`: return `"int:#{n}"`.
2. `Float`: return `"float:#{f}"`, where `f` is `:erlang.float_to_binary(n, decimals: 2)`.
3. `BitString`: return `"str:#{s}"`.
4. `List`: return `"list:[#{items}]"`. `items` is the serialized form of each element, joined with commas and no spaces.
5. For every type, `byte_length/1` returns `byte_size(serialize(value))`. `byte_size/1` here is the `Kernel` function.

A list can mix types, and each element dispatches to its own implementation. An empty string gives `"str:"`. An empty list gives `"list:[]"`.

```elixir
Serializable.serialize(42)    # => "int:42"
Serializable.serialize(0)     # => "int:0"
Serializable.serialize(-7)    # => "int:-7"
Serializable.serialize(3.14)
# => "float:3.14"
Serializable.serialize(1.0)
# => "float:1.00"
Serializable.serialize("hello")
# => "str:hello"
Serializable.serialize("")    # => "str:"
Serializable.serialize([1, 2, 3])
# => "list:[int:1,int:2,int:3]"
Serializable.serialize([])
# => "list:[]"
Serializable.serialize([1, "a"])
# => "list:[int:1,str:a]"

# byte_size("int:42")
Serializable.byte_length(42)       # => 6
# byte_size("str:hello")
Serializable.byte_length("hello")  # => 9
# byte_size("list:[int:1,int:2]")
Serializable.byte_length([1, 2])   # => 18
# byte_size("float:1.00")
Serializable.byte_length(1.0)      # => 10
```
