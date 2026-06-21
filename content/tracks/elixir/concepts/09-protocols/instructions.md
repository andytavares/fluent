# Protocols

## What you'll learn

Protocols are Elixir's mechanism for polymorphism. A protocol defines a contract (a set of functions) and you implement that contract for any data type — including built-in types and types defined in third-party libraries you don't control.

## Key concepts

**Defining a protocol:**

```elixir
defprotocol Describable do
  @doc "Returns a human-readable description of a value."
  def describe(value)
end
```

This defines `Describable.describe/1` but provides no implementation. The protocol is now available as a dispatch target.

**Implementing a protocol:**

```elixir
defimpl Describable, for: Integer do
  def describe(n), do: "integer #{n}"
end

defimpl Describable, for: BitString do
  def describe(s), do: "string \"#{s}\""
end

Describable.describe(42)       # => "integer 42"
Describable.describe("hello")  # => "string \"hello\""
```

`for:` accepts any type: `Integer`, `Float`, `BitString`, `List`, `Map`, `Atom`, `Tuple`, `Function`, `PID`, `Any`, or a struct name.

**Implementing for your own struct:**

```elixir
defmodule Circle do
  defstruct radius: 0
end

defimpl Describable, for: Circle do
  def describe(%Circle{radius: r}), do: "circle with radius #{r}"
end
```

**`@derive` shortcut** lets a struct opt into a protocol if the protocol defines a fallback using `Any`:

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

**Protocols vs Behaviours:**

- **Protocol**: polymorphism across data types. You dispatch on the *data*. No process required.
- **Behaviour**: a contract for module implementations — primarily used for OTP callbacks (`GenServer`, `Supervisor`). You dispatch on the *module*, not data.

Use a protocol when different *types* need to respond to the same operation. Use a behaviour when different *modules* need to plug into the same framework.

## vs other languages

| | Elixir Protocol | Go Interface | Haskell Typeclass | Java Interface |
|---|---|---|---|---|
| Dispatch on | Data type | Structural (implicit) | Type at compile time | Object type |
| Open extensibility | Yes — add impls anywhere | Yes — implicit | Yes — orphan instances | No — must implement at definition |
| Retroactive impl | Yes | Yes (implicit) | Yes (with caveats) | No |
| Performance | Runtime dispatch (fast) | Interface table (fast) | Dictionary-passing | vtable |

The big advantage over Go and Java: you can implement a protocol for a type you don't own. You can add `Describable` to `Integer` without touching the Integer source. In Java you'd need a wrapper class or a utility method.

## The task

Define a `Serializable` protocol and implement it for several types:

**Protocol:**
- `Serializable.serialize(value)` — returns a string representation suitable for logging/storage.
- `Serializable.byte_size(value)` — returns the byte size of the serialized form.

**Implementations to write:**

1. For `Integer`: serialize as `"int:#{n}"`, e.g. `"int:42"`.
2. For `Float`: serialize as `"float:#{n}"`, e.g. `"float:3.14"`. Use `:erlang.float_to_binary(n, [decimals: 2])` for consistent formatting.
3. For `BitString` (strings): serialize as `"str:#{s}"`, e.g. `"str:hello"`.
4. For `List`: serialize as `"list:[#{items}]"` where items are comma-joined serialized elements, e.g. `"list:[int:1,int:2,int:3]"`.

For `byte_size/1`: in all cases, derive it from `byte_size(serialize(value))`.
